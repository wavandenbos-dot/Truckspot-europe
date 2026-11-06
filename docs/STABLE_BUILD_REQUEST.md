# TruckSpot Europe 1.0.13 — gratis Google Maps-navigatie naar parkeerplaats

## Keuze van de eigenaar
- De eigen TruckSpot-parkeerkaart blijft op OpenStreetMap en de ingebouwde Europese parkeergegevens werken zoals in 1.0.12.
- Er komt **geen betaalde Google Maps-kaart, geen Google Cloud-billing, geen Routes-/Directions-/Places-API en geen API-sleutel**.
- Gebruiker kiest bij een parkeerplaats voor `🧭 Route via Google Maps` of `🧭 Navigeer met Google Maps`.
- De knop opent direct een officiële, gratis Google Maps URL met `api=1&destination=<lat,lng>&travelmode=driving&dir_action=navigate`.
- Google Maps kan op Samsung de navigatie starten vanaf de huidige locatie of een routevoorbeeld tonen. Als Maps niet geïnstalleerd is, opent de route in een geschikte browser.
- Let op: **Google Maps is geen vrachtwagennavigatie**; geen garanties over hoogte, gewicht, lengte, aslast, gevaarlijke stoffen of toegang tot het parkeerterrein. Borden blijven leidend.
- Deze functie vergt geen betaalde developer-API. De normale kosten van mobiel dataverkeer bij de telecomprovider kunnen wel gelden.

## Bestaande onderdelen niet veranderen
- Stable Android package-id `eu.truckspot.europe.stable` behouden, hetzelfde ondertekeningscertificaat en dezelfde lokaal opgeslagen gegevens/favorieten.
- Navigatie gaat via reguliere externe HTTPS-URL die al door MainActivity naar de browser/Google Maps-app wordt overgedragen.
- Separate `eu.truckspot.europe.admin` beveiligde beheer-app blijft hetzelfde.
- Kaart: offline-first, voorzichtige markeringen voor niet bevestigde truckstop-onderzoekslocaties.
- GPS-volgen, sticky knoppen, naderingsmelding bij circa 2km, geen verzonnen live parkeerbezetting.

## Validatie
- Inline JavaScript syntactisch gevalideerd.
- URL-test: `52.2604,4.687` geeft Google Maps /maps/dir/ met correcte coördinaten, `travelmode=driving`, `dir_action=navigate`, **zonder API key of route-API**.
- Bij foutieve coördinaten: geen navigatie, wel heldere foutmelding.
- Workflow bouwt en ondertekent beide aparte APK's; de gebruiker hoeft alleen chauffeur-APK bij te werken.

## Release
TruckSpot Europe **1.0.13** / `versionCode 113`, APK **Bijwerken** zonder verwijdering. Geen betaling, sleutel of Cloud-facturering instellen voor de Google Maps-navigatielink.
