# Implementation Plan: Synkroniserad Kompakteringsräknare i GitHub-repot

---

## Phase 1: Inläsning & Uppdatering i GithubSyncService
- [ ] Task: Uppdatera `fetchAndMergeRemote()` i `GithubSyncService.ts`
  - [ ] Läs av `manifest.syncCount` och synka till `SettingsService.setSyncCommitCount()`.
- [ ] Task: Uppdatera `syncAll()` i `GithubSyncService.ts`
  - [ ] Säkerställ att det synkroniserade räknarvärdet skrivs till `manifest.json`.

---

## Phase 2: Enhetstester & Verifiering
- [ ] Task: Bygge och tester
  - [ ] Skriv enhetstest för fjärrmanifestets synkräknare i `github-sync.service.spec.ts`.
  - [ ] Verifiera ren kompilering med `npm run build`.
  - [ ] Verifiera med `npx vitest run`.
