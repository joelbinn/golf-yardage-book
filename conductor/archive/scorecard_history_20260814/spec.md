# Specification: Digitalt Scorekort & Rundhistorik

## Overview
Detta spår lägger till digital föring av score (slag, puttar och fairway-träffar) direkt i banguidevyn ("Spela runda") samt skapar en dedikerad historiksida (`/history`) där spelaren kan se tidigare genomförda rundor, klicka fram fullständiga 18-håls scorekort, granska statistik (GIR %, FIR %, totala puttar, resultat vs Par) samt radera eller återuppta rundor.

## Functional Requirements
1. **Digital Scoreinmatning i "Spela runda" (`PlayRoundComponent`)**:
   - Inmatningskort med steppers (knappar − och +) för Slag (Strokes) och Puttar (Putts) per hål.
   - Knappar för Fairway-träff (`Vänster`, `Träff`, `Höger`, `N/A`) aktiva för Par 4- och Par 5-hål.
   - Relativ ställning i realtid i toppmenyn (t.ex. `E`, `+3`, `-1`).
   - "Avsluta runda"-knapp som beräknar `RoundStats`, ändrar rundans status till `completed` och navigerar till historiken.

2. **Automatisk Statistikberäkning (`StorageService`)**:
   - Beräkna automatiskt `totalScore`, `totalPar`, `scoreDiff`, `totalPutts`, `fairwaysHitCount`, `fairwaysTotal`, `fairwayPercentage`, `girCount`, `girPercentage`.
   - Green in Regulation (GIR) beräknas som `true` när bollen är på green på `Par - 2` slag (t.ex. 2 slag på par 4, 3 slag på par 5).

3. **Rundhistorik (`RoundHistoryComponent` på `/history`)**:
   - Visa alla sparade rundor i en överskådlig lista med banskort.
   - Varje kort visar datum, ban-namn, resultat vs Par, antal puttar, GIR % och FIR %.
   - Klickbart kort öppnar ett fullständigt 18-håls scorekort i en modal eller detaljvy.
   - Knappar för att radera rundor samt knappen "Fortsätt runda" för pågående rundor (`in_progress`).

4. **Navigering**:
   - Registrera ruten `/history` i `app.routes.ts`.
   - Koppla fliken `Historik` i bottennavigeringen (`nav-bar.component.html`).

## Non-Functional Requirements
- Reaktiv tillståndshantering med Angular Signals (`signal`, `computed`).
- Responsiv visualisering på både mobil och desktop.
- Ihållande lagring via `StorageService` (IndexedDB / LocalStorage).

## Acceptance Criteria
- [ ] Spelaren kan öka/minska slag och puttar för varje hål i "Spela runda".
- [ ] Toppmenyn uppdaterar ställningen i realtid.
- [ ] "Avsluta runda" sparar rundan som slutförd med korrekta statistikvärden.
- [ ] Navigering till `/history` visar listan med alla rundor.
- [ ] Klick på en runda i historiken öppnar det fullständiga 18-håls scorekortet.
- [ ] Pågående rundor kan återupptas och rundor kan raderas från historiken.
- [ ] Applikationen bygger utan fel (`npm run build`) och alla enhetstester passerar (`npx vitest run`).
