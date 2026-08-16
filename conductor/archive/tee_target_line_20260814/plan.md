# Implementation Plan: Tee-positioner, Tänkt Spellinje & Hålvridning (Green Högst Upp)

## Core Guidelines & Skill Usage
1. **Developer Skill**: Skillet [`angular-developer`](file:///Users/joel/.gemini/config/skills/angular-developer/SKILL.md) skall användas för all komponent- och tjänsteutveckling (Angular Signals, Standalone Components, `@if`/`@for` Control Flow syntax).

---

## Phase 1: Datamodell & Editor-kontroller med Tee-Koppling
- [x] Task: Uppdatera `course.model.ts`
  - [x] Lägg till `Tee` och `TargetLine` (`teeId?: string`, `waypoints: LatLng[]`) i `course.model.ts`.
  - [x] Utöka `Hole` med `tees?: Tee[]` och `targetLine?: TargetLine`.
- [x] Task: Lägg till Tee- och Spellinje-verktyg i `CourseEditorComponent`
  - [x] Skapa verktyg för "Lägg till/Redigera Tee" och "Rita/Redigera Spellinje".
  - [x] Implementera val av start-Tee (`teeId`) när man ritar eller redigerar spellinjen.
  - [x] Säkerställ att om en Tee flyttas så följer spellinjens startpunkt automatiskt med.

---

## Phase 2: Kartvisualisering & Hålvridning i MapComponent
- [x] Task: Uppdatera `MapComponent` för Tees, Spellinje & Hålvridning
  - [x] Lägg till `@Input() tees` och `@Input() targetLine`.
  - [x] Beräkna och rendera den tänkta spellinjen från den kopplade Tee:ns position via waypoints till Green center.
  - [x] Implementera bärningsberäkning (bearing) från valda hålets Tee till Green center.
  - [x] Implementera kartrotation för Hålinriktad vy (Tee längst ned, Green högst upp) med motroterade horisontella badges.
  - [x] Rendera delavstånd och totalsträcka för spellinjen.

---

## Phase 3: Spelläge & Orienteringsväxlare
- [x] Task: Integrera i `PlayRoundComponent`
  - [x] Skicka tees, spellinje och orienteringsläge till kartan i spelläget.
  - [x] Tillåt spelaren att välja aktiv Tee för hålet/rundan.
  - [x] Lägg till kompassknapp på kartan för att växla mellan "Hålinriktad (Tee ➔ Green)" och "Norr Upp".

---

## Phase 4: Enhetstester & Verifiering
- [x] Task: Bygge och tester
  - [x] Skriv enhetstester för bärningsberäkning, `TargetLine` och Tee-koppling.
  - [x] Verifiera ren kompilering med `npm run build`.
  - [x] Verifiera tester med `npm test`.
