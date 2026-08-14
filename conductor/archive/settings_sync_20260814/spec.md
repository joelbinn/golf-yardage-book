# Specification: Inställningar, Backup & GitHub-synk

## Overview
Detta spår implementerar modul 3.3 ("Inställningar, Synk & Backup") från kravspecifikationen. Det omfattar en dedikerad inställningsvy (`/settings`), global enhetshantering (Meter / Yards), visning av GPS-precision och status, manuell JSON-export och import för lokal backup, samt molnsynkronisering mot GitHub REST API med automatisk kompaktering efter var 5:e commit.

---

## Functional Requirements

### 1. Globala Inställningar & Enhetsval (`SettingsService`)
- Hantera global inställning för måttenhet: **Meter (`m`)** eller **Yards (`y`)**.
- Reaktiv signal som slår igenom omedelbart i kartvy, avstånd till green, hinder och slaglängder i `PlayRoundComponent`.
- Spara inställningar persistent i `localStorage` (`gyb_settings`).

### 2. GPS-Precision & Status
- Visualisera aktuell GPS-noggrannhet i realtid via `GeolocationService`.
- Tydlig färgkodad indikator:
  - **Grön**: `< 5 m` (Hög precision)
  - **Gul**: `5–15 m` (Godtagbar precision)
  - **Röd**: `> 15 m` (Låg precision / svag mottagning)
- Visa aktuell felmarginal i meter (t.ex. `±3 m`).

### 3. Manuell JSON Backup (Export & Import)
- **Exportera .json**:
  - Samla alla sparade banor (`Course[]`) och rundor (`Round[]`) samt versionsmetadata i ett JSON-objekt.
  - Skapa nedladdningsbar fil `golf-yardage-book-backup-YYYY-MM-DD.json`.
- **Importera .json**:
  - Ladda upp och validera en tidigare exporterad JSON-fil.
  - Importera och spara banor och rundor i `StorageService` (IndexedDB / LocalStorage) med användarbekräftelse vid dubbletter/skrivning.

### 4. GitHub REST API Synkronisering (`GithubSyncService`)
- Konfiguration i gränssnittet:
  - GitHub Användarnamn / Ägare (`owner`)
  - Repository-namn (`repo`)
  - Personal Access Token (`token`, lagras krypterat/säkert lokalt i `localStorage`)
  - Valfri branch (default: `main`)
- Synkroniseringsflöde:
  - **Push / Sync**:
    - Banor sparas som `/courses/{course-id}.json`.
    - Rundor sparas som `/rounds/{round-id}.json`.
    - `manifest.json` underhålls i repots rot med lista och timestamps över alla banor och rundor.
  - **Automatisk Kompaktering**:
    - Spåra antal genomförda commits/synkningar.
    - Efter var 5:e commit utförs automatisk städning och samlad struktur-commit enligt arkitekturspecifikationen.
  - Felhantering: Tydliga statusmeddelanden vid felaktig token, saknat repo, nätverksfel eller offline-läge.

### 5. Inställningsvy & Navigering (`SettingsComponent`)
- Skapa komponenten `SettingsComponent` med rutt `/settings`.
- Implementera UI enligt designskissen i `doc/ui-sketch/Golf Yardage Book.dc.html` (varma papperstoner, tydliga kort för enheter, GPS, GitHub och backup).
- Koppla ihop bottenmenyn flik "Mer" (`nav-bar.component.html`) till `/settings`.

---

## Non-Functional Requirements
- **Arkitektur**: Följ Angular Standalone Components, Signals och strikt TypeScript enligt `angular-developer`-guiderna.
- **Design & UX**: Följ styling och färgpalett från `doc/ui-sketch/Golf Yardage Book.dc.html`.
- **Säkerhet**: PAT-tokens får aldrig loggas eller exponeras oavsiktligt.
- **Offline-tolerans**: Vyn och backup-funktioner skall fungera fullt ut offline; GitHub-synk visar lämpligt offline-meddelande vid saknad nätverksanslutning.

---

## Acceptance Criteria
- [ ] Användaren kan växla mellan Meter och Yards i inställningarna och valet påverkar alla avståndsvisningar.
- [ ] GPS-precision visas med aktuell felmarginal och färgindikator.
- [ ] "Exportera .json" laddar ned en fullständig backup-fil med banor och rundor.
- [ ] "Importera .json" läser in en backup-fil och återställer datan i appen.
- [ ] GitHub-inställningar kan sparas och testas mot GitHub REST API.
- [ ] "Synka nu" laddar upp banor och rundor till angivet GitHub-repo och uppdaterar `manifest.json`.
- [ ] Kompakteringsräknare räknar upp och triggar kompaktering var 5:e commit.
- [ ] Navigering till `/settings` via bottenmenyn ("Mer") fungerar felfritt.
- [ ] Alla enhetstester passerar och `npm run build` bygger utan fel.
