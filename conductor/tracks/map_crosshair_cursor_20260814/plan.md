# Implementation Plan: Crosshair Cursor på Kartbilden

## Core Guidelines & Skill Usage
1. **Developer Skill**: Skillet [`angular-developer`](file:///Users/joel/.gemini/config/skills/angular-developer/SKILL.md) skall användas för all komponent- och tjänsteutveckling (Angular Signals, Standalone Components, `@if`/`@for` Control Flow syntax).

---

## Phase 1: CSS-Styling i MapComponent
- [ ] Task: Uppdatera `map.component.css`
  - [ ] Lägg till CSS-regel för `cursor: crosshair !important;` på kartbehållaren och Leaflet-lager.

---

## Phase 2: Enhetstester & Verifiering
- [ ] Task: Bygge och verifiering
  - [ ] Verifiera ren kompilering med `npm run build`.
  - [ ] Verifiera med `npx vitest run`.
