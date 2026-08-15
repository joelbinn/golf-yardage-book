# Implementation Plan: Synkroniserad Kompakteringsräknare i GitHub-repot

---

## Phase 1: Inläsning & Uppdatering i GithubSyncService
- [x] Task: Uppdatera `fetchAndMergeRemote()` i `GithubSyncService.ts`
  - [x] Läs av `manifest.syncCount` och synka till `SettingsService.setSyncCommitCount()`.
- [x] Task: Uppdatera `syncAll()` i `GithubSyncService.ts`
  - [x] Säkerställ att det synkroniserade räknarvärdet skrivs till `manifest.json`.

---

## Phase 2: Enhetstester & Verifiering
- [x] Task: Bygge och tester
  - [x] Skriv enhetstest för fjärrmanifestets synkräknare i `github-sync.service.spec.ts`.
  - [x] Verifiera ren kompilering med `npm run build`.
  - [x] Verifiera 22/22 godkända tester med `npx vitest run`.
