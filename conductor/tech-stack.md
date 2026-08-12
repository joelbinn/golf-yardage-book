# Technology Stack - Golf Yardage Book

## Core Application Framework
- **Framework**: Angular 22 (eller senaste Angular v22)
- **Architecture**: Standalone Components, Signal-based reactivity, Control Flow syntax (`@if`, `@for`).
- **Language**: TypeScript 5+

## Mapping & GIS
- **Map Library**: Leaflet.js (`leaflet`, `@types/leaflet`)
- **Map Tiles Source**: Esri World Imagery Satellite Tiles (gratis, öppna satellitkartor utan API-nyckel).

## PWA & Storage
- **Offline & Service Worker**: `@angular/pwa` med anpassade caching-regler för Esri tile-URLer.
- **Local Database**: `localStorage` (för snabba inställningar och tillstånd) och `IndexedDB` (via `idb` / `dexie` för stora ban- och runda-data).

## Remote Sync & External Integration
- **GitHub Integration**: GitHub REST API (`@octokit/core` eller native `HttpClient` med PAT Bearer Auth).
- **Data Format**: JSON (filer i `/courses/*.json` och `/rounds/*.json` samt `manifest.json`).

## Build, Hosting & CI/CD
- **Build Tool**: Angular CLI (`@angular/cli` / Vite builder).
- **Hosting & Deployment**: GitHub Pages (via GitHub Actions).
