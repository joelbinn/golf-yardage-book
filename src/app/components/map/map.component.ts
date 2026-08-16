import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
  effect,
  inject,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { LatLng } from '../../models/geo.model';
import { CourseObject, Green } from '../../models/course.model';
import { Shot } from '../../models/round.model';
import { GeolocationService } from '../../services/geolocation.service';

const ESRI_WORLD_IMAGERY =
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
const ESRI_ATTRIBUTION =
  'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USGS, GeoEye';

const HAZARD_COLORS: Record<string, string> = {
  bunker: '#e1cfa8',
  water: '#3c5f6b',
  tree: '#8fa073',
  custom: '#c67139'
};

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map.component.html',
  styleUrl: './map.component.css'
})
export class MapComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef<HTMLDivElement>;

  @Input() initialCenter: LatLng = { lat: 59.3293, lng: 18.0686 };
  @Input() initialZoom = 17;
  @Input() greenPoints?: Partial<Green>;
  @Input() hazards?: CourseObject[];
  @Input() shots?: Shot[];
  @Input() unitLabel: 'm' | 'yd' = 'm';
  @Input() enableMeasureMode = true;

  @Output() mapClick = new EventEmitter<LatLng>();

  private geoService = inject(GeolocationService);

  private map: L.Map | null = null;
  private userMarker: L.Marker | null = null;
  private accuracyCircle: L.Circle | null = null;
  private measureMarker: L.Marker | null = null;
  private measureLine: L.Polyline | null = null;
  private greenMarkers: L.Marker[] = [];
  private hazardMarkers: L.Marker[] = [];
  private shotMarkers: L.Marker[] = [];
  private shotLines: L.Polyline[] = [];

  readonly measuredDistanceMeters = signal<number | null>(null);
  readonly measuredDistanceYards = signal<number | null>(null);
  readonly selectedPoint = signal<LatLng | null>(null);

  constructor() {
    effect(() => {
      const pos = this.geoService.currentPosition();
      if (pos && this.map) {
        this.updateUserPositionOnMap(pos);
      }
    });
  }

  ngOnInit(): void {
    this.initMap();
    this.geoService.startTracking();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.map) {
      if (changes['greenPoints']) {
        this.renderGreenMarkers();
      }
      if (changes['hazards']) {
        this.renderHazardMarkers();
      }
      if (changes['shots']) {
        this.renderShotChain();
      }
      if (changes['unitLabel'] && this.selectedPoint()) {
        this.recalculateDistance();
      }
    }
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  private initMap(): void {
    const container = this.mapContainer.nativeElement;

    this.map = L.map(container, {
      center: [this.initialCenter.lat, this.initialCenter.lng],
      zoom: this.initialZoom,
      maxZoom: 19,
      zoomControl: false
    });

    L.tileLayer(ESRI_WORLD_IMAGERY, {
      attribution: ESRI_ATTRIBUTION,
      maxZoom: 19
    }).addTo(this.map);

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      const point: LatLng = { lat: e.latlng.lat, lng: e.latlng.lng };
      this.mapClick.emit(point);
      if (this.enableMeasureMode) {
        this.setMeasureTarget(point);
      }
    });

    this.renderGreenMarkers();
    this.renderHazardMarkers();
    this.renderShotChain();
  }

  private renderShotChain(): void {
    if (!this.map) return;
    this.shotMarkers.forEach((m) => m.remove());
    this.shotMarkers = [];
    this.shotLines.forEach((l) => l.remove());
    this.shotLines = [];

    if (!this.shots || this.shots.length === 0) return;

    this.shots.forEach((shot, index) => {
      if (shot.startPosition && shot.endPosition) {
        const polyline = L.polyline(
          [
            [shot.startPosition.lat, shot.startPosition.lng],
            [shot.endPosition.lat, shot.endPosition.lng]
          ],
          {
            color: '#22c55e',
            weight: 3,
            dashArray: '5, 5',
            opacity: 0.95
          }
        ).addTo(this.map!);
        this.shotLines.push(polyline);

        const distDisplay = this.unitLabel === 'yd'
          ? Math.round(shot.distanceMeters * 1.09361)
          : Math.round(shot.distanceMeters);

        const labelText = shot.club
          ? `S${index + 1} (${shot.club}: ${distDisplay}${this.unitLabel})`
          : `S${index + 1}: ${distDisplay}${this.unitLabel}`;

        const icon = L.divIcon({
          className: 'shot-marker-badge',
          html: `<div style="background:#201e1d;color:#fffdf9;padding:2px 6px;border-radius:10px;font-size:10px;font-weight:bold;border:1.5px solid #22c55e;white-space:nowrap;box-shadow:0 2px 4px rgba(0,0,0,0.4)">${labelText}</div>`,
          iconSize: [60, 20],
          iconAnchor: [30, 10]
        });

        const marker = L.marker([shot.endPosition.lat, shot.endPosition.lng], { icon }).addTo(this.map!);
        this.shotMarkers.push(marker);
      }
    });
  }

  private updateUserPositionOnMap(pos: { lat: number; lng: number; accuracy: number }): void {
    if (!this.map) return;

    const latLng: L.LatLngExpression = [pos.lat, pos.lng];

    if (!this.accuracyCircle) {
      this.accuracyCircle = L.circle(latLng, {
        radius: pos.accuracy,
        color: '#3b82f6',
        fillColor: '#3b82f6',
        fillOpacity: 0.15,
        weight: 1
      }).addTo(this.map);
    } else {
      this.accuracyCircle.setLatLng(latLng);
      this.accuracyCircle.setRadius(pos.accuracy);
    }

    if (!this.userMarker) {
      const userIcon = L.divIcon({
        className: 'custom-gps-marker',
        html: `
          <div class="gps-pulse-outer"></div>
          <div class="gps-dot"></div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      this.userMarker = L.marker(latLng, { icon: userIcon, zIndexOffset: 1000 }).addTo(this.map);
      this.map.setView(latLng, 17);
    } else {
      this.userMarker.setLatLng(latLng);
    }

    if (this.selectedPoint()) {
      this.recalculateDistance();
    }
  }

  private renderGreenMarkers(): void {
    if (!this.map) return;
    this.greenMarkers.forEach((m) => m.remove());
    this.greenMarkers = [];

    if (!this.greenPoints) return;

    const points: Array<{ key: 'front' | 'center' | 'back'; label: string; color: string }> = [
      { key: 'front', label: 'F', color: '#f5ead8' },
      { key: 'center', label: 'C', color: '#c67139' },
      { key: 'back', label: 'B', color: '#f5ead8' }
    ];

    points.forEach((p) => {
      const coord = this.greenPoints?.[p.key];
      if (coord && coord.lat && coord.lng) {
        const icon = L.divIcon({
          className: 'green-marker',
          html: `<div style="background:${p.color};color:#201e1d;width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:11px;border:2px solid #201e1d;box-shadow:0 2px 6px rgba(0,0,0,0.4)">${p.label}</div>`,
          iconSize: [22, 22],
          iconAnchor: [11, 11]
        });
        const marker = L.marker([coord.lat, coord.lng], { icon }).addTo(this.map!);
        this.greenMarkers.push(marker);
      }
    });
  }

  private renderHazardMarkers(): void {
    if (!this.map) return;
    this.hazardMarkers.forEach((m) => m.remove());
    this.hazardMarkers = [];

    if (!this.hazards) return;

    this.hazards.forEach((h) => {
      if (h.position && h.position.lat && h.position.lng) {
        const bg = HAZARD_COLORS[h.type] || '#c67139';
        const icon = L.divIcon({
          className: 'hazard-marker',
          html: `<div style="background:${bg};width:16px;height:16px;border-radius:50%;border:2px solid #201e1d;box-shadow:0 2px 5px rgba(0,0,0,0.3)" title="${h.name}"></div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        });
        const marker = L.marker([h.position.lat, h.position.lng], { icon }).addTo(this.map!);
        this.hazardMarkers.push(marker);
      }
    });
  }

  setMeasureTarget(target: LatLng): void {
    if (!this.map) return;

    this.selectedPoint.set(target);
    this.recalculateDistance();
  }

  recalculateDistance(): void {
    const target = this.selectedPoint();
    if (!target || !this.map) return;

    const gpsPos = this.geoService.currentPosition();
    const origin = gpsPos ? { lat: gpsPos.lat, lng: gpsPos.lng } : this.initialCenter;

    const distMeters = this.geoService.calculateDistanceMeters(origin, target);
    const distYards = this.geoService.metersToYards(distMeters);

    this.measuredDistanceMeters.set(distMeters);
    this.measuredDistanceYards.set(distYards);

    const distDisplay = this.unitLabel === 'yd' ? Math.round(distYards) : Math.round(distMeters);
    const targetLatLng: L.LatLngExpression = [target.lat, target.lng];

    const targetIcon = L.divIcon({
      className: 'custom-target-marker',
      html: `
        <div class="target-marker-wrapper">
          <div class="target-crosshair"><span></span></div>
          <div class="target-distance-pill">${distDisplay} ${this.unitLabel}</div>
        </div>
      `,
      iconSize: [120, 36],
      iconAnchor: [15, 18]
    });

    if (this.measureMarker) {
      this.measureMarker.setLatLng(targetLatLng);
      this.measureMarker.setIcon(targetIcon);
    } else {
      this.measureMarker = L.marker(targetLatLng, { icon: targetIcon }).addTo(this.map);
    }

    const points: L.LatLngExpression[] = [
      [origin.lat, origin.lng],
      [target.lat, target.lng]
    ];

    if (this.measureLine) {
      this.measureLine.setLatLngs(points);
    } else {
      this.measureLine = L.polyline(points, {
        color: '#fbbf24',
        weight: 3,
        dashArray: '6, 6',
        opacity: 0.9
      }).addTo(this.map);
    }
  }

  clearMeasurement(): void {
    this.selectedPoint.set(null);
    this.measuredDistanceMeters.set(null);
    this.measuredDistanceYards.set(null);

    if (this.measureMarker && this.map) {
      this.map.removeLayer(this.measureMarker);
      this.measureMarker = null;
    }
    if (this.measureLine && this.map) {
      this.map.removeLayer(this.measureLine);
      this.measureLine = null;
    }
  }

  centerOnUser(): void {
    const pos = this.geoService.currentPosition();
    if (pos && this.map) {
      this.map.setView([pos.lat, pos.lng], 18, { animate: true });
    } else {
      this.geoService.startTracking();
    }
  }

  centerOnLocation(target: LatLng, zoom = 18): void {
    if (this.map && target && target.lat && target.lng) {
      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize();
          this.map.setView([target.lat, target.lng], zoom, { animate: true });
        }
      }, 30);
    }
  }

  centerOnGreen(): void {
    const green = this.greenPoints;
    const target = green?.center?.lat ? green.center : (green?.front?.lat ? green.front : green?.back);
    if (target?.lat && target?.lng) {
      this.centerOnLocation(target as LatLng, 18);
    }
  }

  invalidateSize(): void {
    if (this.map) {
      this.map.invalidateSize();
    }
  }

  hasGreenPosition(): boolean {
    const green = this.greenPoints;
    return !!(green?.center?.lat || green?.front?.lat || green?.back?.lat);
  }
}
