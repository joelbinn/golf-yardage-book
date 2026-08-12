# Track Spec: Initiera Angular PWA & Grundstruktur

## Overview
Initiera Golf Yardage Book-applikationen med Angular (v19/v20), Standalone Components, Signal-arkitektur, `@angular/pwa` Service Worker, Leaflet.js med Esri World Imagery satellitlager, samt datamodeller för banor och spelade rundor.

## Requirements
- Skapa Angular-projektstrukturen med Standalone Components och Signals.
- Konfigurera Leaflet.js kartkomponent för satellitvy baserad på GPS-positionering.
- Skapa TypeScript-gränssnitt och modeller för `Course`, `Hole`, `Green`, `CourseObject`, `Round`, `Score` och `Shot`.
- Konfigurera PWA Service Worker och offline tile-caching.
- Skapa LocalStorage / IndexedDB service för lagring och laddning av banor och rundor.
