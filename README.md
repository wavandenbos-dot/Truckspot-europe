# 🚛 TruckSpot Europe — zelfstandige Android-testapp

TruckSpot Europe is een gratis prototype voor vrachtwagenchauffeurs. De Android-app bevat nu zijn **eigen ingebouwde startscherm** (net als de Transport Uren-app). Hij verwijst **niet meer naar Netlify tijdens gebruik**.

## Werking
- Startscherm, kaartbediening, logo en zoekfilters zitten in de APK.
- GPS gebruikt Android-locatietoestemming tijdens gebruik. App-locatie werkt via het beveiligde interne WebView-adres `https://appassets.androidplatform.net/assets/index.html`.
- OpenStreetMap-kaarttegels, externe parkeerdata en Google Maps / Street View hebben wel internet nodig.
- Parkeerplaatsen zijn externe gegevens met wisselende dekking; 'bezetting onbekend' betekent geen realtime informatie.
- De eerste versie importeert de bestaande V7-broncode eenmalig vanuit de bestaande publieke testwebsite en bewaart hem vervolgens in deze repository. Daarna worden de lokale bestanden in volgende APK's gebruikt.
- Android-app is een testbuild. Geen officiële rijtijdenregistratie, gecertificeerde trucknavigatie of garantie van vrije plekken.

## APK downloaden
Open **Releases** en kies `TruckSpot-Europe.apk`. Dit is een direct te installeren test-APK.

## Opmerking over updates
Elke APK die met GitHub Actions als **debug APK** wordt gebouwd kan met een andere debugsignatuur worden ondertekend. Bij een melding dat een update niet geïnstalleerd kan worden, verwijder de oude testversie en installeer opnieuw. Maak voor brede verspreiding een stabiel ondertekende releasebuild.

## Publicatie en licenties
OpenStreetMap-data vereisen bronvermelding. OSM-tiles en publieke Overpass-servers zijn niet geschikt voor onbeperkte aantallen gebruikers; voor publieke release is geschikte kaart-/datacapaciteit nodig. De broncode van deze repository staat openbaar. Geen wachtwoorden, API-sleutels of persoonsgegevens erin opslaan.
