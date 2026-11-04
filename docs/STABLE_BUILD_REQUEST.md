# TruckSpot Europe 1.0.12 — parkeermarkers direct bij kaartbeweging

## Gebruikersfeedback op 1.0.11
- Kaart heeft moeite om parkeerplaatsen te laden.
- Zodra de gebruiker de kaart verschuift, verschijnen geen nieuwe parkings meer.
- Gebruiker wil bovendien de lange rood gemarkeerde uitlegtekst niet in het hoofdscherm zien.

## Oplossing
- De kaart is nu **offline-first**: hij toont meteen de ingebouwde HGV-parkeerplaatsen, zonder op de online Overpass-service te wachten.
- Waar het gecontroleerde HGV-bestand weinig resultaten geeft, toont de app ook **Fraunhofer ISI v04-onderzoekslocaties** (ingebouwd bestand met 13.323 Europese punten), expliciet als **mogelijke truckstop** met waarschuwing dat toegang en nachttoestemming niet zijn bevestigd. Geen automatische toestemming voor overnachten.
- Bij verschuiven of zoomen komt steeds een verse lijst voor de nieuwe kaartpositie; antwoorden voor een oudere kaartpositie kunnen die niet overschrijven. Er is geen blokkade meer vanwege een lopende online zoekopdracht.
- Online OpenStreetMap is alleen een aanvullende bron: maximaal één zoekopdracht per 60 seconden, alleen op ingezoomde kaarten tot circa 32 x 42 km, maximaal 8 seconden wachten aan de JavaScript-kant en **geen serie alternatieve trage websites** voor automatisch laden. Bij fouten volgt een stille wachttijd van vijf minuten. Kaart blijft werken met embedded datasets.
- Een gedeelde-database-verversing wordt gedebounced, zodat niet iedere kaartwijziging een extra Supabase-aanvraag veroorzaakt.
- De overbodige uitlegstroken en de grote toelichtende tekst bij de kaart zijn verborgen. Volledige bronvermelding en disclaimers staan onder **ℹ Uitleg**; OpenStreetMap-attributie blijft op de Leaflet-kaart zichtbaar.

## Bestaande functies behouden
- GPS-volgen stopt niet bij slepen/zoomen; 2km-naderingsmelding werkt alleen met geopende app en actieve voorgrond-GPS.
- Live bezetting wordt **niet verzonnen**: onbekend blijft onbekend.
- Geïnstalleerd appicoon blijft het door de eigenaar gekozen TruckSpot-logo.
- Sticky knoppen blijven bovenaan staan.
- Beheer blijft een aparte Android-app met server-side Supabase moderatorcontrole; publieke APK bevat geen beheerpagina.
- Geen verandering aan lokale favorieten, eigen parkeerplaatsen of opgeslagen wijzigingen.

## Release
Stable chauffeur-app **1.0.12** / `versionCode=112`, vaste pakketnaam `eu.truckspot.europe.stable`, zelfde signing secret en updatepad. Private beheer-APK heeft afzonderlijk pakket `eu.truckspot.europe.admin`. Installeer via **Bijwerken**, nooit de chauffeursapp verwijderen.

## Tests
- Ingelezen inline JavaScript is syntactisch gevalideerd.
- Gesimuleerd: twee lokale research-parkings verschijnen vóór antwoord van online bron; na kaartbeweging mag een oud online antwoord niet overschrijven.
- Bewaking voorkomt onbedoelde aanduiding van research-punten als officieel toegestane nachtparkings.
- Productiebuild controleert beide APKs met Android `apksigner` en hetzelfde signing certificate als eerdere stable builds.
