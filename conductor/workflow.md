# Development Workflow - Golf Yardage Book

## Track Execution Protocol
1. **Planning**: Skapa spec och plan i `conductor/tracks/<track_id>/` inför varje feature/task.
2. **Implementation**:
   - Använd skillet angular-developer 
   - Skapa reaktiva Angular-komponenter och services.
   - Använd Signals för reaktivt tillstånd och standalone-komponenter.
   - Säkerställ offline-kompatibilitet och felhantering.
3. **Verification**:
   - Verifiera bygge och tester via Angular CLI.
   - Kontrollera att kartvy, avståndsmätning och PWA Service Worker fungerar.
4. **Git & Commit**:
   - Tydliga commitmeddelanden (`feat:`, `fix:`, `docs:`).

## User Review Barriers
- Efter genomförande av varje track genomförs kodgranskning och verifiering.
