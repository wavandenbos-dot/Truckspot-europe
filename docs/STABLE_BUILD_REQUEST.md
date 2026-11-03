# TruckSpot Europe 1.0.5 — zelf chauffeurmeldingen beoordelen

Blijft dezelfde gesigneerde app-ID gebruiken (`eu.truckspot.europe.stable`) als 1.0.4. Bijwerken over de bestaande installatie, nooit verwijderen: lokale eigen parkeerplaatsen, favorieten en nachtparkeercorrecties blijven behouden.

## Beheerdersscherm (HANDMATIG, geen automatische goedkeuring)
- Nieuwe knop **🔒 Beheer** bij de gedeelde parkings.
- Apart Supabase Auth e-mail/wachtwoord voor de beheerder. Inlogtoken alleen tijdens de lopende app-sessie in geheugen, geen wachtwoorden of beheerder-API-sleutels in de APK.
- Geeft alleen toegang met een **door de beheerder in de Supabase database ingestelde** `auth.users.raw_app_meta_data.truckspot_moderator = true`, en een **niet-anoniem** Auth-account. Anonieme chauffeuraccounts kunnen zichzelf deze rol niet geven.
- Geeft een lijst van alle wachtende nieuwe parkeerplaatsen en chauffeurscorrecties, met bronnotitie en kaartlink.
- Beheerder kan handmatig **goedkeuren / afwijzen**. Voor nieuwe truckparkings vraagt goedkeuring bovendien om een onafhankelijk gecontroleerde bron van minimaal twaalf tekens, die op de server wordt opgeslagen en afgedwongen.
- Aangepaste nachtparkeercorrecties blijven ook na goedkeuring **chauffeursmeldingen**, niet officiële operatorbevestigingen.
- Supabase RLS laat andere chauffeurs nooit pending meldingen lezen of goedkeuren; review is een afgebakende statusovergang van `pending` naar `approved` of `rejected`, met serverdatum.
- Inloggen is pas mogelijk wanneer de eigenaar **zelf een apart, echt e-mail/wachtwoord-account** in Supabase Auth laat aanmaken en dit vervolgens veilig markeert als moderator. Bestaande twee anonieme chauffeursaccounts zijn uitdrukkelijk NIET gemachtigd. Geen vooraf ingestelde wachtwoorden.
- Geen automatische moderatie, ook geen automatisch goedkeuren bij het insturen.

## Nederlandse snelwegverzorgingsplaatsen
De tekst in de app is nauwkeuriger gemaakt: RWS richt verzorgingsplaatsen in voor korte rust, maar er bestaan per locatie parkeerborden met een eigen maximale parkeerduur, bijvoorbeeld **24 uur**. Dat is geen algemene Nederlandse 24-uursregel en bewijst op zichzelf niet dat overnachten officieel mag. De app adviseert per locatie borden, toestemming en eventuele parkeerduurbeperking te controleren. NL-verzorgingsplaatsen worden niet generiek als **verboden voor overnachten** aangeduid.

## Database
Beveiligde migratie `supabase/migrations/20261103_truckspot_manual_moderation.sql` is al toegepast op het werkende Supabase-project vóór de release. In de Auth-database stond op testdatum nog geen e-mail/wachtwoord-moderator; het account moet afzonderlijk worden geactiveerd.

## Test
Na installatie: open **🔒 Beheer**. Zonder apart gemachtigde moderator wordt toegang geweigerd (bedoeld). Met moderatorlogin: pending meldingen controleren, goedkeuren of afwijzen. Controleer de originele borden, de beheerder of een betrouwbare bron vóór goedkeuring.

Versie: **1.0.5**, versionCode **105**, Android package **eu.truckspot.europe.stable**.
