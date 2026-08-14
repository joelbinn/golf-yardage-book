# Implementation Plan: Digitalt Scorekort & Rundhistorik

> **Guidelines**:
> - All kodutveckling och arkitektur skall följa skillet [`angular-developer`](file:///Users/joel/.gemini/config/skills/angular-developer/SKILL.md) (Signals, Standalone Components, `@if`/`@for`).
> - Gränssnitt och UX skall strikt följa designskissen i [`doc/ui-sketch/Golf Yardage Book.dc.html`](file:///Users/joel/kod/joelabs/golf-yardage-book/doc/ui-sketch/Golf%20Yardage%20Book.dc.html).

## Phase 1: Modeller, Tjänster & Statistikberäkning
- [x] Task: Uppdatera StorageService med statistikberäkning och rundaavslut
  - [x] Lägg till metoden calculateRoundStats(round: Round): RoundStats i src/app/services/storage.service.ts.
  - [x] Lägg till metoden completeRound(roundId: string): Promise<Round> som sätter status: completed, beräknar statistik och sparar.
  - [x] Verifiera med enhetstest i storage.service.spec.ts.
  - [x] Task: Phase Verification & Checkpoint (Refer to workflow.md)

## Phase 2: Scorekort i "Spela runda" (PlayRoundComponent)
- [x] Task: Implementera scorekort-widget och ställningsräknare i PlayRoundComponent
  - [x] Uppdatera src/app/components/play-round/play-round.component.ts med signaler och metoder för att uppdatera slag, puttar och fairway.
  - [x] Lägg till ställningsmärke (E, +2, -1) i toppmenyn i play-round.component.html.
  - [x] Bygg scorekort-kort i vänsterpanelen/sidofältet i play-round.component.html med steppers för slag, puttar och fairwayval.
  - [x] Lägg till knappen "Avsluta runda" i play-round.component.html och koppling till completeRound().
  - [x] Stila alla kontroller i play-round.component.css.
  - [x] Task: Phase Verification & Checkpoint (Refer to workflow.md)

## Phase 3: Rundhistorik & Scorekortsvisning (RoundHistoryComponent)
- [x] Task: Skapa RoundHistoryComponent och registrera ruten /history
  - [x] Skapa src/app/components/round-history/round-history.component.ts, .html, .css.
  - [x] Registrera ruten /history i src/app/app.routes.ts.
  - [x] Bygg rundlista i round-history.component.html med banskort, statistik (Par, Puttar, GIR %, FIR %) och radera-knapp.
  - [x] Bygg modal/detaljvy för 18-håls scorekort i round-history.component.html.
  - [x] Task: Phase Verification & Checkpoint (Refer to workflow.md)

## Phase 4: Slutgiltig verifiering & Polering
- [x] Task: Kör bygge och testerna
  - [x] Verifiera ren kompilering med npm run build.
  - [x] Verifiera enhetstester med npx vitest run.
  - [x] Task: Phase Verification & Checkpoint (Refer to workflow.md)
- [x] Task: Användaren verifierar i live-applikationen
  - [x] Erhåll användarens godkännande 

