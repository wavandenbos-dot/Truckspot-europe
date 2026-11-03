# TruckSpot Europe 1.0.3 — automatisch laden en eigen correcties voor nachtparkeren

Deze update bouwt voort op versie 1.0.2 en gebruikt dezelfde Android-pakketnaam en beveiligde ondertekening, zodat een bestaande installatie over versie 1.0.2 kan worden bijgewerkt. Verwijder de app niet: favorieten en eigen locaties zijn uitsluitend lokaal opgeslagen.

## Verbeteringen
- De ingebouwde Europese lijst wordt automatisch bijgewerkt bij verplaatsen van de kaart. Bij uitzoomen worden alle gevonden vermeldingen in het kaartgebied bekeken, zonder de oude beperking tot de 350 dichtstbijzijnde locaties.
- Drukke gebieden worden met aantallen gegroepeerd; tik om in te zoomen, of kies afzonderlijke locaties bij maximale zoom.
- De lijst onder de kaart toont maximaal 160 resultaten voor betere prestaties op de telefoon; de kaart toont alle beschikbare groepen.
- Bij **Details → Nachtparkeren aanpassen** kan de chauffeur zelf aangeven of overnachten volgens eigen controle wel of niet mag en een bron of uitleg noteren. Het vereist bevestiging dat de chauffeur veilig stilstaat.
- De correctie wordt bewaard op de telefoon onder `ts103_parking_corrections` en is duidelijk herkenbaar als **eigen, niet onafhankelijk bevestigde informatie**. Er worden geen openbare wijzigingen aan de brondata of Supabase-database gedaan.

## Grenzen
De Europese bron omvat aangeduide truckparkings, niet alle vrachtwagenparkeerplekken. Onvolledige geografische dekking blijft mogelijk. Nachtparkeren is pas bronbevestigd waar de app die status onafhankelijk aangeeft; een chauffeurcorrectie vervangt dit niet. Nederlandse snelwegverzorgingsplaatsen mogen niet zonder meer als overnachtingsplek worden beschouwd.

Versie: **1.0.3**, versionCode **103**, Android-pakket **eu.truckspot.europe.stable**.
