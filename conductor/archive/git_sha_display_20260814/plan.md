# Implementation Plan: Visning av Git SHA i Mer-menyn

---

## Phase 1: Generering av version.json vid bygge
- [x] Task: Skapa byggskript `scripts/generate-version.cjs`
  - [x] Hämta `git rev-parse HEAD`, `git rev-parse --short HEAD`, datum och klockslag.
  - [x] Generera `src/assets/version.json` och `public/version.json`.
- [x] Task: Uppdatera `package.json`
  - [x] Anropa `node ./scripts/generate-version.cjs` i `build` skriptet.

---

## Phase 2: UI & Kopiering i SettingsComponent
- [x] Task: Läs in version.json och uppdatera `SettingsComponent`
  - [x] Hämta `version.json` i `SettingsComponent.ts`.
  - [x] Lägg till klickbar sidfot med datum och klockslag i `settings.component.html`.
  - [x] Implementera `copyGitSha()` som kopierar fullständig SHA till urklipp och visar "Kopierad!".
  - [x] Lägg till CSS i `settings.component.css`.

---

## Phase 3: Enhetstester & Verifiering
- [x] Task: Bygge och tester
  - [x] Skriv enhetstest för `versionInfo` och `copyGitSha` i `settings.component.spec.ts`.
  - [x] Verifiera ren kompilering med `npm run build`.
  - [x] Verifiera 20/20 godkända tester med `npx vitest run`.
