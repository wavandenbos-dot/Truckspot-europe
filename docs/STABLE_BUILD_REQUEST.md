# TruckSpot Europe 1.0.19 — GPS-vrachtwagen in plaats van pijl, ook mogelijke parkings met P

## Chauffeursfeedback
De GPS-rijrichting werkt op Samsung goed in 1.0.18. De chauffeur vraagt of de pijl een vrachtauto wordt die met de rijrichting meedraait. Bij sommige parkeerplaatsen staat nu een '?'; gebruiker wil consistente P-parkeermarkering.

## Wijzigingen
- Vervangt de groene driehoek boven het blauwe GPS-punt door een kleine **vrachtwagen van bovenaf**, als ingebouwde SVG zonder externe afbeeldingsrequests. De cabine wijst naar voren (noord bij 0°). Het bestaande GPS-koersalgoritme roteert de vrachtwagen mee (oost 90°, zuid 180°, west 270°).
- Onbekende/ongeldige koers: vrachtwagen verbergen, blauwe GPS-locatie blijft zichtbaar. De GPS-rijrichting en de beschrijving dat dit **geen bevestiging van de juiste rijbaankant** is, blijven intact.
- Mogelijke truckstop uit Fraunhofer ISI-onderzoeksbron krijgt in plaats van '?' een **grijze P met gestippelde rand**. Bevestigde HGV-parkeerplaatsen houden hun eigen bestaande blauwe P. De research-flag, bron, waarschuwing en details veranderen **niet**. Een P bewijst geen officiële HGV-toestemming, ingang of nachtparkeerrecht.
- De geautomatiseerde 2km-waarschuwing blijft **uitgeschakeld** tot een betrouwbare rijbaan- en inritcontrole bestaat. Er wordt geen ander bereikbaarheidsgedrag verzonnen.
- Behoudt offline-first Europese parkeerpunten, bestaande GPS-volgmodus met automatische markerverversing van 1.0.17, voorzieningen, gratis Google Maps-link, favorieten, opgeslagen gegevens en gescheiden beheerdersapp.

## Tests
- Inline JavaScript gecontroleerd op syntax.
- Gesimuleerd: GPS-heading 90° draait vrachtwagen naar rechts; 0° naar boven; onbekende heading verbergt vrachtwagen. Geen nieuwe aanroep van onveilige automatische pop-up.
- In de marker-html staat voor research-parkeerplaatsen 'P', terwijl class 'possible' en specifieke aria-label de herkomst herkenbaar houden.
- Geen nieuwe betaalde API of externe iconen.

## Release
Stable chauffeur-APK **1.0.19**, code **119**; package `eu.truckspot.europe.stable`, bestaande signing certificate. Alleen **Bijwerken**, niet verwijderen. Aparte beveiligde Beheer APK `eu.truckspot.europe.admin` hoeft niet opnieuw geïnstalleerd te worden.
