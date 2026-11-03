# TruckSpot Europe 1.0.8 — overzicht van alle beoordelingen en compact scherm

Zelfde Android pakket `eu.truckspot.europe.stable`, versie 1.0.8 (versionCode 108). Installeer als **Bijwerken** over 1.0.7. De app niet verwijderen: favorieten, lokale nachtparkeercorrecties en eigen parkings blijven lokaal.

## Beheer, duidelijk en compact
- Het beveiligde scherm **🔒 Beheer** toont drie tabbladen: **⏳ Wachtend**, **✅ Goedgekeurd** en **❌ Afgewezen**.
- Standaard zie je **Wachtend** met goedkeuren/afwijzen. Na een beslissing verdwijnt de melding uit Wachtend, maar blijft staan in het tabblad Goedgekeurd of Afgewezen.
- De twee geschiedenisoverzichten zijn alleen-lezen: oude beoordelingen kunnen in deze versie niet opnieuw worden aangepast.
- Elk tabblad laat maximaal 80 correcties en 80 toegevoegde parkeerplaatsen zien (recentste eerst in het archief); de beheerder kan het overzicht handmatig vernieuwen.
- Het scherm is korter: tabs, een samenvattende regel, alleen relevante rubrieken en één toolbar in plaats van dubbele knoppen.
- Toegang blijft alleen voor geautoriseerde, **niet-anonieme** moderatoraccounts; de bestaande Supabase RLS wordt niet verslapt.
- Er is **geen automatische goedkeuring**, en het registratiescherm uit v1.0.7 blijft bestaan.

## Nachtparkeren direct herkennen
- Bij de kaart-pins, detailkaarten en parkeerplaatskaarten tonen we voortaan expliciet:
  - **✅ Nachtparkeren: JA · bronbevestigd** waar een gecontroleerde bron aanwezig is.
  - **🌙 Nachtparkeren: JA volgens chauffeur · niet officieel bevestigd** wanneer alleen een goedgekeurde chauffeursmelding dit ondersteunt.
  - **⛔ Nachtparkeren: NEE volgens chauffeur** bij een beoordeelde negatieve melding.
  - **🌙 Nachtparkeren: niet bevestigd** als officiële nachttoestemming niet bekend is.
- Een goedgekeurde chauffeursmelding blijft een melding, geen juridische toestemming. Lees nog steeds de verkeersborden, tijdslimiet en plaatselijke regels.
- Eerdere Nederlandse snelwegverzorgingsplaatsen behouden de tekst dat de nachtregels ter plaatse gecontroleerd moeten worden; de 24-uurslimiet is niet overal standaard.

## Beknopter op je Samsung
- Verkorte introductietekst boven de kaart.
- GPS-status begint met een korte aanwijzing.
- De zeven hoofdknoppen nemen op smalle schermen slechts drie compacte rijen in.
- De eerder weggehaalde V5-testbadge en grote status-overlay komen niet terug. De zoomknoppen blijven vrij.

## Uitvoer
De bestaande GitHub Actions signing workflow bouwt de gesigneerde stable APK met dezelfde app-id en keystore. Extra JavaScript-broncheck bestaat al voor `admin-parking.js`.

Versie: **1.0.8**, versionCode **108**, package **eu.truckspot.europe.stable**.
