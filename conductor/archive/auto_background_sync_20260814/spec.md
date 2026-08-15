# Specification: Automatisk Bakgrundssynkronisering

## Overview
Detta spår gör att applikationen **automatiskt och tyst synkroniserar i bakgrunden** mot GitHub så fort användaren sparar, ändrar eller raderar en bana, runda eller backup utan att störa spelaren eller sakta ned gränssnittet.

---

## Functional Requirements

### 1. Reaktiv Händelsekanal (`StorageService`)
- Lägg till `readonly dataChanged$ = new Subject<void>();` i `StorageService`.
- Sänd händelse (`this.dataChanged$.next()`) vid varje sparande eller radering.

### 2. Debounced Bakgrundssynk (`GithubSyncService`)
- Lyssna på `dataChanged$` i `GithubSyncService` och använd `debounceTime(3000)`.
- Exekvera `backgroundSync()` 3 sekunder efter senaste ändringen.

### 3. Icke-blockerande & Tyst Felhantering
- Synkning avbryts tyst ifall GitHub-konfiguration saknas eller om enheten är offline.

---

## Acceptance Criteria
- [ ] Alla muterande metoder i `StorageService` sänder `dataChanged$`.
- [ ] `GithubSyncService` fångar upp händelser med 3 sekunders debouncing och synkar i bakgrunden.
- [ ] Enhetstester verifierar funktionen utan fel.
- [ ] `npm run build` och alla tester passerar.
