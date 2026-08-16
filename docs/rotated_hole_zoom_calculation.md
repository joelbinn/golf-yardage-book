# Beräkning av Zoomningsgrad och Positionering för Rotera Hålvy (Hålinriktad)

Detta dokument beskriver den teoretiska bakgrunden, orsaken till varför standard kartinramning inte fungerar vid CSS-rotation, samt den exakta matematiska formeln för att beräkna zoomningsgrad och positionering av en hålinriktad kartvy.

---

## 1. Problemanalys: Varför Leaflets `fitBounds()` misslyckas vid kartrotation

När kartan roteras via CSS (`transform: rotate(\theta)`) på kartbehållaren `.map-rotate-wrapper` för att rikta Green högst UPP och Tee längst NED på skärmen, slutar Leaflets inbyggda `map.fitBounds()` att fungera korrekt av följande skäl:

1. **Leaflet känner inte till CSS-rotation**:
   Leaflets `fitBounds()` är utformad för en o-roterad karta (Norr Upp). Den beräknar utbredningen längs skärmens geografiska Nord-Syd- och Öst-Väst-axlar.
2. **Axel-förskjutning vid rotation**:
   Om ett hål går i Öst-Västlig riktning (t.ex. 277 meter långt Öst-Väst, men bara 30 meter brett Nord-Syd):
   - På en stående mobilskärm (smal bredd, hög höjd) försöker `fitBounds()` tvinga in hålets 277 meters längd i skärmens **bredd** (skärmens smala axel).
   - På den roterade skärmen har dock hålets 277 meters längd roterats så att den ligger längs skärmens **höjd** (mellan topbar och bottenkort).
   - Eftersom Leaflet tror att 277 meter skall få plats i skärmens smala bredd, beräknar den en alldeles för låg zoomnivå (t.ex. zoom 16/17 istället för 17.85), vilket gör att hela hålet krympte ihop i mitten av skärmen.

---

## 2. Exakt Matematisk Formel (`fitRotatedHole`)

För att beräkna den exakta zoomnivån och positioneringen som placerar **Green bakkant (B) direkt under topbaren** och **Tee ("Gul" m.fl.) direkt ovanför bottenkortet**, används följande trestegsformel:

### Steg 1: Beräkning av Tillgänglig Skärmhöjd ($H_{\text{tillgänglig}}$)

Skärmens nederkant täcks av både **den fasta bottenmenyn** ($68\text{px}$) och **det komprimerade kortet** ($118\text{px}$). 

Givet:
- Mobilskärmens totala höjd i pixlar: $H_{\text{skärm}}$ (t.ex. $844\text{px}$).
- Övre hinder ($Y_{\text{top}}$): Topbar-höjd ($78\text{px}$) + önskad toppmarginal ($17\text{px}$) = **$95\text{px}$**.
- Nedre hinder ($Y_{\text{botten}}$): Fasta bottenmenyn ($68\text{px}$) + komprimerat kort ($118\text{px}$) + önskad bottenmarginal ($15\text{px}$) = **$201\text{px}$**.

$$H_{\text{tillgänglig}} = H_{\text{skärm}} - Y_{\text{top}} - Y_{\text{botten}}$$
*(Exempel för $844\text{px}$ skärmhöjd: $844 - 95 - 201 = 548\text{px}$)*

---

### Steg 2: Beräkning av Exakt Zoomnivå ($Z$)

1. **Beräkna hålets faktiska avstånd i meter**:
   Givet Tee-position $(\text{lat}_1, \text{lng}_1)$ och Green bakkant $(\text{lat}_2, \text{lng}_2)$, beräknas distansen $D_{\text{meter}}$ (t.ex. $277\text{m}$).

2. **Önskad skala i meter per pixel**:
   $$\text{MetersPerPixel} = \frac{D_{\text{meter}}}{H_{\text{tillgänglig}}}$$

3. **Exakt Zoomnivå ($Z$) i Web Mercator-projektion**:
   Vid medellatitud $\phi$:
   $$\text{MetersPerPixel}(Z) = \frac{156543.03392 \times \cos(\phi)}{2^Z}$$

   Löst för $Z$:
   $$Z = \log_2 \left( \frac{156543.03392 \times \cos(\phi)}{\text{MetersPerPixel}} \right)$$

*Med `zoomSnap: 0.1` på Leaflet-kartan tillåts kontinuerlig/fraktionell zoom, vilket gör att $Z$ tillämpas med exakt precision utan att avrundas nedåt.*

---

### Steg 3: Beräkning av Exakt Positionering/Centrering ($C$)

1. **Geografisk mittpunkt ($C_{\text{mitt}}$)**:
   $$C_{\text{mitt}} = \left( \frac{\text{lat}_{\text{tee}} + \text{lat}_{\text{green\_back}}}{2}, \frac{\text{lng}_{\text{tee}} + \text{lng}_{\text{green\_back}}}{2} \right)$$

2. **Asymmetrisk förskjutning**:
   Eftersom det nedre hindret ($201\text{px}$) är större än det övre hindret ($95\text{px}$), förskjuts hålets visuella mittpunkt på skärmen uppåt från skärmens fysiska mittpunkt ($H_{\text{skärm}} / 2 = 422\text{px}$):

   $$\Delta Y_{\text{förskjutning}} = \frac{Y_{\text{botten}} - Y_{\text{top}}}{2} = \frac{201 - 95}{2} = +53\text{px}$$

3. **Geografisk justering**:
   Mittpunkten $C_{\text{mitt}}$ förskjuts geografiskt med $\Delta Y_{\text{förskjutning}} \times \text{MetersPerPixel}$ meter längs hålets bärningsvektor mot Green.

---

## 3. Resultat

När `map.setView(C_{\text{justerad}}, Z)` verkställs med fraktionell zoom:
- **Green bakkant (B-markören)** landar **exakt 17px under topbaren** ($Y = 95\text{px}$).
- **Tee-markören (Gul m.fl.)** landar **exakt 15px ovanför överkanten på det komprimerade kortet** ($Y = 844 - 201 = 643\text{px}$).
- Hålet utnyttjar 100.00% av det tillgängliga vertikala kartutrymmet perfekt utan att täckas av vare sig topbar, komprimerat kort eller bottenmeny.
