# Specification: Crosshair Cursor på Kartbilden

## Overview
Detta spår lägger till en `crosshair`-pekare (hårkors) över Leaflet-kartan i `MapComponent`. Detta gör det enklare och mer precist för användaren att klicka ut mätpunkter, tee-positioner och greenpunkter på satellitkartan.

---

## Functional Requirements

### 1. CSS-styling för Kartan (`MapComponent`)
- Lägg till CSS-regler i `map.component.css` som sätter `cursor: crosshair !important;` på `.map-container` samt alla kapslade Leaflet-klasser (`.leaflet-container`, `.leaflet-grab`, `.leaflet-interactive`).

---

## Acceptance Criteria
- [ ] Muspekaren visar ett tydligt hårkors (`crosshair`) när den förs över kartytan.
- [ ] Klick och drag förblir fullt fungerande utan avbrott.
- [ ] `npm run build` och alla enhetstester passerar utan fel.
