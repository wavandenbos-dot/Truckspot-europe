# TruckSpot Europe 1.0.4 — chauffeurscorrecties samen delen na beoordeling

Deze update gebruikt dezelfde Android-app-ID (`eu.truckspot.europe.stable`) en dezelfde ondertekening als 1.0.3. **Bijwerken, niet verwijderen**: eigen parkeerplaatsen, favorieten en bestaande lokale correcties blijven dan op de Samsung staan.

## Wat is nieuw?
- Bestaande parkeerplaats: open **Details → Nachtparkeren aanpassen**, kies ja/nee, vul een gecontroleerde toelichting in en bewaar de wijziging lokaal.
- Open de details opnieuw en kies **🌍 Correctie insturen voor controle**. De gebruiker bevestigt expliciet dat locatie en toelichting na goedkeuring openbaar kunnen worden.
- Gedeelde chauffeurcorrecties worden in een afzonderlijke Supabase-tabel `truckspot_parking_corrections` opgeslagen als `pending`, nooit meteen als bevestigd. Alleen bevoegde databasebeheerders kunnen een rij goedkeuren of afwijzen.
- De app haalt goedgekeurde correcties op, toont ze als **beoordeelde chauffeursmeldingen, niet als officiële toestemming** en blijft bronbevestigde nachtparking onderscheiden van meningen van chauffeurs.
- De eigen lokale correctie heeft altijd een afzonderlijke aanduiding. Insturen gebeurt niet automatisch.
- De bestaande gedeelde parkingfunctie en ingebouwde Europese kaart blijven actief.

## Veiligheid en privacy
- Geen geheime server- of beheerder-API-sleutels in de APK; alleen de publieke Supabase-clientconfiguratie.
- Row Level Security laat alleen `approved` chauffeurmeldingen uitlezen. Aanmaken is beperkt tot ingelogde chauffeurs met `pending` status; geen gebruiker mag zelf `approved` publiceren.
- De database bewaart een anonieme auteursaanduiding, die niet voor de publieke app uitleesbaar is; maximaal vijf correcties per account per 24 uur.
- Gebruik geen persoonsgegevens in de toelichting. Eerdere inzendingen kunnen niet worden ingetrokken door de lokale correctie te verwijderen.
- De status van nachtparkeren blijft afhankelijk van de lokale borden en de bevoegde beheerder. De app geeft geen juridische garantie en geen actuele bezetting.

## Moderatie
Nieuwe meldingen kunnen met beheerderstoegang worden bekeken via:
`select id, source_spot_id, spot_name, overnight, evidence, status, created_at from public.truckspot_parking_corrections where status='pending' order by created_at;`

Na controle van de bron:
`update public.truckspot_parking_corrections set status='approved',reviewed_at=now() where id='<gecontroleerd-id>';`

Bij twijfel: `status='rejected'`, of laat `pending` staan. Een goedgekeurde chauffeurmelding is nog steeds geen operatorbevestiging.

Bijbehorende SQL: `supabase/migrations/20261103_driver_overnight_corrections.sql`. De migratie is op het project toegepast voordat deze stabiele build gepubliceerd wordt.

Versie: **1.0.4**, versionCode **104**, Android-pakket **eu.truckspot.europe.stable**.
