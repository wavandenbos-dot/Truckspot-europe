# TruckSpot Europe 1.0.17 — GPS-follow toont P's zonder handmatig schuiven, gevaarlijke waarschuwing uit

## Probleem aangetoond door chauffeur
- Tijdens rijden zijn sommige vrachtwagenparkings pas zichtbaar nadat de chauffeur de kaart handmatig beweegt.
- De automatische 2km-pop-up geeft regelmatig parkeerplaatsen aan de verkeerde kant van de snelweg als waarschuwing. Dit is een veiligheidsrisico.

## Vastgestelde codeoorzaken
1. `gpsFix()` verplaatst de kaart met `state.gpsProgrammaticMove=true`. De `moveend`-listener negeert bewust GPS-bewegingen en laadt daarom geen nieuwe parkings.
2. `fetchLocations()` eiste `state.searchMode==='map'`, maar `loadNearMe()` zet die modus tijdens rijden op `gps`. Daardoor wordt de kaart-cache nooit op basis van het nieuwe GPS-viewport aangevuld.
3. `visible()` sloot in de GPS-stand de bestaande kaart-cache buiten; de lijst bleef op een ouder GPS-bereik hangen.
4. De 2km-pop-up gebruikt hemelsbrede afstand plus heading. Dit kan NIET bepalen of een parking aan de juiste rijbaan / kant van een gescheiden snelweg ligt.

## Reparatie
- Bij een programmatic GPS-pan vernieuwt `gpsFix()` de kaart in de app zelf: `scheduleMapLoad(250)` zodra het viewport verschuift en er minstens ~350 m vanaf de laatste ophaalpositie of ~5,5 seconden verstreken zijn.
- Kleine opeenvolgende GPS-stappen tellen ook: drempel voor een afzonderlijke GPS-map-pan is ~5 meter i.p.v. 50 meter. Een reeks van 24-meter GPS-stappen activeert dus alsnog regelmatige automatische updates.
- `fetchLocations()` mag ook in `gps`-modus de lokale ingebouwde parkeerbestanden voor het huidige kaartgebied laden. Die locaties worden aan `mapSpotCache` toegevoegd zonder zoekmodus en GPS-lijst over te schrijven; dit geldt ook voor optioneel gecachete online aanvullingen.
- `visible()` gebruikt zowel de GPS-data als de kaart-cache voor de huidige kaartbounds.
- Bij echte viewport-beweging worden bestaande clusters opnieuw ingedeeld als de kaartpositie een nieuwe gridzone bereikt; dezelfde pins worden niet nodeloos voortdurend opnieuw opgebouwd.
- **Automatische 2km-approach pop-up is bewust tijdelijk uitgeschakeld**. Er is geen correcte rijbaankant-filter zonder route- / rijbaangeometrie en GPS-map matching; beter geen melding dan een verkeerde waarschuwing. In het scherm **Uitleg** staat dit expliciet vermeld. De UI mag geen onjuiste veiligheidsclaim geven.
- De chauffeur kan wel op een parking tikken en gratis de Google Maps-route openen; Google Maps is geen specifieke vrachtwagenrouter.

## Tests
- Inline JavaScript parseert.
- Gesimuleerde rit: 11 locatie-updates met ~24 m verplaatsing per seconde zonder handmatige mapbeweging => twee door GPS gestarte viewportverversingen.
- GPS viewport-resultaten worden aan `mapSpotCache` toegevoegd zonder de GPS-modus te wijzigen; geen netwerk nodig voor ingebouwde punten.
- Automatische aanroep `maybeWarnParkingAhead(pos)` is verwijderd; er blijft geen actieve automatische oproep over.
- APK-generatie en ondertekening voor publieke driver en aparte admin via bestaande release workflow. Zelfde package IDs, signing secret, favorieten en data blijven behouden.

## Release
Stable TruckSpot Europe chauffeur **1.0.17**, versionCode **117**, package `eu.truckspot.europe.stable`; een **Bijwerken**-installatie, niet verwijderen. Aparte private app `eu.truckspot.europe.admin` hoeft voor dit probleem niet bijgewerkt te worden.

## Beperkingen
Geen daadwerkelijke Samsung-wegtest uitgevoerd; de gebruiker moet dit nog stilstaan/veilig testen. Het bestand bevat wel Europese parkeerpunten; brongegevens kunnen nog locaties missen of niet geverifieerde nachtregels bevatten.
