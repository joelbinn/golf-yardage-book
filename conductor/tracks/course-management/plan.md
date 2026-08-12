# Track Plan: Ban- och Hålhantering (Course Management UI & Green/Hinder-positionering)

> **Guidelines**:
> - All kodutveckling och arkitektur skall följa skillet [`angular-developer`](file:///Users/joel/.gemini/config/skills/angular-developer/SKILL.md) (Signals, Standalone Components, Control Flow syntax `@if`/`@for`).
> - Layout och visuella komponenter skall strikt följa designskissen i [`doc/ui-sketch/Golf Yardage Book.dc.html`](file:///Users/joel/kod/joelabs/golf-yardage-book/doc/ui-sketch/Golf%20Yardage%20Book.dc.html).

## Phase 1: Komponentstruktur & Banalista (Angular Developer & UX Sketch)
- [ ] Task: Skapa `CourseListComponent` och routing för banhantering enligt skissen i `Golf Yardage Book.dc.html`.
- [ ] Task: Skapa form/modal `CourseFormDialog` för att skapa/redigera banans grunddata (namn, antal hål).
- [ ] Task: Integrera med `StorageService` för att lista, skapa och ta bort banor.
- [ ] Task: Phase Verification & Checkpoint (Refer to workflow.md)

## Phase 2: Hålredigering & Green-positionering på kartan
- [ ] Task: Skapa `HoleEditorComponent` med hålväljare (hål 1-9/18) samt par- och index-fält med design från skissen.
- [ ] Task: Bygga interaktiv kartintegration i `HoleEditorComponent` för placering av Green-punkter (Front, Center, Back) via kartklick eller GPS-position.
- [ ] Task: Visning och uppdatering av Green-markörer på Leaflet-kartan.
- [ ] Task: Phase Verification & Checkpoint (Refer to workflow.md)

## Phase 3: Hinder- & Objekt-hantering
- [ ] Task: Bygga dialog/formulär för att lägga till och redigera hinder (typ: bunker/vatten/träd/custom, namn, position).
- [ ] Task: Lägga till kartmarkörer och interaktion för hinder på hålet.
- [ ] Task: Möjlighet att ta bort eller flytta hinder.
- [ ] Task: Phase Verification & Checkpoint (Refer to workflow.md)

## Phase 4: Integrationsverifiering & UX-polering
- [ ] Task: Verifiera att alla banändringar sparas korrekt i `StorageService` och laddas om vid omstart av appen.
- [ ] Task: Verifiera mobilanpassning och visual match mot `Golf Yardage Book.dc.html`.
- [ ] Task: Köra `npm run build` och testerna för att säkerställa noll regressionsfel.
- [ ] Task: Phase Verification & Checkpoint (Refer to workflow.md)
