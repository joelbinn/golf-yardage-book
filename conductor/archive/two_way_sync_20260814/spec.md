# Specification: Tvåvägssynkronisering & Remote Fetch/Merge

## Overview
Detta spår utökar `GithubSyncService` till att genomföra en komplett **Tvåvägssynkronisering** genom att hämta (fetch) och sammanfoga (merge) nya eller uppdaterade banor och rundor från GitHub innan lokala ändringar laddas upp (push).

---

## Functional Requirements

### 1. Remote Fetch & Base64 Avkodning (`GithubSyncService`)
- Implementera `getFileContent(path: string, cfg: GithubConfig): Promise<string | null>` som hämtar filer från GitHub och avkodar Base64 UTF-8 korrekt.
- Lägg till `fetchAndMergeRemote(cfg: GithubConfig)` för att läsa in fjärrmanifestet `manifest.json`.

### 2. Tidsstämpeljämförelse & Automatisk Merge
- För varje bana och runda i fjärrmanifestet:
  - Om objektet saknas lokalt eller har en nyare `updatedAt` på GitHub, hämtas filen från GitHub och sparas i `StorageService`.
- Ladda om lokala signaler i `StorageService` när nya eller nyare filer hämtats.

### 3. Integrering i `syncAll()`
- Anropa `fetchAndMergeRemote()` **först** i synkroniseringsflödet.
- Därefter laddas lokala banor och rundor upp till GitHub som vanligt.

---

## Acceptance Criteria
- [ ] `fetchAndMergeRemote()` läser in fjärrmanifestet och hämtar nya/uppdaterade filer från GitHub.
- [ ] Dataintegritet bevaras med tidsstämpeljämförelse (`updatedAt`).
- [ ] `syncAll()` genomför både fetch/merge och push.
- [ ] Enhetstester i `github-sync.service.spec.ts` täcker tvåvägssynken.
- [ ] `npm run build` och alla tester passerar utan fel.
