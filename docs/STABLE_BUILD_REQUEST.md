# TruckSpot Europe 1.0.16 — complete ingebouwde databestanden, GPS alleen voor positie

## Feedback / uitgangspunt
De chauffeur heeft gelijk: indien de parkeerbestanden in de APK staan, moet het tonen van parkeerplaatsen niet afhankelijk zijn van GPS, netwerkvertraging of externe servers. De kaart moet direct parkeerplaatsen kunnen weergeven waar men ook naartoe schuift, ongeacht GPS-toestemming.

## Oplossing
- Ingebouwde onafhankelijke Europese bronbestanden blijven in de APK; er is **geen TransParking-database overgenomen**. TransParking-data zijn niet vrij voor hergebruik. Fraunhofer ISI (CC BY 4.0) en OSM (ODbL, attributie) zijn bestaande bronnen.
- **Geen kunstmatige weergavelimieten in de kaartdataselectie**: oude 280/480/850 'verified' en 130/200/280 'research' caps plus MAX_RESULTS en MAP_CATALOG_LIMIT slicing zijn bij de lokale kaartquery weg. Alle punten binnen de huidige kaart-bounds worden doorgegeven aan bestaande markerclustering (dicht opeen: clustergetal, inzoomen: aparte marker).
- Beide lokale bestanden worden samengevoegd; onbekende onderzoekslocaties blijven herkenbaar als onbevestigd. Deduplicatie met snelle nabijheids-hash zodat 18k+ puntvergelijking niet kwadratisch traag wordt.
- **GPS = alleen positie/afstand/2km waarschuwing**, niet het opvragen van parkeerplaatsen van internet. `loadNearMe()` gebruikt `trustedCatalogNear()` én `catalogNear()`, ook als een van beide al resultaten gaf. Lokaal bekende kaartplekken mogen meedoen, maar GPS-locatie wordt niet als webquery verstuurd.
- De kaart werkt ook als geen GPS-toestemming gegeven is. Kaarttegels en eventueel aanvullende, optionele gebiedsdata kunnen wel internet vereisen. Deze gebiedsaanvulling gebruikt de actuele kaart-bounds en geen GPS-coördinaten.
- Behoud gratis externe Google Maps-navigatie via Maps URLs, aparte beheer-app, logo, voorzieningen, individuele parkeergegevens, bestaande lokale favorieten en 2km-voorgrondmeldingen.

## Juridisch en datakwaliteit
- Geen ongeoorloofde overname of scraping van TransParking-gegevens.
- 'Mogelijke onderzoeksplek' wordt niet als officieel goedgekeurde truckparking of toestemming om te overnachten getoond.
- Geen verzonnen live bezetting of voorzieningen; toon onbekend indien gegevens ontbreken.
- Markerclusters bij ver uitzoomen zijn noodzakelijk voor snelheid: geen verloren data, inzoomen toont aparte plekken.

## Test
- Inline JavaScript compileert.
- Gesimuleerde kaart met 900 geverifieerde + 700 potentiële onderzoekslocaties -> **1.600 punten** zonder onnodige inhoudslimieten (ook op laag zoomniveau).
- GPS simulatie leest beide bestanden; 4 verified + 4 mogelijke = 8 zichtbare spots, **geen** network calls.
- De daadwerkelijke Samsung-weergave blijft nog door gebruiker te testen.

## Distributie
Stable driver **1.0.16**, `versionCode=116`, package `eu.truckspot.europe.stable`, identieke signingkeystore; bijwerken zonder verwijderen. Beheer `eu.truckspot.europe.admin` aparte ondertekende APK met ongewijzigde beveiliging.
