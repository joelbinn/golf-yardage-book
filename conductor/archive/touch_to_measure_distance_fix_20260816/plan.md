# Implementation Plan: Visning av Avstånd vid Målpunkt för Touch to Measure

## Core Guidelines & Skill Usage
1. **Developer Skill**: Skillet [`angular-developer`](file:///Users/joel/.gemini/config/skills/angular-developer/SKILL.md) skall användas för all komponent- och tjänsteutveckling (Angular Signals, Standalone Components, `@if`/`@for` Control Flow syntax).

## Phase 1: Marker Icon HTML & CSS Enhancements
- [x] Task: Uppdatera `MapComponent` för att rendera avståndsetikett vid målpunktsmarkören
  - [x] Uppdatera `setMeasureTarget()` och `recalculateDistance()` i `map.component.ts` så att `measureMarker` Leaflet `L.divIcon` inkluderar avståndsetiketten (`.target-distance-pill`).
  - [x] Lägg till CSS-stilar i `map.component.css` för `.target-marker-wrapper` och `.target-distance-pill` med mörk semi-transparent bakgrund, gult/vitt teckensnitt och skugga.
- [x] Task: Phase Verification & Checkpoint (Refer to workflow.md)

## Phase 2: Reactivity & Unit Change Support
- [x] Task: Säkerställ att avståndsetiketten uppdateras vid GPS-rörelse och enhetsbyte
  - [x] Uppdatera `ngOnChanges` i `map.component.ts` så att ändringar i `unitLabel` tvingar omräkning av avståndet (`recalculateDistance()`).
  - [x] Verifiera att `clearMeasurement()` tar bort markören och etiketten från kartan.
- [x] Task: Phase Verification & Checkpoint (Refer to workflow.md)

## Phase 3: Verification & Build Validation
- [x] Task: Verifiera bygge och tester
  - [x] Kör `npm run build` och `npm test -- --watch=false` för att säkerställa att kompilering och enhetstester är felfria.
- [x] Task: Phase Verification & Checkpoint (Refer to workflow.md)
