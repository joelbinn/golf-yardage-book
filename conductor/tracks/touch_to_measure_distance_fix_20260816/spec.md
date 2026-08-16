# Specification: Visning av Avstånd vid Målpunkt för Touch to Measure

## Overview
När användaren trycker på satellitkartan i "Spela Runda"-läget aktiveras "Touch to Measure" (interaktiv avståndsmätning). En linje dras från spelarens GPS-position till den valda målpunkten. För närvarande saknas det uppmätta avståndet direkt vid målpunkten på kartan. Detta felrättningsspår lägger till en avståndsetikett/badge placerad direkt fäst vid målpunktsmarkören på kartan i `MapComponent`, i enlighet med specifikationen i `conductor/archive/play-round-gps/spec.md`.

---

## Functional Requirements

### 1. Avståndsetikett vid Målpunktsmarkör
- Vid klick/tryck på kartan skapas en målpunktsmarkör (`measureMarker`) på den klickade positionen.
- Markören skall innehålla både hårkorset (`.target-crosshair`) och en avståndsetikett (`.target-distance-pill`) placerad direkt jämte hårkorset.
- Avståndsetiketten skall visa det beräknade avståndet från spelarens GPS-position i aktuell enhet, t.ex. `142 m` eller `155 yd`.

### 2. Dynamisk Uppdatering
- Avståndsetiketten vid målpunkten skall uppdateras i realtid när:
  - Spelarens GPS-position förändras.
  - Användaren växlar enhet mellan Meter (`m`) och Yards (`yd`).
- När mätningen rensas eller stängs av skall målpunkten, mätlinjen och avståndsetiketten tas bort helt från kartan.

### 3. Visuell Design & Läsbarhet
- Etiketten skall ha hög kontrast (mörk bakgrund `#201e1d` eller `#0f172a` med ljus text och gul/grön accentfärg), skugga och tydlig typografi så att den är lättläst över Esri satellitkartan.

---

## Technical Architecture & Implementation Notes
- **Component**: `MapComponent` (`src/app/components/map/map.component.ts`, `.html`, `.css`).
- **Leaflet Marker HTML**: Anpassa Leaflet `L.divIcon` för `measureMarker` i `setMeasureTarget()` och `recalculateDistance()`:
  `<div class="target-marker-wrapper"><div class="target-crosshair"></div><div class="target-distance-pill">${displayDist} ${this.unitLabel}</div></div>`
- **Reactivity & Lifecycle**: Uppdatera målpunktsmarkörens ikon och innehåll vid `recalculateDistance()` och vid `ngOnChanges` för `unitLabel`.

---

## Acceptance Criteria
- [ ] Klick på kartan visar en målpunktsmarkör med både hårkors och en avståndsetikett (t.ex. `142 m` / `155 yd`).
- [ ] Avståndet vid målpunkten uppdateras korrekt när spelaren förflyttar sig eller byter enhet.
- [ ] Rensa mätning tar bort markör, linje och avståndsetikett från kartan.
- [ ] Kodbygge (`npm run build`) och enhetstester (`npm test`) passerar utan fel.
