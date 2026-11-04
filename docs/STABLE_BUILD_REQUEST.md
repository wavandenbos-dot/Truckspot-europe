# TruckSpot Europe 1.0.9 + losse TruckSpot Beheer-app

## Twee gesigneerde Android apps (één release)
- **TruckSpot Europe** voor chauffeurs: `eu.truckspot.europe.stable`, versionCode 109, versionName 1.0.9, bestaande signingkeystore. **Bijwerken, niet verwijderen.** Lokale parkeerplaatsen, favorieten en correcties blijven behouden.
- **TruckSpot Beheer**: `eu.truckspot.europe.admin`, een aparte nieuwe installatie met het slot-icoon en dezelfde Supabase-database. Er is geen beheerknop, beheerscherm of admin-script in de publieke chauffeur-APK. De aparte APK start rechtstreeks op het beveiligde beheerscherm.
- In het beheer blijft de login met e-mailadres/wachtwoord nodig. De **server-side Supabase RLS** verleent toegang uitsluitend aan geautoriseerde **niet-anonieme** moderatoraccounts met `app_metadata.truckspot_moderator=true`. De aparte APK is géén beveiliging op zichzelf; inloggen blijft verplicht. Er zijn geen geheime API-sleutels of wachtwoorden ingebouwd. Er is geen automatische goedkeuring.

## Samsung-appicoon
- De chauffeur-app gebruikt het door de eigenaar gekozen herkenbare TruckSpot Europe-logo: witte vrachtwagen, felgroen 'SPOT', Europa-sterren en weg op een donkere achtergrond.
- Geoptimaliseerd voor het telefoonstartscherm als 160x160 WebP, opgenomen in de signed build via `branding/truckspot_launcher_160_q70.webp.b64`. Geen onleesbare wit-op-wit afbeelding of losse tekst onder het icoon.
- Beheer-app heeft een duidelijk afwijkend groen slot-icoon.

## Parkeerplaatsen automatisch laden
- De knop `Laad echte locaties` is verwijderd. Opstarten en ieder verschoven of gezoomd kaartgebied verversen de ingebouwde parkings automatisch.
- Binnen klein genoeg kaartgebied worden daarnaast automatisch **online OpenStreetMap/Overpass-parkings** geladen. Rate limit van 15 seconden en 30 minuten caching, netwerkvereiste, maximaal online zoekgebied ±85×110 km; bij storing blijven ingebouwde Europese gegevens beschikbaar.
- GPS-volgen wordt **niet meer uitgezet door slepen of zoomen**. Bij handmatige kaartinteractie krijgt de chauffeur ongeveer 15 seconden om te kijken; daarna kan automatische GPS-hercentrering hervatten.
- GPS en tracking starten pas na expliciete toestemming/actie; geen permanente GPS-volging als de Android-app gesloten is.

## Sticky knoppen
- Regio, zoeken, GPS, Volg mij, Zoek bij mij, Google Maps, Filters, Rijtijd en radius blijven op Samsung via een sticky bediening bovenin zichtbaar wanneer de app wordt gescrold.

## Naderende truckparking (ongeveer 2 km)
- Als chauffeur **GPS-volgen actief heeft en app op de voorgrond**, wordt bij nadering binnen **2 km hemelsbreed** en richting de parking een **niet-blokkerende melding** getoond, automatisch verborgen na ±12,5 seconden.
- Rijsnelheid en GPS-richting worden benut waar beschikbaar; anders wordt richting afgeleid uit opeenvolgende GPS-posities.
- Maximaal één melding per 85 seconden en dezelfde parking niet opnieuw binnen 1 uur; geen telefoonscherm- of achtergrondsysteemnotificaties, geen stuurhandelingen vereist.
- **Bezetting onbekend** als er geen recente betrouwbare cijfers zijn. Indien beschikbaar wordt uitsluitend de **eigen lokale testmelding** als zodanig gelabeld: nooit doen alsof die live of openbaar geverifieerd is.
- De 2 km zijn **hemelsbreed** en **geen exacte afstand langs de weg**. Bij sterk afwijkende wegloop, GPS-storing of ontbrekende rijrichting kan de melding uitblijven.

## Build/test
- Controleer aparte package-IDs en handtekeningen, beide assets in dezelfde release, chauffeur-APK zonder admin assets, beheer-APK met eigen startpagina, valid HTML/JS, beschikbaarheid van appicoon, stabiele Android update.
- Eerste test op een veilige stilstaande locatie: parkeerplaatsen op de kaart verschuiven/zoomen, GPS volgen en daarna kaart verslepen, melding testen met voorgrond-GPS, beheerlogin in aparte app.

Versie chauffeur: **1.0.9** (`109`). Beheer: **1.0.9** (`109`), losse package ID.
