# TruckSpot — updates met maar één icoontje

## Waarom V8–V17 steeds een nieuw icoon kregen
Elke Android-testbuild gebruikt een andere `applicationId` en een niet-persistente debug-ondertekening. Daarom zijn Android-updates tussen die builds niet mogelijk.

## Permanente aanpak
Er is een tweede GitHub Actions-workflow: **Stable signed TruckSpot APK — one app icon**. Deze gebruikt altijd dezelfde app-ID `eu.truckspot.europe.stable` én dezelfde privé-ondertekeningssleutel. De eerste ondertekende stabiele APK wordt één keer als nieuwe app geïnstalleerd. Daarna kun je toekomstige versies over deze app heen installeren **mits**:
1. de signingsleutel identiek blijft;
2. de `version_code` iedere update omhooggaat;
3. de app-ID hetzelfde blijft.

**De ondertekeningssleutel staat NIET in de openbare broncode.** Zonder geconfigureerde secrets bouwt de stabiele workflow bewust geen APK. De gewone debug-testworkflow blijft los daarvan bestaan.

## Vereist: éénmalig vier GitHub repository secrets toevoegen
Ga naar https://github.com/wavandenbos-dot/Truckspot-europe/settings/secrets/actions

- `TRUCKSPOT_KEYSTORE_B64`: base64 van je eigen JKS-keystorebestand (behandel dit als een wachtwoord).
- `TRUCKSPOT_KEYSTORE_PASSWORD`: wachtwoord op keystorebestand.
- `TRUCKSPOT_KEY_ALIAS`: alias van je eigen signing key.
- `TRUCKSPOT_KEY_PASSWORD`: wachtwoord van die private key.

Een nieuwe keystore genereer je lokaal met een vertrouwde Android Studio/JDK `keytool`, of via een vertrouwde offline keygenerator. Bewaar het JKS-bestand én wachtwoorden veilig **buiten GitHub en buiten chats**, liefst in een wachtwoordkluis plus offline backup. Verlies betekent dat je voor deze losse APK niet meer kunt updaten met dezelfde handtekening.

Voorbeeld met een lokaal geïnstalleerde JDK (nooit in publieke GitHub Actions logs):
```sh
keytool -genkeypair -v -keystore truckspot-stable.jks -alias truckspot-stable -keyalg RSA -keysize 3072 -validity 36500
base64 -w0 truckspot-stable.jks
```
Kopieer de base64-uitvoer in **New repository secret** `TRUCKSPOT_KEYSTORE_B64`. Plaats nooit je sleutel of wachtwoorden in een openbare git-commit.

Ga daarna naar GitHub → Actions → Stable signed TruckSpot APK — one app icon → Run workflow.
Versie 1.0.0 / versionCode 100 voor de eerste build; verhoog daarna bijvoorbeeld naar 1.0.1 / 101.

## Overstappen van de oude test-app
V16 en V17 kunnen niet *in-place* worden bijgewerkt naar de stable-app. Maak eerst eventueel een export of noteer lokaal toegevoegde parkeerplaatsen. Installeer de nieuwe stable-app één keer en controleer de parkeerplaatsen; pas daarna verwijder je de oude testversies, zodat er uiteindelijk maar één TruckSpot-icoon overblijft.

De bestaande gedeelde Supabase-database is onafhankelijk van de app-ID en blijft bestaan.
