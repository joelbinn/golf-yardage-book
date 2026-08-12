import { Injectable, signal } from '@angular/core';
import { LatLng } from '../models/geo.model';

export interface GPSPosition extends LatLng {
  accuracy: number;
  heading: number | null;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {
  readonly currentPosition = signal<GPSPosition | null>(null);
  readonly trackingError = signal<string | null>(null);
  readonly isTracking = signal<boolean>(false);

  private watchId: number | null = null;

  startTracking(): void {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      this.trackingError.set('GPS är inte tillgängligt i denna enhet/webbläsare.');
      return;
    }

    if (this.watchId !== null) return;

    this.isTracking.set(true);
    this.trackingError.set(null);

    this.watchId = navigator.geolocation.watchPosition(
      (pos) => {
        this.currentPosition.set({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          heading: pos.coords.heading,
          timestamp: pos.timestamp
        });
      },
      (err) => {
        let msg = 'Kunde inte hämta GPS-position.';
        if (err.code === err.PERMISSION_DENIED) msg = 'GPS-åtkomst nekaḍ.';
        if (err.code === err.POSITION_UNAVAILABLE) msg = 'GPS-signal saknas.';
        if (err.code === err.TIMEOUT) msg = 'GPS-sökning tog för lång tid.';
        this.trackingError.set(msg);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 3000
      }
    );
  }

  stopTracking(): void {
    if (this.watchId !== null && typeof navigator !== 'undefined') {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    this.isTracking.set(false);
  }

  /**
   * Calculates distance between two coordinates in meters using the Haversine formula.
   */
  calculateDistanceMeters(p1: LatLng, p2: LatLng): number {
    const R = 6371000; // Radius of the Earth in meters
    const dLat = this.toRadians(p2.lat - p1.lat);
    const dLng = this.toRadians(p2.lng - p1.lng);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(p1.lat)) *
        Math.cos(this.toRadians(p2.lat)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  }

  /**
   * Converts meters to yards.
   */
  metersToYards(meters: number): number {
    return Math.round(meters * 1.09361);
  }

  private toRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }
}
