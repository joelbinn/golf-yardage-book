# Specification: Visning av Git SHA i Mer-menyn

## Overview
Detta spår lägger till automatisk generering och visning av projektets Git SHA (commit-hash) och byggdatum i sidfoten på "Mer"-sidan (`SettingsComponent`). Det gör det enkelt att verifiera exakt vilken källkodskommiterad version som körs i PWA-appen, samt kopiera SHA till urklipp med ett klick.

---

## Functional Requirements

### 1. Byggskript för Git-versionsfil (`scripts/generate-version.cjs`)
- Skapa ett Node-skript som körs automatiskt innan `ng build` i `package.json`.
- Skriptet hämtar det fullständiga Git SHA (`git rev-parse HEAD`), kort SHA (`git rev-parse --short HEAD`) samt nuvarande datum (`YYYY-MM-DD`).
- Skriver filen `src/assets/version.json` (t.ex. `{ "hash": "...", "shortHash": "...", "date": "2026-08-15" }`).

### 2. Visning i `SettingsComponent`
- Placera en diskret och stilren sidfot längst ned på "Mer"-sidan:
  `Commit: <shortHash>... • <date>`
- När användaren trycker/klickar på indikatorn kopieras hela det fullständiga Git SHA till urklipp via `navigator.clipboard.writeText(fullHash)`.
- Visa en tillfällig bekräftelseline ("Kopierad!") i 2 sekunder.

---

## Acceptance Criteria
- [ ] Byggskriptet i `package.json` genererar `src/assets/version.json` automatiskt vid `npm run build`.
- [ ] Sidfoten på "Mer"-sidan visar `Commit: <sha>... • <date>`.
- [ ] Klick på indikatorn kopierar hela Git SHA till urklipp och visar "Kopierad!".
- [ ] Enhetstester uppdateras och `npm run build` bygger utan fel.
