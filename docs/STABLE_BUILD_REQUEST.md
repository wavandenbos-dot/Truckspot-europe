# TruckSpot Europe 1.0.10 – reparatie kaart automatisch laden

Gebruiker heeft getest op Samsung:
- 🔒 Losse TruckSpot Beheer app 1.0.9 werkt.
- 📌 Bedieningsknoppen blijven bovenaan staan.
- ❌ Automatisch toevoegen/weergeven van nieuwe parkeerplaatsen bij schuiven/zoomen werkt nog niet betrouwbaar.

## Oplossingen in 1.0.10
1. **Direct zichtbare offline parkings** bij het verschuiven van de kaart, zelfs terwijl een oude online zoekopdracht nog loopt.
2. **Vernieuwde online wachtrij:** de 15-secondenlimiet veroorzaakt geen verloren kaartgebied meer. Na de wachttijd zoekt de app automatisch verder, zonder opnieuw op een knop te drukken.
3. **Geen verouderde resultaten:** asynchrone antwoorden van een vorig kaartgebied worden niet als resultaten van een nieuwe kaartpositie getoond.
4. **Echte HGV-parkeerplaatsen uit OpenStreetMap zichtbaar**, ook wanneer de overnachtingsregels in de bron onbekend zijn. De app toont dit als *overnachting niet bevestigd; borden controleren*, nooit als officiële toestemming.
5. Alleen de actuele laatste kaartpositie wordt verwerkt als de chauffeur snel meerdere keren schuift/zoomt. Negatieve online antwoorden worden 30 minuten gecachet zodat er niet telkens onnodige verzoeken worden gedaan.

## Niet gewijzigd
- De door eigenaar gekozen groene TruckSpot-app-icoon.
- Aparte beveiligde beheer-app met afzonderlijke package-id en Supabase Auth/RLS.
- Vaste bediening aan de bovenkant.
- GPS volgen en de beperkte 2-km-parkeerplaatswaarschuwing in **de geopende chauffeursapp**. De waarschuwing gebruikt rijrichting en hemelsbrede afstand; zonder betrouwbare live bezetting blijft het antwoord onbekend.
- Chauffeursdata, opgeslagen favorieten en correcties blijven op het apparaat. **Niet verwijderen**: APK bijwerken over 1.0.9.

## Build / distributie
Public driver: `eu.truckspot.europe.stable`, versionCode **110**, versionName **1.0.10**. Admin: `eu.truckspot.europe.admin` aparte update, identieke beveiliging.
De release bevat twee afzonderlijk getekende APKs.
