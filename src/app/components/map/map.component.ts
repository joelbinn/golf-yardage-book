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
import { CourseObject, Green, Tee, TargetLine } from '../../models/course.model';
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
  @Input() tees?: Tee[];
  @Input() targetLine?: TargetLine;
  @Input() shots?: Shot[];
  @Input() unitLabel: 'm' | 'yd' = 'm';
  @Input() enableMeasureMode = true;
  @Input() rotateToHole = false;

  @Output() mapClick = new EventEmitter<LatLng>();
  @Output() toggleOrientation = new EventEmitter<void>();

  onToggleOrientation(): void {
    this.toggleOrientation.emit();
  }

  private geoService = inject(GeolocationService);

  private map: L.Map | null = null;
  private userMarker: L.Marker | null = null;
  private accuracyCircle: L.Circle | null = null;
  private measureMarker: L.Marker | null = null;
  private measureLine: L.Polyline | null = null;
  private greenMarkers: L.Marker[] = [];
  private hazardMarkers: L.Marker[] = [];
  private teeMarkers: L.Marker[] = [];
  private targetPolyline: L.Polyline | null = null;
  private targetLineMarkers: L.Marker[] = [];
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
      if (changes['tees']) {
        this.renderTeeMarkers();
      }
      if (changes['targetLine'] || changes['tees'] || changes['greenPoints']) {
        this.renderTargetLine();
      }
      if (changes['shots']) {
        this.renderShotChain();
      }
      if (changes['rotateToHole'] || changes['targetLine'] || changes['tees'] || changes['greenPoints']) {
        this.updateMapRotation();
      }
      if (changes['greenPoints'] || changes['tees'] || changes['targetLine']) {
        this.fitHoleBounds();
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
      zoomControl: false,
      zoomSnap: 0.1
    });

    L.tileLayer(ESRI_WORLD_IMAGERY, {
      attribution: ESRI_ATTRIBUTION,
      maxZoom: 19
    }).addTo(this.map);

    this.setupDraggableRotationHook();

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      const point: LatLng = { lat: e.latlng.lat, lng: e.latlng.lng };
      this.mapClick.emit(point);
      if (this.enableMeasureMode) {
        this.setMeasureTarget(point);
      }
    });

    this.renderGreenMarkers();
    this.renderHazardMarkers();
    this.renderTeeMarkers();
    this.renderTargetLine();
    this.renderShotChain();
    this.updateMapRotation();
    this.fitHoleBounds();
  }

  private renderTeeMarkers(): void {
    if (!this.map) return;
    this.teeMarkers.forEach((m) => m.remove());
    this.teeMarkers = [];

    if (!this.tees || this.tees.length === 0) return;

    this.tees.forEach((t) => {
      if (t.position && t.position.lat && t.position.lng) {
        const icon = L.divIcon({
          className: 'tee-marker-badge',
          html: `<div style="background:${t.color || '#eab308'};color:#201e1d;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:bold;border:1.5px solid #201e1d;box-shadow:0 2px 5px rgba(0,0,0,0.4);white-space:nowrap">${t.name}</div>`,
          iconSize: [40, 20],
          iconAnchor: [20, 10]
        });
        const marker = L.marker([t.position.lat, t.position.lng], { icon }).addTo(this.map!);
        this.teeMarkers.push(marker);
      }
    });
  }

  private renderTargetLine(): void {
    if (!this.map) return;
    if (this.targetPolyline) {
      this.targetPolyline.remove();
      this.targetPolyline = null;
    }
    this.targetLineMarkers.forEach((m) => m.remove());
    this.targetLineMarkers = [];

    if (!this.targetLine) return;

    let startPoint: LatLng | undefined;
    if (this.targetLine.teeId && this.tees) {
      startPoint = this.tees.find((t) => t.id === this.targetLine!.teeId)?.position;
    }
    if (!startPoint && this.tees && this.tees.length > 0) {
      startPoint = this.tees[0].position;
    }
    if (!startPoint && this.targetLine.waypoints.length > 0) {
      startPoint = this.targetLine.waypoints[0];
    }

    const greenCenter = this.greenPoints?.center?.lat ? this.greenPoints.center : (this.greenPoints?.front?.lat ? this.greenPoints.front : this.greenPoints?.back);

    if (!startPoint) return;

    const allPoints: LatLng[] = [startPoint, ...this.targetLine.waypoints];
    if (greenCenter?.lat && greenCenter?.lng) {
      allPoints.push(greenCenter as LatLng);
    }

    if (allPoints.length < 2) return;

    const latLngs: L.LatLngExpression[] = allPoints.map((p) => [p.lat, p.lng]);

    this.targetPolyline = L.polyline(latLngs, {
      color: '#3b82f6',
      weight: 3,
      dashArray: '8, 8',
      opacity: 0.95
    }).addTo(this.map);

    let cumulativeDist = 0;
    for (let i = 0; i < allPoints.length - 1; i++) {
      const p1 = allPoints[i];
      const p2 = allPoints[i + 1];
      const segDistM = this.geoService.calculateDistanceMeters(p1, p2);
      cumulativeDist += segDistM;

      const segDisplay = this.unitLabel === 'yd'
        ? Math.round(this.geoService.metersToYards(segDistM))
        : Math.round(segDistM);
      const totalDisplay = this.unitLabel === 'yd'
        ? Math.round(this.geoService.metersToYards(cumulativeDist))
        : Math.round(cumulativeDist);

      const isLast = i === allPoints.length - 2;
      const labelText = isLast
        ? `${segDisplay}${this.unitLabel} (Tot: ${totalDisplay}${this.unitLabel})`
        : `${segDisplay}${this.unitLabel}`;

      const icon = L.divIcon({
        className: 'target-line-badge',
        html: `<div style="background:#201e1d;color:#60a5fa;padding:2px 7px;border-radius:10px;font-size:10px;font-weight:bold;border:1.5px solid #3b82f6;white-space:nowrap;box-shadow:0 2px 5px rgba(0,0,0,0.5)">${labelText}</div>`,
        iconSize: [60, 20],
        iconAnchor: [30, 10]
      });

      const marker = L.marker([p2.lat, p2.lng], { icon }).addTo(this.map);
      this.targetLineMarkers.push(marker);
    }
  }

  private currentRotationAngle = 0;
  private elementRef = inject(ElementRef);

  private setupDraggableRotationHook(): void {
    if (!this.map) return;
    const dragging = (this.map.dragging as any);
    if (!dragging || !dragging._draggable) return;

    const draggable = dragging._draggable;
    if (draggable._hasRotationHook) return;
    draggable._hasRotationHook = true;

    const self = this;
    draggable._onMove = function (e: any) {
      if (!this._enabled) return;

      if (e.touches && e.touches.length > 1) {
        this._moved = true;
        return;
      }

      const first = (e.touches && e.touches.length === 1 ? e.touches[0] : e);
      let offset = new L.Point(first.clientX, first.clientY).subtract(this._startPoint);

      if (!offset.x && !offset.y) return;
      if (Math.abs(offset.x) + Math.abs(offset.y) < this.options.clickTolerance) return;

      offset.x /= this._parentScale.x;
      offset.y /= this._parentScale.y;

      const rotationDeg = self.currentRotationAngle;
      if (rotationDeg !== 0) {
        const rad = (-rotationDeg * Math.PI) / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);
        const rx = offset.x * cos - offset.y * sin;
        const ry = offset.x * sin + offset.y * cos;
        offset = new L.Point(rx, ry);
      }

      if (e.preventDefault) {
        e.preventDefault();
      }

      if (!this._moved) {
        this.fire('dragstart');
        this._moved = true;
        if (document.body) {
          document.body.classList.add('leaflet-dragging');
        }
        this._lastTarget = e.target || e.srcElement;
        if (this._lastTarget && this._lastTarget.classList) {
          this._lastTarget.classList.add('leaflet-drag-target');
        }
      }

      this._newPos = this._startPos.add(offset);
      this._moving = true;
      this._lastEvent = e;
      this._updatePosition();
    };
  }

  private updateMapRotation(): void {
    const host = this.elementRef.nativeElement as HTMLElement;

    if (!this.rotateToHole) {
      this.currentRotationAngle = 0;
      host.style.setProperty('--map-rotation', '0deg');
      host.style.setProperty('--map-counter-rotation', '0deg');
      return;
    }

    let startPoint: LatLng | undefined;
    if (this.targetLine?.teeId && this.tees) {
      startPoint = this.tees.find((t) => t.id === this.targetLine!.teeId)?.position;
    }
    if (!startPoint && this.tees && this.tees.length > 0) {
      startPoint = this.tees[0].position;
    }
    if (!startPoint) {
      const gps = this.geoService.currentPosition();
      startPoint = gps ? { lat: gps.lat, lng: gps.lng } : this.initialCenter;
    }

    const greenCenter = this.greenPoints?.center?.lat ? this.greenPoints.center : (this.greenPoints?.front?.lat ? this.greenPoints.front : this.greenPoints?.back);

    if (startPoint && greenCenter?.lat && greenCenter?.lng) {
      const bearing = this.calculateBearing(startPoint, greenCenter as LatLng);
      const rotationAngle = (360 - bearing) % 360;
      this.currentRotationAngle = rotationAngle;
      host.style.setProperty('--map-rotation', `${rotationAngle}deg`);
      host.style.setProperty('--map-counter-rotation', `${-rotationAngle}deg`);
    } else {
      this.currentRotationAngle = 0;
      host.style.setProperty('--map-rotation', '0deg');
      host.style.setProperty('--map-counter-rotation', '0deg');
    }

    setTimeout(() => {
      this.invalidateSize();
    }, 150);
    setTimeout(() => {
      this.invalidateSize();
    }, 400);
  }

  private calculateBearing(p1: LatLng, p2: LatLng): number {
    const lat1 = (p1.lat * Math.PI) / 180;
    const lat2 = (p2.lat * Math.PI) / 180;
    const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;

    const y = Math.sin(dLng) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);

    const brng = (Math.atan2(y, x) * 180) / Math.PI;
    return (brng + 360) % 360;
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
    this.fitHoleBounds();
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

  fitHoleBounds(): void {
    if (!this.map) return;

    let teePos: LatLng | undefined;
    if (this.targetLine?.teeId && this.tees) {
      teePos = this.tees.find((t) => t.id === this.targetLine!.teeId)?.position;
    }
    if (!teePos && this.tees && this.tees.length > 0) {
      teePos = this.tees[0].position;
    }

    let greenTarget: LatLng | undefined;
    if (this.greenPoints) {
      const g = this.greenPoints.back?.lat
        ? this.greenPoints.back
        : (this.greenPoints.center?.lat ? this.greenPoints.center : this.greenPoints.front);
      if (g?.lat && g?.lng) {
        greenTarget = g as LatLng;
      }
    }

    if (this.rotateToHole && teePos && greenTarget) {
      const containerHeight = (this.elementRef.nativeElement as HTMLElement).clientHeight || window.innerHeight || 800;

      // Obstacle paddings in screen pixels:
      // yTop: 78px topbar + 17px margin = 95px
      // yBot: 68px bottom menu + 118px compressed card + 34px margin = 220px
      const yTop = 95;
      const yBot = 220;

      const hAvail = Math.max(100, containerHeight - yTop - yBot);
      const distM = this.geoService.calculateDistanceMeters(teePos, greenTarget);

      if (distM > 0) {
        const metersPerPixel = distM / hAvail;
        const midLat = (teePos.lat + greenTarget.lat) / 2;
        const latRad = (midLat * Math.PI) / 180;

        const zoom = Math.log2((156543.03392 * Math.cos(latRad)) / metersPerPixel);
        const midLng = (teePos.lng + greenTarget.lng) / 2;

        const shiftPixels = (yBot - yTop) / 2;
        const shiftMeters = shiftPixels * metersPerPixel;

        const bearing = this.calculateBearing(teePos, greenTarget);
        const adjustedCenter = this.movePoint(
          { lat: midLat, lng: midLng },
          shiftMeters,
          (bearing + 180) % 360
        );

        setTimeout(() => {
          if (this.map) {
            this.map.invalidateSize();
            this.map.setView([adjustedCenter.lat, adjustedCenter.lng], Math.min(19, Math.max(14, zoom)), { animate: true });
          }
        }, 50);
        return;
      }
    }

    const points: LatLng[] = [];
    if (teePos) points.push(teePos);
    if (this.targetLine?.waypoints) {
      this.targetLine.waypoints.forEach((w) => { if (w.lat && w.lng) points.push(w); });
    }
    if (greenTarget) points.push(greenTarget);

    if (points.length >= 2) {
      const latLngs: L.LatLngExpression[] = points.map((p) => [p.lat, p.lng]);
      const bounds = L.latLngBounds(latLngs);
      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize();
          this.map.fitBounds(bounds, {
            paddingTopLeft: [30, 95],
            paddingBottomRight: [30, 201],
            maxZoom: 19,
            animate: true
          });
        }
      }, 50);
    } else if (points.length === 1) {
      this.centerOnLocation(points[0], 18);
    }
  }

  private movePoint(start: LatLng, distanceMeters: number, bearingDeg: number): LatLng {
    const R = 6371000;
    const d = distanceMeters / R;
    const brng = (bearingDeg * Math.PI) / 180;
    const lat1 = (start.lat * Math.PI) / 180;
    const lon1 = (start.lng * Math.PI) / 180;

    const lat2 = Math.asin(
      Math.sin(lat1) * Math.cos(d) + Math.cos(lat1) * Math.sin(d) * Math.cos(brng)
    );
    const lon2 =
      lon1 +
      Math.atan2(
        Math.sin(brng) * Math.sin(d) * Math.cos(lat1),
        Math.cos(d) - Math.sin(lat1) * Math.sin(lat2)
      );

    return {
      lat: (lat2 * 180) / Math.PI,
      lng: (lon2 * 180) / Math.PI
    };
  }
}
