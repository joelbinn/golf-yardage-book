# Implementation Plan: Redesign av Hålvy i "Spela Runda"

## Phase 1: Layout & Fullscreen Map Restructuring
- [ ] Task: Omstrukturera layout i `PlayRoundComponent` så att kartan täcker hela bakgrunden
  - [ ] Uppdatera `play-round.component.html` layoutstruktur för full-screen kartcanvas.
  - [ ] Anpassa `play-round.component.css` för `position: fixed/absolute` full-screen kartvy med z-index lager.
- [ ] Task: Phase Verification & Checkpoint (Refer to workflow.md)

## Phase 2: Floating Header Bar (Top Pill Header)
- [ ] Task: Implementera den flytande, avrundade toppbaren
  - [ ] Skapa HTML-struktur för toppbaren med navigeringspilar, hålnr/par/hcp, GPS-noggrannhet, enhetsväxlare och score-badge.
  - [ ] Stila toppbaren med rundade ändar, frostat glas (`backdrop-filter: blur(12px)`), skuggor och responskompakthet.
  - [ ] Koppla knappar för hålnavigering (`prevHole()`, `nextHole()`), enhetsväxel (`toggleUnit()`) och GPS-indikator.
- [ ] Task: Phase Verification & Checkpoint (Refer to workflow.md)

## Phase 3: Bottom Sheet Card & Drag/Toggle Logic
- [ ] Task: Implementera expanderbart/komprimerbart Bottom Sheet-kort
  - [ ] Lägg till Signal `isBottomSheetExpanded` i `play-round.component.ts`.
  - [ ] Implementera gest-/klickhantering för draghandtaget och överkanten (touch-swipe & click).
  - [ ] Skapa CSS-klasser och transitions för komprimerat läge (endast green-avstånd) och expanderat läge (hinder, slagregistrering, score-steppers, knappar).
  - [ ] Säkerställ att bottom sheet dockar direkt ovanför `app-nav-bar` utan att täcka över den.
  - [ ] Lägg till internt scrollstöd för expanderat innehåll på mindre skärmar.
- [ ] Task: Phase Verification & Checkpoint (Refer to workflow.md)

## Phase 4: Integration, Styling Polish & Verification
- [ ] Task: Finjustera UX, kartkontroller och verifiera applikationsbygget
  - [ ] Justera Leaflet zoom-kontroller och kartmarkörer för fri sikt.
  - [ ] Kör `npm run build` för att verifiera att alla TypeScript- och Angular-komponenter kompilerar utan fel.
- [ ] Task: Phase Verification & Checkpoint (Refer to workflow.md)
