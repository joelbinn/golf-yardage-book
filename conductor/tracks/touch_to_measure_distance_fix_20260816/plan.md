# Implementation Plan: Visning av Avstånd vid Målpunkt för Touch to Measure

## Phase 1: Marker Icon HTML & CSS Enhancements
- [ ] Task: Uppdatera `MapComponent` för att rendera avståndsetikett vid målpunktsmarkören
  - [ ] Uppdatera `setMeasureTarget()` och `recalculateDistance()` i `map.component.ts` så att `measureMarker` Leaflet `L.divIcon` inkluderar avståndsetiketten (`.target-distance-pill`).
  - [ ] Lägg till CSS-stilar i `map.component.css` för `.target-marker-wrapper` och `.target-distance-pill` med mörk semi-transparent bakgrund, gult/vitt teckensnitt och skugga.
- [ ] Task: Phase Verification & Checkpoint (Refer to workflow.md)

## Phase 2: Reactivity & Unit Change Support
- [ ] Task: Säkerställ att avståndsetiketten uppdateras vid GPS-rörelse och enhetsbyte
  - [ ] Uppdatera `ngOnChanges` i `map.component.ts` så att ändringar i `unitLabel` tvingar omräkning av avståndet (`recalculateDistance()`).
  - [ ] Verifiera att `clearMeasurement()` tar bort markören och etiketten från kartan.
- [ ] Task: Phase Verification & Checkpoint (Refer to workflow.md)

## Phase 3: Verification & Build Validation
- [ ] Task: Verifiera bygge och tester
  - [ ] Kör `npm run build` och `npm test -- --watch=false` för att säkerställa att kompilering och enhetstester är felfria.
- [ ] Task: Phase Verification & Checkpoint (Refer to workflow.md)
