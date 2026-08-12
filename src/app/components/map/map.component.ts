import {
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
  effect,
  inject,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { LatLng } from '../../models/geo.model';
import { GeolocationService } from '../../services/geolocation.service';

const ESRI_WORLD_IMAGERY =
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
const ESRI_ATTRIBUTION =
  'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map.component.html',
  styleUrl: './map.component.css'
})
export class MapComponent implements OnInit, OnDestroy {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef<HTMLDivElement>;

  @Input() initialCenter: LatLng = { lat: 59.3293, lng: 18.0686 }; // Default Stockholm fallback
  @Input() initialZoom = 17;

  private geoService = inject(GeolocationService);

  private map: L.Map | null = null;
  private userMarker: L.Marker | null = null;
  private accuracyCircle: L.Circle | null = null;
  private measureMarker: L.Marker | null = null;
  private measureLine: L.Polyline | null = null;

  readonly measuredDistanceMeters = signal<number | null>(null);
  readonly measuredDistanceYards = signal<number | null>(null);
  readonly selectedPoint = signal<LatLng | null>(null);

  constructor() {
    // Effect to update user position marker when GPS updates
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

    // Add Esri World Imagery satellite layer
    L.tileLayer(ESRI_WORLD_IMAGERY, {
      attribution: ESRI_ATTRIBUTION,
      maxZoom: 19
    }).addTo(this.map);

    // Zoom control in top right
    L.control.zoom({ position: 'topright' }).addTo(this.map);

    // Handle map click for Touch to Measure
    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.setMeasureTarget({ lat: e.latlng.lat, lng: e.latlng.lng });
    });
  }

  private updateUserPositionOnMap(pos: { lat: number; lng: number; accuracy: number }): void {
    if (!this.map) return;

    const latLng: L.LatLngExpression = [pos.lat, pos.lng];

    // Create or update accuracy circle
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

    // Create custom SVG pulse marker for user location
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

      // Center map on initial GPS lock
      this.map.setView(latLng, 17);
    } else {
      this.userMarker.setLatLng(latLng);
    }

    // Update active distance measurement line if target is selected
    if (this.selectedPoint()) {
      this.recalculateDistance();
    }
  }

  setMeasureTarget(target: LatLng): void {
    if (!this.map) return;

    this.selectedPoint.set(target);
    const targetLatLng: L.LatLngExpression = [target.lat, target.lng];

    // Marker for measured target
    const targetIcon = L.divIcon({
      className: 'custom-target-marker',
      html: `<div class="target-crosshair"><span></span></div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });

    if (this.measureMarker) {
      this.measureMarker.setLatLng(targetLatLng);
    } else {
      this.measureMarker = L.marker(targetLatLng, { icon: targetIcon }).addTo(this.map);
    }

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

    // Draw connecting line
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
}
