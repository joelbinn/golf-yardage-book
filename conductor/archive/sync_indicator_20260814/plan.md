# Implementation Plan: GitHub-Synkindikator i den Undre Menyn

---

## Phase 1: Signaler & Logik i GithubSyncService
- [x] Task: Lägg till syncState och syncStateText i `GithubSyncService.ts`
  - [x] Skapa `syncState` signal och `syncStateText` computed med förklarande svenska texter.
  - [x] Uppdatera `syncState` vid händelser (`pending`, `synced`, `error`, `disabled`).

---

## Phase 2: UI-Indikator & Tooltip i NavBarComponent
- [x] Task: Uppdatera `NavBarComponent` med statusprick och tooltip
  - [x] Injektera `GithubSyncService` i `NavBarComponent`.
  - [x] Lägg till `<span class="sync-dot">` med `[title]` i `nav-bar.component.html`.
  - [x] Lägg till CSS för färger (grön/gul/röd/grå) och pulseringsanimering i `nav-bar.component.css`.

---

## Phase 3: Enhetstester & Verifiering
- [x] Task: Bygge och tester
  - [x] Skriv enhetstest för `syncState` i `github-sync.service.spec.ts`.
  - [x] Verifiera ren kompilering med `npm run build`.
  - [x] Verifiera 21/21 godkända tester med `npx vitest run`.
