# TruckSpot Europe 1.0.14 — stabiele parkeerkaart en voorzieningen

## Aanleiding
Gebruiker wil een zo compleet mogelijke **gratis** vrachtwagenparkeerkaart zoals TransParking, en meldt dat onze parkeerplaatsen na verschuiven of bij GPS-volgen soms verdwijnen of voortdurend opnieuw laden. Extra verzoek: **faciliteiten**.

## Kaart en GPS stabiliteit
- De openbaar zichtbare schermen/ontwikkelaarsteksten van TransParking tonen veel herkenbare parkeerplaatsmarkeringen, filterbare faciliteiten en een parkeerkaart die ook offline beschikbaar was. De eigen/proprietaire TransParking-code is niet toegankelijk; er is geen code of database overgenomen.
- In de TruckSpot-code werd `draw()` op **iedere GPS-update** aangeroepen, waardoor alle Leaflet-parkeermarkeringen en tientallen parkeerkaarten steeds opnieuw werden opgebouwd. Dat is nu teruggebracht tot hoogstens af en toe een hertekening van de resultatenlijst na 2 km daadwerkelijk verplaatsen en minimaal 45 seconden.
- Leaflet blijft bestaande parkeerplaatsmarkeringen zelf verplaatsen, zonder ze telkens te verwijderen. De offline-first database verschijnt voordat langzame online aanvullingen binnenkomen.
- Op elke zoomstand tonen we bekende HGV-parkings én een beperkt aantal **mogelijke** Fraunhofer-onderzoekslocaties. Bekende parkeerplaatsen: **blauwe P**. Onbevestigde onderzoekslocaties: **grijs vraagteken**, nooit als wettelijk toegestane overnachting.
- Het aantal detailkaarten wordt beperkt tot 70 voor betere Samsung-prestaties, terwijl alle passende punten op de kaart zichtbaar kunnen blijven; zoom in voor meer details.
- Online OpenStreetMap blijft optioneel, zonder Maps API-kosten. Supabase-verversing voor gedeelde plekken gebeurt hoogstens iedere twee minuten na kaartinteractie; handmatige knop blijft.
- Ook bij GPS-zoekresultaten zijn mogelijke offline locaties beschikbaar wanneer er geen bevestigde HGV-parking dichtbij is. Niet op twee trage externe Overpass-servers wachten; GPS-online fallback maximaal 12 seconden en één endpoint.

## Faciliteiten
- Bestaand en behouden: 🚻 toilet, 🚿 douche, 🍽️ restaurant, 🔐 beveiliging.
- Nieuw: 📶 wifi, ⛽ tankstation, 🛒 winkel, 💧 drinkwater, 🔌 stroom, 🧺 wasmachine, 🛠️ reparatie.
- Icoontjes en labels op de detailkaarten, in de parkeerplaatsdetails en kort in de parkeerplaatspop-up. Nieuwe selectievakjes onder **⚙ Filters**.
- Faciliteiten komen uitsluitend uit expliciete OpenStreetMap-tags op die parking of uit de bestaande compacte catalogusvelden. Bij ontbrekende data worden ze **niet** als beschikbaar getoond en evenmin als niet aanwezig bestempeld; onbekend betekent niet nee.
- Geen nieuwe officiële nachtparkeren-, capaciteit- of realtime bezettingsclaims. Faciliteiten, toegang en veiligheidsinformatie kunnen verouderd zijn; controleer ter plekke.

## Geen nieuwe kosten
- Eigen OpenStreetMap-kaart en bestaande offline bron.
- Google Maps-navigatie via gratis URL; geen Google Maps SDK, sleutel of Google Cloud-facturering.
- Geen nieuwe betaalde dienst of abonnement.

## Bestaande functies
- Publieke driver-app `eu.truckspot.europe.stable`, **versie 1.0.14/versionCode 114**. Origineel TruckSpot-logo en bestaande Android-handtekening.
- Aparte beveiligde `eu.truckspot.europe.admin` beheerapp blijft werken zonder update.
- Bewaarde favorieten, eigen parkings en correcties blijven bij **Bijwerken**.
- Sticky knoppen, GPS-volgen en veiligheidsbeperkte 2km-parkeerplaatswaarschuwing blijven behouden.

## Validatie
- Inline JS syntax gecontroleerd.
- Gegevensveldtests: 11 faciliteiten verschijnen uitsluitend als de bron ze meldt; wifi-filter toont geen onbevestigde wifi. 35 bekende parkings plus één kandidaat in het kaartgebied geeft ook de kandidaat terug zonder nachtparkeren te bevestigen.
- Gesimuleerde 21 opeenvolgende GPS-posities: maximaal twee hertekeningen i.p.v. iedere GPS-fix.
- Klaar voor praktijkcontrole op Samsung; fysieke toestellen en netwerkverbindingen zijn niet door de connector te testen.

## Release
Build two signed APKs; gebruiker hoeft alleen chauffeur-app naar **1.0.14** bij te werken, nooit uninstall.
