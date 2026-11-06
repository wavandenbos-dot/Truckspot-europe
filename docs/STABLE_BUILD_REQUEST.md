# TruckSpot Europe 1.0.15 — blijvend zichtbare parkings en voorzieningen

## Aanleiding
De gebruiker heeft meerdere keren op Samsung vastgesteld dat parkeerplaatsen bij het verplaatsen en zoomen van de kaart verdwijnen. De TransParking-app toont parkeerplaatsen snel en geeft details over de beschikbare voorzieningen.

## Reparatie parkeerkaart
- **Map-cache in RAM:** eenmaal opgehaalde parkeerpunten blijven bekend wanneer de kaart wordt verschoven en teruggeschoven. Een lege nieuwe internet- of kaartopdracht mag eerder gevonden parkings niet wissen.
- **Voor deze kaartpositie:** alleen parkeerpunten in het zichtbare kaartgebied + lichte buffer worden getoond. De cache wordt begrensd om smartphonegeheugen niet te laten vollopen.
- **Minder flikkeren:** bestaande Leaflet-markers worden niet onnodig allemaal verwijderd en opnieuw gebouwd als dezelfde locatie-IDs, zoom en relevante parkeerstatus ongewijzigd zijn.
- **Klik op oude marker blijft werken:** de parkeerkaart kan details van een parking uit de cache tonen, ook nadat een ander gebied is ingeladen.
- **Offline-first:** bestaande Europese parkeerbestanden blijven prioriteit houden en geen Google Maps API of facturering voor de kaart.

## Voorzieningen (alleen als bron deze bevestigt)
- Overzicht op de detailpagina: toilet, douche, eten/restaurant, wifi, tankstation, winkel, drinkwater, stroom, wasmachine, reparatie en vermelde beveiliging.
- Bestaande filters voor deze voorzieningen blijven werken. De kaartpin toont een compacte indicatie, detailpagina het overzicht.
- Geen bronvermelding? Toon 'Geen voorzieningen in deze bron opgegeven' / onbekend. **Onbekend betekent niet afwezig**. Geen verzonnen wifi, beveiliging, douches of andere faciliteiten.
- Beveiligingsclaims zijn niet onafhankelijk gecontroleerd.

## Eerdere functies behouden
- De gekozen launcher, vaste bovenknoppen, gratis externe Google Maps route via Maps URL, actieve GPS en 2km-voorgrondwaarschuwingen met onbekende bezetting waar geen betrouwbare data zijn.
- Aparte beveiligde Beheer-app; geen admin in publieke chauffeurs-APK, geen autorisatie versoepelen.
- Bewaarde favorieten, meldingen en eigen parkeerplaatsen blijven staan: **Bijwerken, nooit verwijderen.**
- Parkeerbron is OpenStreetMap en de ingebouwde Europese dataset; we nemen geen auteursrechtelijk beschermde TransParking-dataset of code over.

## Regressietests
- Inline JavaScript compileert.
- Scenario kaart A -> B -> A herstelt parkeerpunten; lege laadbeurt doet geen punten verdwijnen.
- Voorzieningsoverzicht noemt alleen bevestigde eigenschappen; ontbrekende velden worden als onbekend behandeld.

## Build en distributie
Driver `eu.truckspot.europe.stable` stable **1.0.15** / `versionCode=115`. Privé beheer-app `eu.truckspot.europe.admin` apart ondertekend vanuit dezelfde workflow.
