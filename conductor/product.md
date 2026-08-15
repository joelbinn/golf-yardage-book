# Initial Concept

Golf Yardage Book är en Progressive Web Application (PWA) byggd i Angular för golfspelare. Applikationen använder GPS-positionering och satellitkartor (Leaflet + Esri) för att ge exakta avstånd till green (framkant, mitten, bakkant) och hinder (bunkrar, vatten, träd). Appen har offline-stöd via Service Worker & LocalStorage/IndexedDB och synkroniserar ban- och rund-data mot ett GitHub-repository via GitHubs REST API. Specifikationen finns i [doc/APPLICATION-IDEA.md](file:///Users/joel/kod/joelabs/golf-yardage-book/doc/APPLICATION-IDEA.md).

---

# Product Guide - Golf Yardage Book

## Referenser
* [APPLICATION-IDEA.md](../doc/APPLICATION-IDEA.md)

## Vision & Purpose
Golf Yardage Book är en modern Progressive Web Application (PWA) utformad för golfspelare som vill ha exakta GPS-avstånd och hålinformation direkt i sin mobila webbläsare, även när mobiltäckningen ute på golfbanan är obefintlig.

Applikationen ger avstånd till green (framkant, mitten, bakkant) och hinder, möjliggör registrering och redigering av banor, spårning av slag och scorekort under spel, samt automatisk och säker molnsynkronisering mot ett GitHub-repository.

## Core Features & Target Capabilities

### 1. Ban- och Hålhantering (Registrera Mode)
- Skapa och redigera golfbanor (9 eller 18 hål) med par och handicapindex per hål.
- Interaktiv satellitkarta (Leaflet + Esri World Imagery) för positionering av punkter.
- Registrering av 3 green-punkter per hål: Front, Center och Back.
- Registrering av obegränsat antal hinder per hål (Bunker, Vattenhinder, Träd, Custom) med beskrivning, ikoner och GPS-koordinater.

### 2. Spel- och Avståndsläge (Spela Runda Mode)
- Heltäckande interaktiv satellitkarta (Leaflet) som bakgrund med flytande rundad toppbar för hålnavigering, hålinfo, GPS-status, score och enhetsväxling.
- Utdragbar "Bottom Sheet" i underkanten (dockad ovanför bottenmenyn) med komprimerad green-avståndsvisning samt expanderat läge för hinder, slagspårning, scorekortskontroller och åtgärder.
- Live GPS-avståndsvisning till green (Front/Center/Back) och registrerade hinder.
- **Touch to Measure**: Klicka var som helst på satellitkartan för att mäta avstånd från spelarens GPS-position till den valda punkten.
- **Hybrid Slag- & Score-spårning**:
  - Slagspårning på kartan vid bollens landningsplats med automatisk slaglängdsberäkning och slagkedja.
  - Scorekort vid hålets slut för registrering av slag, puttar, fairwayträff (Vänster/Center/Höger/NA), GIR, bunkerslag och chippar.
  - Snabbregistrering av nya hinder på banan under pågående runda.
- Rundöversikt med sammanställd statistik (Score vs Par, Fairway %, GIR %, Snittputtar, Bunkerslag, Chippar).

### 3. Offline-First & Dataintegritet
- Fullständig offline-funktionalitet via Service Worker (`@angular/pwa`) för appskal, kartrutor (tile caching) och lokallagring.
- Lagring i `localStorage` / `IndexedDB`.
- Manuell JSON Export & Import för offline säkerhetskopiering och återställning.

### 4. GitHub REST API Synkronisering
- Synk av lokala ändringar mot användarens eget GitHub-repo via GitHub REST API och Personal Access Token (PAT).
- Banor lagras i `/courses/{course-id}.json` och rundor i `/rounds/{round-id}.json`.
- Automatisk kompaktering och städning av ändringshistorik efter var 5:e commit.

## Target Audience
Golfspelare på alla nivåer som önskar en lättanvänd, snabb, exakt och kostnadsfri banguide och scorekort-app i sin telefon utan krav på dyra prenumerationer eller tredjeparts-APIs.
