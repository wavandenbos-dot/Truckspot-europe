# TruckSpot Europe — gedeelde parkeerplaatsen (voorbereiding)

## Wat staat er klaar?
- Alle bestaande onderzoeksparkeerplaatsen (Fraunhofer 2025) blijven in de app.
- Nieuwe chauffeursmeldingen worden eerst lokaal bewaard en kunnen met één knop ter controle worden ingestuurd.
- Alleen een beheerder kan een inzending goedkeuren, waarna andere chauffeurs deze via de Supabase REST API kunnen zien.
- Geen inlog met e-mailadres nodig als **Anonymous Sign-Ins** in Supabase aanstaat.
- Data en app blijven gescheiden van het project **transport-uren-android**.

## Eénmalige Supabase-configuratie
1. Maak of verbind een Supabase-project voor TruckSpot Europe.
2. Voer de SQL uit `supabase/migrations/20261101_truckspot_shared_parking.sql` via de SQL Editor.
3. Zet **Authentication → Anonymous Sign-Ins** aan. Zet anti-spam beveiliging aan (CAPTCHA/Turnstile en limieten) voordat je publiek opschaalt.
4. In Supabase → Project Settings / Connect vind je de **Project URL** en een **publishable key**.
5. Vul uitsluitend deze twee niet-geheime waarden in `app/src/main/assets/web/shared-config.json`, en bouw opnieuw via GitHub Actions. **Gebruik nooit een secret key of service_role key.**
6. Controleer eerst met een testinzending die status `pending` heeft en niet zichtbaar is op andere toestellen. Keur die als beheerder handmatig goed in de SQL Editor en controleer daarna de kaart op een ander toestel.

## Databasebeheer
Nieuwe inzendingen:
```sql
select id, name, lat, lng, status, created_at
from public.truckspot_parking_submissions
where status = 'pending'
order by created_at desc;
```
Na controle van het terrein en trucktoegang:
```sql
update public.truckspot_parking_submissions
set status='approved', reviewed_at=now()
where id='HIER-REVIEWED-UUID';
```
Onjuist gemeld terrein:
```sql
update public.truckspot_parking_submissions
set status='rejected', reviewed_at=now()
where id='HIER-REVIEWED-UUID';
```
RLS verleent chauffeurs geen update-rechten; ze kunnen hun eigen inzending dus niet stilzwijgend goedkeuren.

## Veiligheid en grenzen
- De database is **niet actief** totdat de Supabase-configuratie en SQL werkelijk zijn toegepast.
- Anonieme gebruikers kunnen bij het verwijderen van de app hun account kwijtraken; er is een server-side maximum van 5 inzendingen per gebruikersaccount per 24 uur, maar nieuwe accounts kunnen die limiet omzeilen. Schakel CAPTCHA en IP-limieten in.
- De locatie van ingediende parkings wordt gedeeld **na goedkeuring**. De actuele GPS-positie wordt niet automatisch verzonden.
- Geen live bezetting of gecertificeerde trucknavigatie.
- V14 lokaal toegevoegde plekken komen niet vanzelf naar een nieuwe test-app (ander app-ID). Bewaar V14 voorlopig.
- Publicatie voor veel gebruikers vereist extra privacy-, moderatie-, data-licentie- en beveiligingstests.
