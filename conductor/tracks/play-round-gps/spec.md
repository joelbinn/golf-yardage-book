# Specification: Spela Runda – Live GPS & Avståndsmätning

## Core Guidelines & Skill Usage
1. **Developer Skill**: Skillet [`angular-developer`](file:///Users/joel/.gemini/config/skills/angular-developer/SKILL.md) skall användas för all komponent- och tjänsteutveckling (Angular Signals, Standalone Components, `@if`/`@for` Control Flow syntax).
2. **UX & Visuell Design**: Gränssnitt och UX skall strikt följa designskissen i [`doc/ui-sketch/Golf Yardage Book.dc.html`](file:///Users/joel/kod/joelabs/golf-yardage-book/doc/ui-sketch/Golf%20Yardage%20Book.dc.html) och appens färgtema (`#f5ead8`, `#201e1d`, `#ebddc5`, `#c67139`, typografi `Caprasimo` & `Figtree`).

## Overview
Implementera gränssnitt och logik för **Spela Runda (Play Round Mode)** med fokus på live GPS-positionering, avståndsvisning till green (Front/Center/Back) och hinder, "Touch to Measure"-funktion på satellitkartan, enhetsväxel (Meter/Yards) samt GPS-precisionsindikator.

## Functional Requirements

1. **Rundastart & Navigering**:
   - Starta en ny runda genom att välja en sparad bana och starthål (1–9/18).
   - Skapa och spara den aktiva rundan i `StorageService` (`activeRound` och `rounds` samling).
   - Enkel hålnavigering (Föregående / Nästa hål) under spelets gång.

2. **Live GPS & GPS-precisionsindikator**:
   - Kontinuerlig GPS-spårning via `GeolocationService`.
   - Visning av spelarens nuvarande position som en interaktiv indikator på satellitkartan.
   - Visuell GPS-precisionsindikator i gränssnittet:
     - Grön (`< 5m`)
     - Gul (`5–15m`)
     - Röd (`> 15m`)
     - Textuell visning av felmarginal i meter (t.ex. `± 3m`).

3. **Live Avståndsvisning (Green & Hinder)**:
   - Panel som kontinuerligt beräknar och visar exakta avstånd från spelarens GPS-position till:
     - Green Front (Framkant)
     - Green Center (Mitten)
     - Green Back (Bakkant)
     - Samtliga hinder på det aktuella hålet.
   - Enhetsomkopplare: Växla enkelt mellan **Meter** och **Yards** (sparad inställning).

4. **Touch to Measure (Interaktiv mätning)**:
   - Klicka/tryck på valfri punkt på satellitkartan.
   - Ritar ut en linje/hårkors från spelarens GPS-position till den klickade punkten.
   - Visar uppmätt avstånd i vald enhet (m/yd) vid målpunkten/på kartan.

5. **Kartkontroller & Snabbregistrering**:
   - Knapp för att centrera kartan på spelarens GPS-position.
   - Knapp för att centrera kartan på greenen.
   - **Snabbregistrera hinder**: Möjlighet att snabbt lägga till ett nytt hinder (typ, namn) på nuvarande GPS-position under pågående runda.

## Acceptance Criteria
- [ ] Utvecklingen följer best practices från skillet `angular-developer`.
- [ ] Användaren kan starta en ny runda från en vald bana.
- [ ] Satellitkartan visar spelarens live-GPS-position och precisionsindikator med färgkodning.
- [ ] Avstånd till green (Front/Center/Back) och hinder beräknas och visas i realtid.
- [ ] Touch to Measure fungerar vid klick på kartan och mäter avstånd från spelaren till punkten.
- [ ] Omkoppling mellan Meter och Yards uppdaterar alla avståndsvärden omedelbart.
- [ ] Snabbregistrering av hinder sparar det nya hindret på banan i `StorageService`.
- [ ] `npm run build` och alla tester passerar utan fel.
