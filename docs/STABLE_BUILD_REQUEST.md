# TruckSpot Europe 1.0.11 – geen storende aantallen-pop-ups meer

## Gebruikerstest op Samsung
- Automatisch laden van parkings bij schuiven/zoomen in versie 1.0.10 werkt nu goed.
- Sticky knoppen bovenaan werken.
- De steeds terugkerende pop-up met 'X vrachtwagenparkeerplaatsen gevonden' is niet wenselijk.

## Aanpassing
- Verwijder de toasts met het aantal gevonden vrachtwagenparkeerplaatsen uit `showParkingResults`. Er hoeft niet telkens een pop-up te verschijnen wanneer de kaart of GPS-zoekresultaten worden bijgewerkt.
- Parkeerkaart, lijst en de onopvallende status voor toegankelijkheid blijven normaal verversen.
- Belangrijke foutmeldingen, bevestigingen van eigen acties en de veiligheidswaarschuwing bij een naderende parkeerplaats (circa 2 km bij actieve voorgrond-GPS) blijven werken.
- Geen wijzigingen aan de automatische kaartzoeklogica en de 15 seconden online-throttling uit v1.0.10.

## Distributie
- Stable chauffeur-app `eu.truckspot.europe.stable`: **versie 1.0.11, versionCode 111**, hetzelfde gekozen icoon en dezelfde signingkeystore, bijwerken zonder verwijderen.
- Aparte beveiligde app `TruckSpot Beheer` blijft beschikbaar en ongewijzigd in werking. Geen beheerknop in de chauffeursapp.
- De workflow publiceert twee APK's met dezelfde codeversie. Bij alleen de meldingaanpassing is opnieuw installeren van de beheer-app niet nodig.
