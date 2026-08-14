import { Component, OnInit, OnDestroy, inject, signal, computed, ElementRef, ViewChild, AfterViewInit, effect, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { StorageService } from '../../services/storage.service';
import { GeolocationService } from '../../services/geolocation.service';
import { SettingsService } from '../../services/settings.service';
import { Course, Hole, CourseObject, ObjectType } from '../../models/course.model';
import { Round, DistanceUnit, Score, FairwayHit, Shot } from '../../models/round.model';
import { LatLng } from '../../models/geo.model';

import * as L from 'leaflet';

import { MapComponent } from '../map/map.component';

export interface HazardDistance {
  object: CourseObject;
  distance: number; // in meters
  displayDistance: number;
}

@Component({
  selector: 'app-play-round',
  standalone: true,
  imports: [CommonModule, RouterModule, MapComponent],
  templateUrl: './play-round.component.html',
  styleUrl: './play-round.component.css'
})
export class PlayRoundComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly storage = inject(StorageService);
  readonly geoService = inject(GeolocationService);
  readonly settingsService = inject(SettingsService);

  @ViewChild('mapContainer') mapContainer!: ElementRef<HTMLDivElement>;

  @HostListener('window:resize')
  onResize(): void {
    if (this.map) {
      this.map.invalidateSize();
    }
  }

  // Signal State
  readonly round = signal<Round | null>(null);
  readonly course = signal<Course | null>(null);
  readonly currentHoleNumber = signal<number>(1);
  readonly unit = computed<DistanceUnit>(() => this.settingsService.unit() === 'y' ? 'yards' : 'meters');
  readonly measurePoint = signal<{ position: LatLng; distanceMeters: number } | null>(null);

  // Add Hazard Modal State
  readonly isAddHazardModalOpen = signal<boolean>(false);
  readonly newHazardType = signal<ObjectType>('bunker');
  readonly newHazardName = signal<string>('');

  // Shot Tracking State & Modal
  readonly isClubModalOpen = signal<boolean>(false);
  readonly availableClubs: string[] = [
    'Driver', '3W', '5W', 'Hybrid',
    'Järn 4', 'Järn 5', 'Järn 6', 'Järn 7', 'Järn 8', 'Järn 9',
    'PW', 'GW', 'SW', 'LW', 'Putter'
  ];

  // Map instance reference
  private map: any = null;
  private playerMarker: any = null;
  private greenMarkers: any[] = [];
  private hazardMarkers: any[] = [];
  private measureLine: any = null;
  private measureMarker: any = null;

  constructor() {
    effect(() => {
      const hole = this.currentHole();
      if (this.map && hole) {
        this.updateMapLayers();
        this.centerMapOnGreenOrPlayer();
      }
    });
  }

  // Computed Properties
  readonly currentHole = computed<Hole | undefined>(() => {
    const c = this.course();
    const hNum = this.currentHoleNumber();
    return c?.holes.find((h) => h.number === hNum);
  });

  readonly userPos = computed<LatLng | null>(() => {
    const pos = this.geoService.currentPosition();
    return pos ? { lat: pos.lat, lng: pos.lng } : null;
  });

  readonly gpsAccuracy = computed<number | null>(() => this.geoService.currentPosition()?.accuracy ?? null);

  readonly gpsQualityClass = computed<'gps-high' | 'gps-medium' | 'gps-low'>(() => {
    const acc = this.gpsAccuracy();
    if (acc === null) return 'gps-low';
    if (acc <= 5) return 'gps-high';
    if (acc <= 15) return 'gps-medium';
    return 'gps-low';
  });

  readonly gpsAccuracyText = computed<string>(() => {
    const acc = this.gpsAccuracy();
    if (acc === null) return 'Söker GPS...';
    return `±${Math.round(acc)}m`;
  });

  readonly currentScore = computed<Score | undefined>(() => {
    const r = this.round();
    const hNum = this.currentHoleNumber();
    return r?.scores.find((s) => s.holeNumber === hNum);
  });

  readonly relativeScoreText = computed<string>(() => {
    const r = this.round();
    if (!r) return 'E';
    const played = r.scores.filter((s) => s.strokes > 0);
    if (played.length === 0) return 'E';
    const totalStrokes = played.reduce((sum, s) => sum + s.strokes, 0);
    const totalPar = played.reduce((sum, s) => sum + s.par, 0);
    const diff = totalStrokes - totalPar;
    if (diff === 0) return 'E';
    return diff > 0 ? `+${diff}` : `${diff}`;
  });

  readonly currentHoleShots = computed<Shot[]>(() => {
    const r = this.round();
    const hNum = this.currentHoleNumber();
    if (!r || !r.shots) return [];
    return r.shots.filter((s) => s.holeNumber === hNum);
  });

  // --- Shot Tracking Methods ---

  openRegisterShotModal(): void {
    this.isClubModalOpen.set(true);
  }

  closeClubModal(): void {
    this.isClubModalOpen.set(false);
  }

  registerShot(club?: string): void {
    const r = this.round();
    const pos = this.userPos() || this.measurePoint()?.position;
    if (!r || !pos) {
      alert('Hittade ingen GPS-position för att registrera slag. Slå på GPS eller klicka på kartan.');
      return;
    }

    const holeShots = this.currentHoleShots();
    let startPos: LatLng;

    if (holeShots.length > 0) {
      startPos = holeShots[holeShots.length - 1].endPosition;
    } else {
      const g = this.currentHole()?.green;
      startPos = g?.front?.lat ? g.front : pos;
    }

    const distMeters = this.calculateDistance(startPos, pos);

    const newShot: Shot = {
      id: `shot-${Date.now()}`,
      holeNumber: this.currentHoleNumber(),
      startPosition: startPos,
      endPosition: pos,
      distanceMeters: distMeters,
      club: club || undefined,
      timestamp: new Date().toISOString()
    };

    if (!r.shots) r.shots = [];
    r.shots.push(newShot);

    this.updateStrokes(1);
    this.round.set({ ...r });
    this.storage.saveRound(r);
    this.closeClubModal();
  }

  undoLastShot(): void {
    const r = this.round();
    const hNum = this.currentHoleNumber();
    if (!r || !r.shots) return;

    const holeShots = r.shots.filter((s) => s.holeNumber === hNum);
    if (holeShots.length === 0) return;

    const lastShot = holeShots[holeShots.length - 1];
    r.shots = r.shots.filter((s) => s.id !== lastShot.id);

    this.updateStrokes(-1);
    this.round.set({ ...r });
    this.storage.saveRound(r);
  }

  updateStrokes(delta: number): void {
    const r = this.round();
    const hNum = this.currentHoleNumber();
    if (!r) return;

    let score = r.scores.find((s) => s.holeNumber === hNum);
    const par = this.currentHole()?.par || 4;

    if (!score) {
      score = {
        holeNumber: hNum,
        par,
        strokes: 0,
        putts: 0,
        gir: false,
        bunkerShots: 0,
        chips: 0
      };
      r.scores.push(score);
    }

    let newStrokes = score.strokes + delta;
    if (newStrokes < 0) newStrokes = 0;

    score.strokes = newStrokes;
    score.par = par;
    if (newStrokes > 0 && score.putts === 0) {
      score.putts = Math.min(2, newStrokes);
    }
    if (score.putts > newStrokes) {
      score.putts = newStrokes;
    }
    score.gir = newStrokes > 0 && (newStrokes - score.putts <= par - 2);

    this.round.set({ ...r });
    this.storage.saveRound(r);
  }

  updatePutts(delta: number): void {
    const r = this.round();
    const hNum = this.currentHoleNumber();
    if (!r) return;

    let score = r.scores.find((s) => s.holeNumber === hNum);
    const par = this.currentHole()?.par || 4;

    if (!score) {
      score = {
        holeNumber: hNum,
        par,
        strokes: 0,
        putts: 0,
        gir: false,
        bunkerShots: 0,
        chips: 0
      };
      r.scores.push(score);
    }

    let newPutts = score.putts + delta;
    if (newPutts < 0) newPutts = 0;
    if (score.strokes > 0 && newPutts > score.strokes) newPutts = score.strokes;

    score.putts = newPutts;
    score.gir = score.strokes > 0 && (score.strokes - newPutts <= par - 2);

    this.round.set({ ...r });
    this.storage.saveRound(r);
  }

  setFairwayHit(hit: FairwayHit): void {
    const r = this.round();
    const hNum = this.currentHoleNumber();
    if (!r) return;

    let score = r.scores.find((s) => s.holeNumber === hNum);
    if (!score) {
      score = {
        holeNumber: hNum,
        par: this.currentHole()?.par || 4,
        strokes: 0,
        putts: 0,
        gir: false,
        bunkerShots: 0,
        chips: 0
      };
      r.scores.push(score);
    }

    score.fairwayHit = hit;
    this.round.set({ ...r });
    this.storage.saveRound(r);
  }

  async finishRound(): Promise<void> {
    const r = this.round();
    if (!r) return;

    if (confirm('Vill du avsluta och spara rundan?')) {
      await this.storage.completeRound(r.id);
      this.router.navigate(['/history']);
    }
  }

  // Distances calculations (in meters)
  readonly distanceFrontMeters = computed<number | null>(() => {
    const p = this.userPos();
    const green = this.currentHole()?.green;
    if (!p || !green?.front?.lat) return null;
    return this.calculateDistance(p, green.front);
  });

  readonly distanceCenterMeters = computed<number | null>(() => {
    const p = this.userPos();
    const green = this.currentHole()?.green;
    if (!p || !green?.center?.lat) return null;
    return this.calculateDistance(p, green.center);
  });

  readonly distanceBackMeters = computed<number | null>(() => {
    const p = this.userPos();
    const green = this.currentHole()?.green;
    if (!p || !green?.back?.lat) return null;
    return this.calculateDistance(p, green.back);
  });

  readonly hazardDistances = computed<HazardDistance[]>(() => {
    const p = this.userPos();
    const hole = this.currentHole();
    if (!hole || !hole.objects) return [];
    
    const isYards = this.unit() === 'yards';
    const multiplier = isYards ? 1.09361 : 1;

    return hole.objects.map((obj) => {
      const distMeters = p && obj.position?.lat ? this.calculateDistance(p, obj.position) : 0;
      return {
        object: obj,
        distance: distMeters,
        displayDistance: Math.round(distMeters * multiplier)
      };
    });
  });

  // Display Distances adjusted for Unit (m vs yd)
  readonly displayFront = computed<number | null>(() => this.formatDistance(this.distanceFrontMeters()));
  readonly displayCenter = computed<number | null>(() => this.formatDistance(this.distanceCenterMeters()));
  readonly displayBack = computed<number | null>(() => this.formatDistance(this.distanceBackMeters()));

  async ngOnInit(): Promise<void> {
    this.geoService.startTracking();

    const roundId = this.route.snapshot.paramMap.get('roundId');
    if (roundId) {
      const r = await this.storage.getRound(roundId);
      if (r) {
        this.round.set(r);
        if (r.unit) {
          this.settingsService.setUnit(r.unit === 'yards' ? 'y' : 'm');
        }
        this.currentHoleNumber.set(r.currentHole || 1);
        const c = await this.storage.getCourse(r.courseId);
        if (c) this.course.set(c);
      } else {
        this.router.navigate(['/courses']);
      }
    } else {
      // Check active round
      const active = this.storage.activeRound();
      if (active) {
        this.router.navigate(['/play', active.id]);
      } else {
        this.router.navigate(['/courses']);
      }
    }
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  // --- Unit Toggle ---
  toggleUnit(): void {
    const next = this.settingsService.unit() === 'm' ? 'y' : 'm';
    this.settingsService.setUnit(next);
    const r = this.round();
    if (r) {
      r.unit = next === 'y' ? 'yards' : 'meters';
      this.storage.saveRound(r);
    }
  }

  // --- Navigation between holes ---
  nextHole(): void {
    const total = this.course()?.holesCount || 18;
    if (this.currentHoleNumber() < total) {
      this.setHole(this.currentHoleNumber() + 1);
    }
  }

  prevHole(): void {
    if (this.currentHoleNumber() > 1) {
      this.setHole(this.currentHoleNumber() - 1);
    }
  }

  setHole(holeNum: number): void {
    this.currentHoleNumber.set(holeNum);
    this.clearMeasure();
    const r = this.round();
    if (r) {
      r.currentHole = holeNum;
      this.storage.saveRound(r);
    }
    this.updateMapLayers();
    this.centerMapOnGreenOrPlayer();
  }

  // --- Map & GPS Interactions ---
  private initMap(): void {
    if (!this.mapContainer) return;

    // Default center (Stockholm area or fallback)
    const initialCenter: [number, number] = [59.55140, 17.54140];
    this.map = L.map(this.mapContainer.nativeElement, {
      zoomControl: false,
      attributionControl: false
    }).setView(initialCenter, 16);

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19
    }).addTo(this.map);

    // Invalidate size multiple times to ensure Leaflet calculates correct canvas size after paint
    [50, 200, 500].forEach((delay) => {
      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize();
        }
      }, delay);
    });

    // Map click for Touch to Measure
    this.map.on('click', (e: any) => {
      this.handleMapClick(e.latlng);
    });

    this.updateMapLayers();
    this.centerMapOnGreenOrPlayer();

    // Effect/Subscription to GPS updates
    let lastLat = 0;
    let lastLng = 0;
    setInterval(() => {
      const pos = this.userPos();
      if (pos && (pos.lat !== lastLat || pos.lng !== lastLng)) {
        lastLat = pos.lat;
        lastLng = pos.lng;
        this.updatePlayerMarker(pos);
        if (this.measurePoint()) {
          this.drawMeasureLine();
        }
      }
    }, 1000);
  }

  centerOnPlayer(): void {
    const pos = this.userPos();
    if (pos && pos.lat && pos.lng && this.map) {
      this.map.setView([pos.lat, pos.lng], 18);
    }
  }

  centerOnGreen(): void {
    const green = this.currentHole()?.green;
    const target = green?.center?.lat ? green.center : (green?.front?.lat ? green.front : green?.back);
    if (target?.lat && target?.lng && this.map) {
      this.map.setView([target.lat, target.lng], 18);
    }
  }

  private centerMapOnGreenOrPlayer(): void {
    const green = this.currentHole()?.green;
    const target = green?.center?.lat ? green.center : (green?.front?.lat ? green.front : green?.back);
    if (target?.lat && target?.lng && this.map) {
      this.centerOnGreen();
    } else {
      const pos = this.userPos();
      if (pos && pos.lat && pos.lng && this.map) {
        this.centerOnPlayer();
      } else if (this.map) {
        this.map.setView([59.55140, 17.54140], 16);
      }
    }
  }

  private updatePlayerMarker(pos: LatLng): void {
    if (!this.map) return;

    const playerIcon = L.divIcon({
      className: 'custom-player-marker',
      html: `
        <div class="player-dot-pulse"></div>
        <div class="player-dot-core"></div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    if (this.playerMarker) {
      this.playerMarker.setLatLng([pos.lat, pos.lng]);
    } else {
      this.playerMarker = L.marker([pos.lat, pos.lng], { icon: playerIcon }).addTo(this.map);
    }
  }

  private updateMapLayers(): void {
    if (!this.map) return;

    // Clear old markers
    this.greenMarkers.forEach((m) => m.remove());
    this.greenMarkers = [];
    this.hazardMarkers.forEach((m) => m.remove());
    this.hazardMarkers = [];

    const hole = this.currentHole();
    if (!hole) return;

    // Green markers
    if (hole.green) {
      const g = hole.green;
      if (g.front?.lat) this.addGreenMarker(g.front, 'F', '#4ade80');
      if (g.center?.lat) this.addGreenMarker(g.center, 'C', '#22c55e');
      if (g.back?.lat) this.addGreenMarker(g.back, 'B', '#15803d');
    }

    // Hazard markers
    if (hole.objects) {
      hole.objects.forEach((obj) => {
        if (obj.position?.lat) {
          const color = obj.type === 'water' ? '#3b82f6' : (obj.type === 'bunker' ? '#f59e0b' : '#10b981');
          const icon = L.divIcon({
            className: 'custom-hazard-marker',
            html: `<div class="hazard-badge" style="background:${color}">${obj.name[0]?.toUpperCase() || 'H'}</div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          });
          const marker = L.marker([obj.position.lat, obj.position.lng], { icon }).addTo(this.map);
          marker.bindTooltip(obj.name, { permanent: false });
          this.hazardMarkers.push(marker);
        }
      });
    }
  }

  private addGreenMarker(pos: LatLng, label: string, color: string): void {
    const icon = L.divIcon({
      className: 'custom-green-marker',
      html: `<div class="green-badge" style="background:${color}">${label}</div>`,
      iconSize: [22, 22],
      iconAnchor: [11, 11]
    });
    const m = L.marker([pos.lat, pos.lng], { icon }).addTo(this.map);
    this.greenMarkers.push(m);
  }

  // --- Touch to Measure ---
  private handleMapClick(latlng: { lat: number; lng: number }): void {
    const user = this.userPos();
    if (!user) return;

    const targetPos: LatLng = { lat: latlng.lat, lng: latlng.lng };
    const distMeters = this.calculateDistance(user, targetPos);

    this.measurePoint.set({
      position: targetPos,
      distanceMeters: distMeters
    });

    this.drawMeasureLine();
  }

  private drawMeasureLine(): void {
    if (!this.map) return;

    const user = this.userPos();
    const mp = this.measurePoint();
    if (!user || !mp) return;

    if (this.measureLine) this.measureLine.remove();
    if (this.measureMarker) this.measureMarker.remove();

    const isYards = this.unit() === 'yards';
    const displayDist = Math.round(mp.distanceMeters * (isYards ? 1.09361 : 1));
    const unitLabel = isYards ? 'yd' : 'm';

    // Dashed orange line from player to touch point
    this.measureLine = L.polyline(
      [
        [user.lat, user.lng],
        [mp.position.lat, mp.position.lng]
      ],
      {
        color: '#c67139',
        weight: 3,
        dashArray: '6, 6'
      }
    ).addTo(this.map);

    const measureIcon = L.divIcon({
      className: 'custom-measure-marker',
      html: `<div class="measure-pill">${displayDist} ${unitLabel}</div>`,
      iconSize: [60, 24],
      iconAnchor: [30, 12]
    });

    this.measureMarker = L.marker([mp.position.lat, mp.position.lng], { icon: measureIcon }).addTo(this.map);
  }

  clearMeasure(): void {
    this.measurePoint.set(null);
    if (this.measureLine) {
      this.measureLine.remove();
      this.measureLine = null;
    }
    if (this.measureMarker) {
      this.measureMarker.remove();
      this.measureMarker = null;
    }
  }

  // --- Snabbregistrera Hinder ---
  openAddHazardModal(): void {
    this.newHazardType.set('bunker');
    this.newHazardName.set('');
    this.isAddHazardModalOpen.set(true);
  }

  closeAddHazardModal(): void {
    this.isAddHazardModalOpen.set(false);
  }

  onHazardTypeChange(type: ObjectType): void {
    this.newHazardType.set(type);
  }

  onHazardNameChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.newHazardName.set(input.value);
  }

  async saveNewHazard(): Promise<void> {
    const c = this.course();
    const holeNum = this.currentHoleNumber();
    const userP = this.userPos();
    const mP = this.measurePoint();
    const pos = mP?.position || userP;

    if (!c || !pos) {
      alert('Ingen GPS- eller kartposition tillgänglig för hindret ännu.');
      return;
    }

    const holeIndex = c.holes.findIndex((h) => h.number === holeNum);
    if (holeIndex === -1) return;

    const defaultNames: Record<ObjectType, string> = {
      bunker: 'Bunker',
      water: 'Vattenhinder',
      tree: 'Träd / Hinder',
      custom: 'Hinder'
    };

    const newObj: CourseObject = {
      id: `obj-${Date.now()}`,
      type: this.newHazardType(),
      name: this.newHazardName().trim() || defaultNames[this.newHazardType()],
      position: pos
    };

    c.holes[holeIndex].objects.push(newObj);
    await this.storage.saveCourse(c);
    this.course.set({ ...c });

    this.updateMapLayers();
    this.closeAddHazardModal();
  }

  // --- Helper math & format ---
  formatDistance(meters: number | null): number | null {
    if (meters === null) return null;
    const mult = this.unit() === 'yards' ? 1.09361 : 1;
    return Math.round(meters * mult);
  }

  private calculateDistance(p1: LatLng, p2: LatLng): number {
    const R = 6371000; // Earth radius in meters
    const dLat = this.toRad(p2.lat - p1.lat);
    const dLng = this.toRad(p2.lng - p1.lng);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(p1.lat)) * Math.cos(this.toRad(p2.lat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  }

  private toRad(val: number): number {
    return (val * Math.PI) / 180;
  }
}
