import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MapComponent } from './components/map/map.component';
import { StorageService } from './services/storage.service';
import { GeolocationService } from './services/geolocation.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, MapComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  readonly storage = inject(StorageService);
  readonly geo = inject(GeolocationService);

  readonly title = 'Golf Yardage Book';
}
