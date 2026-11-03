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


### TruckSpot V13 — betrouwbare Europese kaartlocaties (2025)
Bij de APK-build wordt een dataset met 13.323 potentiële vrachtwagenparkeerlocaties uit Europa (Fraunhofer ISI, 2025) opgenomen in de APK. De locaties zijn offline doorzoekbaar, zodat een trage Overpass-server het opzoeken van **potentiële** truckstops niet langer blokkeert. Niet alle genoemde locaties zijn legaal/toegankelijk, op de exacte kaartspeld kan afwijking zitten. Controleer borden en toegangsregels. **Geen live vrijmeldingen.** Kaarttegels en aanvullende data vereisen nog internet.

**Databron en auteursrecht:** Link, Steffen; Plötz, Patrick; Speth, Daniel; Gnann, Till (2025), *European Truck Parking Locations*, version v04, Fraunhofer ISI, doi:10.5281/zenodo.14643147, Creative Commons Attribution 4.0 (CC BY 4.0). We bewerken de CSV naar compact JSON. Bronbestand is 24 januari 2025. Bronlocaties zijn onderzoeksreferentiepunten, geen gecertificeerde vrachtwagenparkeergelegenheden.


### V14 — eigen parkeerplaatsen (lokale test)
Knop **➕ Parkeerplaats toevoegen** boven de lijst. Je kunt GPS of kaartmidden gebruiken en de naam, tarief, type, toilet/douche/eten/beveiliging en notities invullen. De nieuwe plek verschijnt op de kaart als ✚ en in de lijst. In Details kun je hem weer verwijderen. De gegevens worden alleen op jouw telefoon bewaard onder `ts14_own_spots` en zijn niet gedeeld met andere chauffeurs; door appverwijdering kunnen ze verloren gaan. Deze zelfstandige V14-test-app heeft een aparte pakketnaam en importeert geen eerdere testgegevens.


### V15 gedeelde parkeerplaatsen (voorbereid, alleen actief met Supabase)
V15 biedt een overzicht van goedgekeurde gedeelde plekken, een refreshknop en een verzendknop bij je eigen lokale parkeerplaatsen. De Supabase-projectconfiguratie is momenteel leeg. Zonder verbonden Supabase-project worden geen locaties verzonden en blijven bestaande functies lokaal werken. Lees `docs/GEDEELDE_PARKINGEN.md` en koppel Supabase voor echte synchronisatie. V15 is vanwege de test-APK-ondertekening een aparte app en kan V14-lokale gegevens niet automatisch overnemen.


### V16 — gedeelde Supabase-database verbonden
Supabase-project `TruckSpot Europe` is aangemaakt in de EU-regio `eu-central-1`. De tabel `public.truckspot_parking_submissions` is actief, beveiligd met RLS; uitsluitend goedgekeurde inzendingen zijn openbaar. Ingebouwde onderzoeksparkings blijven offline beschikbaar. Project URL en **publishable** API-sleutel zijn opgenomen in de app-config (dit zijn publieke clientgegevens, geen beheersleutel). Controleer in Supabase → Authentication → Providers of **Anonymous Sign-Ins** aanstaat voordat je chauffeursinzendingen test. Ongecontroleerde locaties zijn nooit publiek. V16 heeft opnieuw een eigen Android-app-id voor installatie naast oudere testversies.


## TruckSpot V17 — blauwe P en nachtrust
- Blauwe vierkante parkeericonen met witte P.
- Zoom wijzigt niet langer de aan/uitstand van live GPS volgen; tijdens het pinch-to-zoom gebaar wordt centrering even gepauzeerd.
- Alleen met expliciete bevestiging vrachtwagenparkeerplaats plus overnachten toegestaan. De 13.323 onderzoeksplekken zijn hiervoor niet geverifieerd, en blijven dus verborgen.
- Nieuwe eigen truckparkings vragen expliciete bevestiging van toegestaan overnachten.
- Gedeelde plekken worden pas openbaar wanneer beheerder ook het overnachten goedkeurt.
- V17 is nog een aparte test-APK: voor toekomstige updates zonder nieuw icoon moet er eerst een vaste Android-ondertekening komen.
