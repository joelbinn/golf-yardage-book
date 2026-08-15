# Implementation Plan: GitHub-Synkindikator i den Undre Menyn

---

## Phase 1: Signaler & Logik i GithubSyncService
- [ ] Task: Lägg till syncState och syncStateText i `GithubSyncService.ts`
  - [ ] Skapa `syncState` signal och `syncStateText` computed med förklarande svenska texter.
  - [ ] Uppdatera `syncState` vid händelser (`pending`, `synced`, `error`, `disabled`).

---

## Phase 2: UI-Indikator & Tooltip i NavBarComponent
- [ ] Task: Uppdatera `NavBarComponent` med statusprick och tooltip
  - [ ] Injektera `GithubSyncService` i `NavBarComponent`.
  - [ ] Lägg till `<span class="sync-dot">` med `[title]` i `nav-bar.component.html`.
  - [ ] Lägg till CSS för färger (grön/gul/röd/grå) och pulseringsanimering i `nav-bar.component.css`.

---

## Phase 3: Enhetstester & Verifiering
- [ ] Task: Bygge och tester
  - [ ] Skriv enhetstest för `syncState` i `github-sync.service.spec.ts`.
  - [ ] Verifiera ren kompilering med `npm run build`.
  - [ ] Verifiera med `npx vitest run`.
