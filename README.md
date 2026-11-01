# 🚛 TruckSpot Europe — Android test-app

Android-project voor de gratis TruckSpot Europe-parkeerapp.

**Wat is dit?** Een Android WebView-app die de bestaande TruckSpot-website veilig via HTTPS opent:
https://inspiring-melba-a85bfd.netlify.app/

De app vraagt locatie-toestemming wanneer je GPS gebruikt en opent navigatie en Street View in een externe app. Je kunt de APK op je eigen Android installeren zonder via Chrome te openen.

## APK automatisch bouwen

1. Open **Actions** in deze GitHub-repository.
2. Open **Build TruckSpot Android APK**.
3. Kies **Run workflow**. Ook elke push naar main start automatisch een build.
4. Open na een groene build de workflow-run en download onder **Artifacts** het bestand `TruckSpot-Europe-Android-APK`.
5. Pak de ZIP uit: daarin zit `app-debug.apk`. Open het bestand op Android en bevestig de installatie (alleen als je het bestand vertrouwt).

Dit is een *test-APK* met een debug-handtekening, **geen** Play Store-release. Op een ander apparaat of na een wijziging van de ondertekeningssleutel kan opnieuw installeren nodig zijn.

## Belangrijk

- De inhoud wordt opgehaald vanaf de bestaande Netlify-website. De app heeft internet nodig. Werk de website via Netlify bij; de app toont daarna die bijgewerkte website.
- GPS gebruikt de Android-toestemming **alleen tijdens gebruik**; geen achtergrondlocatie.
- Beschikbaarheid van parkeerplaatsen is niet live bevestigd; meldingen blijven voorlopig lokale tests.
- Niet gebruiken als officieel tachograaf-/rij- en rusttijdensysteem of gecertificeerde trucknavigatie.
- Dit project bevat geen geheime sleutels, wachtwoorden of betaalgegevens.
- Voor een Play Store-publicatie zijn extra tests, beleid, privacyverklaring en release-ondertekening nodig.

Techniek: Android Gradle Plugin 8.7.3, Gradle 8.9, Java 17, Android SDK 35, minSdk 26.
