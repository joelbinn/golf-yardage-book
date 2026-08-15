# Implementation Plan: Visning av Git SHA i Mer-menyn

---

## Phase 1: Generering av version.json vid bygge
- [ ] Task: Skapa byggskript `scripts/generate-version.cjs`
  - [ ] Hämta `git rev-parse HEAD`, `git rev-parse --short HEAD` och datum.
  - [ ] Generera `src/assets/version.json`.
- [ ] Task: Uppdatera `package.json`
  - [ ] Anropa `node ./scripts/generate-version.cjs` i `build` och `deploy-to-github-pages` skripten.

---

## Phase 2: UI & Kopiering i SettingsComponent
- [ ] Task: Läs in version.json och uppdatera `SettingsComponent`
  - [ ] Hämta `version.json` via HTTP eller import i `SettingsComponent.ts`.
  - [ ] Lägg till klickbar sidfot längst ned i `settings.component.html`.
  - [ ] Implementera `copyGitSha()` som kopierar fullständig SHA till urklipp och visar "Kopierad!".
  - [ ] Lägg till CSS i `settings.component.css`.

---

## Phase 3: Enhetstester & Verifiering
- [ ] Task: Bygge och tester
  - [ ] Skriv enhetstest för `version.json` och `copyGitSha`.
  - [ ] Verifiera ren kompilering med `npm run build`.
  - [ ] Verifiera med `npx vitest run`.
