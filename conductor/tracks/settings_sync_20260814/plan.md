# Implementation Plan: Inställningar, Backup & GitHub-synk

> **Guidelines**:
> - All kodutveckling och arkitektur skall följa standarderna för moderna Angular Standalone Components, Signals och strikt TypeScript.
> - Gränssnitt och UX skall följa designskissen i [`doc/ui-sketch/Golf Yardage Book.dc.html`](file:///Users/joel.binnquist/projects/kod/joelabs/golf-yardage-book/doc/ui-sketch/Golf%20Yardage%20Book.dc.html).

---

## Phase 1: SettingsService & Global Enhetshantering (Meter / Yards)
- [ ] Task: Skapa `SettingsService` med enhetsval och persistent lagring
  - [ ] Skapa `src/app/services/settings.service.ts` med signaler för måttenhet (`unit: 'm' | 'y'`), GitHub-inställningar och formatering av avstånd.
  - [ ] Skapa datamodeller för inställningar och GitHub-konfiguration i `src/app/models/settings.model.ts`.
  - [ ] Uppdatera `PlayRoundComponent` och `CourseEditorComponent` för att använda `SettingsService.formatDistance()` / `unit()`.
  - [ ] Skapa enhetstester i `src/app/services/settings.service.spec.ts`.
  - [ ] Task: Phase Verification & Checkpoint

---

## Phase 2: JSON Backup (Export & Import) i StorageService
- [ ] Task: Implementera export- och importmetoder i `StorageService`
  - [ ] Lägg till `exportBackupData(): Promise<string>` som serialiserar banor, rundor och exporteringsdatum som formaterad JSON.
  - [ ] Lägg till `importBackupData(jsonString: string): Promise<{ coursesCount: number; roundsCount: number }>` som validerar och importerar kurser/rundor till IndexedDB/LocalStorage.
  - [ ] Skapa enhetstester i `src/app/services/storage.service.spec.ts` för export och import.
  - [ ] Task: Phase Verification & Checkpoint

---

## Phase 3: GitHub REST API Synkronisering & Kompaktering
- [ ] Task: Skapa `GithubSyncService`
  - [ ] Skapa `src/app/services/github-sync.service.ts`.
  - [ ] Implementera metoder för att läsa och skriva filer via GitHub Contents API (`PUT /repos/{owner}/{repo}/contents/{path}`).
  - [ ] Skapa logik för att synka `/courses/{course-id}.json`, `/rounds/{round-id}.json` och `/manifest.json`.
  - [ ] Implementera räknare för kompaktering och hantera automatisk sammanslagning efter var 5:e commit.
  - [ ] Hantera felkoder, nätverksfel och offline-läge med informativa felmeddelanden.
  - [ ] Skapa enhetstester i `src/app/services/github-sync.service.spec.ts`.
  - [ ] Task: Phase Verification & Checkpoint

---

## Phase 4: SettingsComponent UI & Navigering
- [ ] Task: Implementera `SettingsComponent` och konfigurera routing
  - [ ] Skapa `src/app/components/settings/settings.component.ts`, `.html`, `.css`.
  - [ ] Bygg enhetsväljare (Meter / Yards toggle).
  - [ ] Bygg GPS-precisionskort med signal från `GeolocationService` och färgindikator (grön/gul/röd).
  - [ ] Bygg GitHub-synkningskort med formulär för användarnamn, repo och Personal Access Token, synkstatus, kompakteringsindikator och "Synka nu"-knapp.
  - [ ] Bygg backup-knappar ("Exportera .json" med filnedladdning och "Importera .json" med filväljare).
  - [ ] Registrera rutt `/settings` i `src/app/app.routes.ts`.
  - [ ] Säkerställ att bottenmenyn i `nav-bar.component.html` navigerar aktivt till `/settings`.
  - [ ] Task: Phase Verification & Checkpoint

---

## Phase 5: Slutgiltig Verifiering & Polering
- [ ] Task: Kör bygge och testerna
  - [ ] Verifiera ren kompilering med `npm run build`.
  - [ ] Verifiera enhetstester med `npx vitest run`.
  - [ ] Task: Phase Verification & Checkpoint
- [ ] Task: Användargranskning & acceptans
  - [ ] Presentera resultat för användaren.
  - [ ] Du **MÅSTE** efterfråga och erhålla användarens godkännande för att spåret skall anses komplett 
