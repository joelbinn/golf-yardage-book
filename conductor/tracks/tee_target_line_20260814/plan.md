# Implementation Plan: Tee-positioner, Tänkt Spellinje & Hålvridning (Green Högst Upp)

## Core Guidelines & Skill Usage
1. **Developer Skill**: Skillet [`angular-developer`](file:///Users/joel/.gemini/config/skills/angular-developer/SKILL.md) skall användas för all komponent- och tjänsteutveckling (Angular Signals, Standalone Components, `@if`/`@for` Control Flow syntax).

---

## Phase 1: Datamodell & Editor-kontroller med Tee-Koppling
- [ ] Task: Uppdatera `course.model.ts`
  - [ ] Lägg till `Tee` och `TargetLine` (`teeId?: string`, `waypoints: LatLng[]`) i `course.model.ts`.
  - [ ] Utöka `Hole` med `tees?: Tee[]` och `targetLine?: TargetLine`.
- [ ] Task: Lägg till Tee- och Spellinje-verktyg i `CourseEditorComponent`
  - [ ] Skapa verktyg för "Lägg till/Redigera Tee" och "Rita/Redigera Spellinje".
  - [ ] Implementera val av start-Tee (`teeId`) när man ritar eller redigerar spellinjen.
  - [ ] Säkerställ att om en Tee flyttas så följer spellinjens startpunkt automatiskt med.

---

## Phase 2: Kartvisualisering & Hålvridning i MapComponent
- [ ] Task: Uppdatera `MapComponent` för Tees, Spellinje & Hålvridning
  - [ ] Lägg till `@Input() tees` och `@Input() targetLine`.
  - [ ] Beräkna och rendera den tänkta spellinjen från den kopplade Tee:ns position via waypoints till Green center.
  - [ ] Implementera bärningsberäkning (bearing) från valda hålets Tee till Green center.
  - [ ] Implementera kartrotation för Hålinriktad vy (Tee längst ned, Green högst upp) med motroterade horisontella badges.
  - [ ] Rendera delavstånd och totalsträcka för spellinjen.

---

## Phase 3: Spelläge & Orienteringsväxlare
- [ ] Task: Integrera i `PlayRoundComponent`
  - [ ] Skicka tees, spellinje och orienteringsläge till kartan i spelläget.
  - [ ] Tillåt spelaren att välja aktiv Tee för hålet/rundan.
  - [ ] Lägg till kompassknapp på kartan för att växla mellan "Hålinriktad (Tee ➔ Green)" och "Norr Upp".

---

## Phase 4: Enhetstester & Verifiering
- [ ] Task: Bygge och tester
  - [ ] Skriv enhetstester för bärningsberäkning, `TargetLine` och Tee-koppling.
  - [ ] Verifiera ren kompilering med `npm run build`.
  - [ ] Verifiera tester med `npm test`.
