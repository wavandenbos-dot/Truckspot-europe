# TruckSpot Europe 1.0.18 — zichtbare GPS-rijrichting, geen schijnzekerheid over rijbaankant

## Verzoek van chauffeur
Na stabiliseren van het automatisch verschijnen van blauwe P-iconen tijdens het rijden (1.0.17) wil de chauffeur bepalen in welke rijrichting hij rijdt, zodat toekomstige parkeerwaarschuwingen geen parkeerplaatsen aan de overkant van de snelweg tonen.

## Deze veilige eerste stap
- GPS-positie op kaart krijgt een **groene koerspijl** die naar de actuele GPS-rijrichting wijst; kaartoriëntatie blijft noord-boven.
- Rijrichting komt uit de Android GPS-heading bij een plausibele rijsnelheid (>=2,5 m/s), of uit opeenvolgende GPS-posities (minimaal 50m, minimaal 1,5 seconde, maximaal 30s; afgeleide snelheid 2,5–45m/s). Kleine verschillen worden licht gestabiliseerd, scherpe koerswijzigingen niet weggemiddeld.
- Pijl wordt verborgen bij stilstand (<2m/s), nauwkeurigheid slechter dan 60m of verouderde locatie (>20s), of als de laatste bruikbare koers ouder is dan 6,5s.
- Een compact, niet-opdringerig tekstveld toont koersrichting (N, NO, O, enz.), graden en herkomst ('GPS-koers' of 'GPS-verplaatsing'). Meldingen worden niet voortdurend hardop aangekondigd.
- Het tekstveld zegt expliciet **'rijbaankant/toegang nog niet bevestigd'**. Dit is géén map matching en géén bewijs dat de parking via jouw rijbaan bereikbaar is.
- De gehele koersberekening gebeurt lokaal op de telefoon. Er worden geen nieuwe GPS-posities naar een server gestuurd.

## Veiligheidsgrens voor latere fase
- De 2km-approach popup blijft **uitgeschakeld** sinds 1.0.17. De GPS-koers alleen is onvoldoende om een parking aan de juiste snelwegkant te koppelen.
- Voor automatisch meldingen aanzetten is afzonderlijke, met echte weg-/afrit-topologie gecontroleerde matching nodig: OpenStreetMap wegen met richting en rijbaan, toegangswegen en inrit van parkeerplaatsen, bereikbaarheid via de gevolgde rijbaan, betrouwbaarheidscontrole en tests bij gescheiden rijbanen en afritten. Bij ontbrekende gegevens géén melding.
- Geen betaald Google Maps-product, Google Cloud-billing of overgenomen TransParking-database. Gratis Google Maps navigatielinks blijven beschikbaar.

## Bestaande functies behouden
- Offline Europese parkeerbestanden, automatisch verschijnen van blauwe P bij GPS-verplaatsing, voorzieningenfilters, favoriete parkings, opgeslagen gegevens, logo, vaste bediening, aparte beheer-APK.
- Driver-package `eu.truckspot.europe.stable` en afzonderlijk admin-package `eu.truckspot.europe.admin`, dezelfde signing-keystore. Chauffeur alleen **Bijwerken**; niet verwijderen.
- Pijl alleen binnen de geopende app en bij GPS-toestemming; geen gegarandeerde werking met app op achtergrond.

## Tests
- Inline JavaScript gevalideerd.
- Gesimuleerde GPS-data: stilstand/onbekende richting -> pijl verborgen; verplaatsing oostwaarts na voldoende afstand -> ~90° zichtbaar; GPS-heading 92° -> richting oost; slechte nauwkeurigheid -> pijl verborgen; GPS-koers noord -> 0°.
- Bevestigd geen automatische aanroep van `maybeWarnParkingAhead()`.
- Android-stable signed workflow bouwt beide APK's met versionName **1.0.18**, versionCode **118**.

## Beperkingen
Dit is fase 1 voor begrijpelijke GPS-koers, **niet** de gevraagde volledige herkenning van linker-/rechterrijbaan en bereikbare inrit. Die vraagt routegraph/matcher en echte weggedragtests. Geen claim dat nu correcte 2km-waarschuwingen beschikbaar zijn.
