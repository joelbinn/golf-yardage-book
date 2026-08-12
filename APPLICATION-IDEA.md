Golf Yardage Book
=================
Sammanfattning
--------------
Jag vill bygga en applikation där man, 
- givet sin GPS-position,kan få reda på hurlångt det är kvar till
  - mitten på green 
  - olika andra objekt på aktuellt
    - bunkrar
    - vattenhinder
    - träd
    - m.m
- kan registrera en bana och spara positioner för ovanstående objekt
- kan använa när man spelar en bana

Teknikstack
-----------
- Angular 22
- Spara i local storage
- Serva via github pages
- Local storage synkas till ett Github-repo via Githubs REST-API.

Krav
----
* Man skall kunna skapa och redigera banor
  - Ange namn 
  - Ange antal hål
* Man skall på en karta (satellitbild) kunna se var man är.
* Man skall enkelt kunna lägga till nya objekt för ett hål på en bana
  - Öppna hål för redigering 
  - När man står vid objektet skall man kunna lägga till en ny position för objekt, till hålet och namnge det

### Moder
Det finns två huvudmoder

#### Registrera
I denna mode skapar man en bana.

Man väljer mellan 9- och 18-hålsbana.

Man kan sedan bläddra mellan hål.

När man har ett hål öppet visas en satellitbildskarta för aktuell GPS-position.
I hålvyn kan man 
- registrera aktuell position och ange vad man registrerar
  * registrerar hål
    * Green-position
    * Positioner för andra objekt
      * Vattenhinder
      * Bunker
      * Träd
      * Egen text
- navigera till nästa/föregående hål


#### Spela runda
Man ska kunna spela en runda på en bana.

Man väljer vilket hål man startar på, default 1.

Man kan på liknande sätt som i _Registrera mode_ öppna hål och se satellitbildskarta.
I hålvyn kan man dessutom
* se indikator för gree och andra objekt
  * med ikon
  * med avstånd från aktuell GPS-position
* registrera 
  * slag (position där bollen landar)
  * score
  * fairwayträff
  * greenträff
  * antal puttar
  * antal bunkerslag
  * antal chippar
* snabbregistrera position för ett objekt och lägga till banan

### Synk till GitHub
- Det skall finnas en settings-vy
  - Beskrivning hur man gör för att sätta upp synkning
  - Ange token
- Github-repot skall kompakteras automatiskt efter var 5:e commit
