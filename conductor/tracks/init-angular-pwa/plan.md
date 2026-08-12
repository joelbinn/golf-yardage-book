# Track Plan: Initiera Angular PWA & Grundstruktur

## Phase 1: Projekt-scaffolding & Beroenden
- [x] Task: Skapa Angular-applikation med hjälp av Angular CLI och installera beroenden (`leaflet`, `@types/leaflet`, `@angular/pwa`).
  - Checkpoint: Projektet bygger och laddar utan fel.

## Phase 2: Datamodeller & Lagringsservice
- [x] Task: Skapa TypeScript-interfaces (`Course`, `Hole`, `Green`, `CourseObject`, `Round`, `Shot`) och `StorageService` (`localStorage`/`IndexedDB`).
  - Checkpoint: Sparande och laddning av banor och rundor i storage.

## Phase 3: Satellitkartkomponent
- [x] Task: Bygga Leaflet-baserad kartkomponent som visar Esri World Imagery satellitvy och centrerar på GPS-position.
  - Checkpoint: Kartan renderas i webbläsaren med GPS-markör.

## Phase 4: PWA Offline-konfiguration
- [x] Task: Konfigurera Service Worker i `ngsw-config.json` för cachning av appskal och kart-tiles.
  - Checkpoint: Appen laddar offline via Service Worker.
