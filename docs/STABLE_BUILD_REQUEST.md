# TruckSpot Europe 1.0.7 — beveiligde registratie voor het beheerdersaccount

Dit is de opvolger van de stabiele versie 1.0.6. App-ID blijft `eu.truckspot.europe.stable` en APK wordt met dezelfde beveiligde Android-keystore ondertekend. Update over 1.0.5 of 1.0.6, verwijder de app niet.

## Nieuwe functie
- Bij **🔒 Beheer** (bovenaan, direct onder het logo) kun je je aanmelden met e-mail/wachtwoord of kiezen voor **📧 Beheeraccount aanmaken**.
- Het registratiescherm controleert e-mailadres, bevestigt het nieuwe wachtwoord (minimaal twaalf tekens), vraagt de gebruiker te bevestigen dat hij/zij veilig stilstaat, en stuurt registratie rechtstreeks via HTTPS naar Supabase Auth.
- Wachtwoorden worden niet opgeslagen in app-instellingen, lokale opslag, logs of broncode. Het beheerders-inlogtoken zit alleen tijdelijk in het appgeheugen.
- Registratie alleen verleent **NOOIT beheerdersrechten**. Nadat de gebruiker zijn e-mailadres via de Supabase-bevestigingsmail heeft bevestigd, moet de projectbeheerder het bestaande **niet-anonieme** account expliciet autoriseren door `auth.users.raw_app_meta_data.truckspot_moderator = true` te zetten met vertrouwde beheertoegang. De RLS-beveiliging van 1.0.5 vereist deze server-side vlag én een niet-anoniem account.
- Zonder deze handmatige autorisatie kan de gebruiker wel registreren, maar *niet* parkeerplaatsen goedkeuren; de app meldt dat duidelijk.
- Geen automatische goedkeuring van chauffeursmeldingen.

## Bewaarde verbeteringen uit 1.0.6
- **🔒 Beheer** staat bovenaan.
- De oude tekst **V5 • GPS TEST** is volledig verwijderd, zonder nieuwe versiebadge.
- De kaartstatus/telling staat niet langer zichtbaar over de +/−-zoomknoppen en blijft toegankelijk als schermlezerstatus.

## Testplan
1. Installeer 1.0.7 over de bestaande app en controleer dat favorieten en zelftoegevoegde plekken er nog zijn.
2. Open Beheer → Beheeraccount aanmaken; controleer de invoervalidatie en dat de app na registratie om e-mailbevestiging en aparte activatie vraagt.
3. Verifieer dat onbevoegde of anonieme chauffeurs het beheerdersscherm niet kunnen openen of pending inzendingen kunnen goedkeuren.
4. Activeer afzonderlijk een bevestigd, niet-anoniem Auth-account voor beheer en controleer dan de reviewfunctie met een echte beheerlogin.
5. Test de kaartzoomknoppen zonder de oude, grote status-overlay.

Versie: **1.0.7**, versionCode **107**, Android package **eu.truckspot.europe.stable**.
