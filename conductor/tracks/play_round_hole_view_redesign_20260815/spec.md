# Specification: Redesign av Hålvy i "Spela Runda" (Play Round)

## Overview
Denna funktion redesignar Hålvyn i "Spela runda"-läget (`PlayRoundComponent`) för att ge spelaren en modern, intuitiv och heltäckande kartupplevelse på mobila enheter och desktop. Satellitkartan (Leaflet) upptar hela skärmytan som bakgrund. Ovanpå kartan placeras en flytande rundad toppbar för hålnavigering och GPS-status, samt en expanderbar/komprimerbar "Bottom Sheet" i underkanten (dockad direkt ovanför den fasta bottenmenyn `app-nav-bar`).

---

## Functional Requirements

### 1. Heltäckande Kartbakgrund (Full-screen Map Background)
- Kartan (`app-map`) ska sträcka sig över hela viewporten i bakgrunden (`position: absolute/fixed`, `inset: 0`).
- Kartan förblir interaktiv med touch-to-measure, zoom och panering i både komprimerat och expanderat läge för bottom sheet.
- Kartans inbyggda kontroller (zoom-knappar) ska placeras så att de inte täcks av toppbaren eller det komprimerade kortet.

### 2. Flytande Toppbar (Floating Pill Header)
- En avrundad rektangulär kapsel placerad i skärmens överkant med frostat glas-effekt (`backdrop-filter: blur()`, semi-transparent bakgrund).
- **Innehåll**:
  - Hålnavigering: Vänster- och höger-pilar (`<` och `>`) för att bläddra mellan hål.
  - Hålinformation: `Hål [X] · Par [Y] · HCP [Z]`.
  - GPS-status & noggrannhet: GPS-indikator-punkt samt exakt noggrannhetstext.
  - Enhetsväxling (M/YD) och aktuell score-badge (SCORE +1 / E).

### 3. Utdragbart Kort i Nedre Delen (Expandable Bottom Sheet Card)
- Ett överliggande kort placerat i skärmens nedre del, placerat direkt ovanför den fasta bottenmenyn (`app-nav-bar`).
- **Drag- och Klickhantering**:
  - Ett visuellt draghandtag (ett horisontellt streck/linje i överkanten av kortet).
  - Möjlighet att dra (touch-swipe / mus-drag) samt klicka på överkanten/draghandtaget för att växla mellan komprimerat och expanderat läge.
- **Komprimerat läge (Collapsed)**:
  - Visar endast avstånd till green: Framkant, Mitten (stor text) och Bakkant.
  - Har en kompakt höjd (~110-130px) för att lämna största möjliga del av kartan synlig.
- **Expanderat läge (Expanded)**:
  - Visar komplett information och funktioner:
    1. Avstånd till green (Fram, Mitten, Bak).
    2. Hinderlista med avstånd till olika hinder (bunkrar, vatten, träd, custom) samt möjlighet att snabbregistrera hinder.
    3. Slagregistrering: Knappar för "Registrera Slag" och "Ångra".
    4. Scorekortskontroller: Steppers för Slag och Puttar, samt selection chips för Fairwayträff (Vänster/Träff/Höger/NA).
    5. Rundåtgärder: "Avsluta runda".
  - Internt scrollbart innehåll vid begränsad skärmhöjd så att inga kontroller klipps bort.

### 4. Bevarande av Undre Navigeringsmeny (`app-nav-bar`)
- Den fasta bottenmenyn skall ligga kvar på sin plats längst ned och förbli synlig och klickbar.

---

## Technical Architecture & Implementation Notes
- **Component**: `PlayRoundComponent` (`src/app/components/play-round/play-round.component.ts`, `.html`, `.css`).
- **Reactivity & State**: Använd Angular Signals (`isExpanded = signal<boolean>(false)`, drag state signals).
- **Styling**: Vanilla CSS med CSS-variabler, `backdrop-filter`, touch drag event listeners (`touchstart`, `touchmove`, `touchend`) och smidiga CSS transitions.

---

## Acceptance Criteria
- [ ] Kartan täcker hela bakgrunden utan vita marginaler eller layoutskiftningar.
- [ ] Toppbaren flyter överst på kartan med frostat glas och innehåller hålnavigering, hålinfo, GPS-status, score och enhetsväxlare.
- [ ] Det nedre kortet har ett tydligt dragstreck i överkanten och kan expanderas/komprimeras genom klick eller drag-gest.
- [ ] I komprimerat läge visas endast green-avstånden (Fram/Center/Bak).
- [ ] I expanderat läge visas green-avstånd, hinderlista, slagregistrering, score-kontroller och avsluta-knapp.
- [ ] Appens fasta bottenmeny (`app-nav-bar`) är fortfarande synlig längst ned.
- [ ] Bygget kompilerar utan fel (`npm run build`).
