# TruckSpot Europe V8 — zelfstandige Android-app

De TruckSpot-interface, het logo en de Leaflet-kaartbibliotheek worden **in de APK** opgenomen en vanaf een intern veilig HTTPS-adres geladen. De app laadt bij het openen dus **niet meer de Netlify-website**.

## APK
Open de pagina **Releases → TruckSpot Europe V8** en download `TruckSpot-Europe-V8-Standalone.apk`.

## GPS en veiligheid
- GPS-toestemming alleen tijdens het gebruik van de app.
- Locatiegebruik is optioneel.
- Google Maps en Street View worden extern geopend.
- Kaarttegels van OpenStreetMap en parkeerinformatie van Overpass hebben internet nodig.
- Bezettingsmeldingen en favorieten staan voorlopig alleen lokaal op het eigen toestel. Er zijn **geen gedeelde livebezettingsmeldingen**.
- Afstanden zijn hemelsbreed, geen vrachtwagenrouteberekeningen.
- Gratis testapp, geen officiële navigatie of tachograafoplossing.

## Bouwproces
GitHub Actions haalt uitsluitend bij de **eerste V8-build** een snapshot van de bestaande Netlify-V7-bron en van Leaflet op, past deze aan voor Android en slaat de bronbestanden op in deze repository. De gebouwde app gebruikt Netlify daarna niet voor de gebruikersinterface. Bij latere builds staan de appbestanden in GitHub.

## Belangrijk
Er is nog geen productiebackend, privacyverklaring of gegarandeerd beschikbare pan-Europese parkeerdata. Deze debug APK is **niet** klaar voor publicatie in Google Play. Het oude project Transport Uren is niet gewijzigd.


### V12: 1 november 2026 — kaart en GPS
- GPS-volgen gebruikt `panTo()` zonder het zoomniveau terug te zetten.
- Handmatig zoomen of slepen stopt GPS-volgen, zodat je de kaart vrij kunt bekijken.
- Na GPS-bepaling en bij de volgknop begint een parkeerzoekopdracht automatisch (één keer per sessie).
- Fouten in de parkeerbron zijn ook zichtbaar in het overzicht bij het getal 0.
- Android-testversie met eigen app-ID, naast eerdere testinstallaties.
