# Track Plan: Spela Runda – Live GPS & Avståndsmätning

> **Guidelines**:
> - All kodutveckling och arkitektur skall följa skillet [`angular-developer`](file:///Users/joel/.gemini/config/skills/angular-developer/SKILL.md) (Signals, Standalone Components, `@if`/`@for`).
> - Gränssnitt och UX skall strikt följa designskissen i [`doc/ui-sketch/Golf Yardage Book.dc.html`](file:///Users/joel/kod/joelabs/golf-yardage-book/doc/ui-sketch/Golf%20Yardage%20Book.dc.html).

## Phase 1: Rundamodell, Rundastart & Routing
- [x] Task: Utöka/skapa datamodeller för `Round`, `RoundHole` och `Shot` i `src/app/models/round.model.ts`.
- [x] Task: Utöka `StorageService` med metoder för att hantera aktiva och sparade rundor (`startRound`, `getActiveRound`, `saveRound`, `finishRound`).
- [x] Task: Skapa `PlayRoundComponent` och ny route `/play/:roundId` samt uppdatera navigering för att starta runda från banlistan (`CourseListComponent`).
- [x] Task: Phase Verification & Checkpoint (Refer to workflow.md)

## Phase 2: Live GPS, Precisionsindikator & Avståndsvisning
- [x] Task: Integrera `GeolocationService` i `PlayRoundComponent` för kontinuerlig spårning och beräkning av avstånd (Haversine-formel).
- [x] Task: Bygga visuell avståndspanel för Green (Front, Center, Back) och hinder för det aktiva hålet.
- [x] Task: Implementera inställning för enhetsväxel (Meter / Yards) med Signal-stöd och automatisk omräkning.
- [x] Task: Bygga visuell GPS-precisionsindikator (Grön/Gul/Röd + felmarginal i meter).
- [x] Task: Phase Verification & Checkpoint (Refer to workflow.md)

## Phase 3: Interaktiv Karta, Touch to Measure & Centrering
- [x] Task: Integrera Leaflet satellitkarta i `PlayRoundComponent` med spelarmarkör, greenmarkörer och hindermarkörer.
- [x] Task: Implementera **Touch to Measure**: klickhändelse på kartan som ritar en linje från spelarens GPS-position till klickad punkt och visar avståndet.
- [x] Task: Lägga till knappar för att centrera kartan på spelarens GPS-position samt på green.
- [x] Task: Phase Verification & Checkpoint (Refer to workflow.md)

## Phase 4: Snabbregistrering av Hinder under spel & Polering
- [x] Task: Bygga dialog/funktion för snabbregistrering av nytt hinder under rundan direkt på spelarens nuvarande GPS-position och uppdatera banan i `StorageService`.
- [x] Task: Mobilanpassning och verifiering mot designskissen `Golf Yardage Book.dc.html`.
- [x] Task: Köra `npm run build` och testerna för att säkerställa noll regressionsfel.
- [x] Task: Phase Verification & Checkpoint (Refer to workflow.md)
