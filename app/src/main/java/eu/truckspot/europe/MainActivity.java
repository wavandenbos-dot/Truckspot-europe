package eu.truckspot.europe;

import android.Manifest;
import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.webkit.GeolocationPermissions;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Locale;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

/** Standalone TruckSpot UI, served from APK using a local HTTPS origin. */
public final class MainActivity extends Activity {
    private static final String APP_HOST = "appassets.androidplatform.net";
    private static final String APP_URL = "https://" + APP_HOST + "/assets/index.html";
    private static final int LOCATION_REQUEST = 301;
    private WebView webView;
    private GeolocationPermissions.Callback pendingCallback;
    private String pendingOrigin;

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().setStatusBarColor(Color.rgb(8, 13, 11));
        getWindow().setNavigationBarColor(Color.rgb(8, 13, 11));
        webView = new WebView(this);
        webView.setBackgroundColor(Color.rgb(8, 13, 11));
        setContentView(webView);
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setGeolocationEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setAllowFileAccessFromFileURLs(false);
        settings.setAllowUniversalAccessFromFileURLs(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setJavaScriptCanOpenWindowsAutomatically(false);
        settings.setSupportMultipleWindows(false);
        settings.setBuiltInZoomControls(false);

        webView.setWebViewClient(new WebViewClient() {
            @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest req) {
                Uri uri = req.getUrl();
                if (isInternal(uri) && "/api/parking".equals(uri.getPath()))
                    return searchParking(uri);
                return embeddedAsset(uri);
            }
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                if (!request.isForMainFrame()) return false;
                Uri url = request.getUrl();
                if (isInternal(url)) return false;
                openOutside(url);
                return true;
            }
        });
        webView.setWebChromeClient(new WebChromeClient() {
            @Override public void onGeolocationPermissionsShowPrompt(String origin, GeolocationPermissions.Callback cb) {
                if (!isInternal(Uri.parse(origin))) {
                    cb.invoke(origin, false, false);
                    return;
                }
                if (locationAllowed()) {
                    cb.invoke(origin, true, false);
                } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    if (pendingCallback != null) pendingCallback.invoke(pendingOrigin, false, false);
                    pendingCallback = cb;
                    pendingOrigin = origin;
                    requestPermissions(new String[]{Manifest.permission.ACCESS_FINE_LOCATION,
                            Manifest.permission.ACCESS_COARSE_LOCATION}, LOCATION_REQUEST);
                } else {
                    cb.invoke(origin, false, false);
                }
            }
        });
        if (state != null) webView.restoreState(state);
        else webView.loadUrl(APP_URL);
    }

    private boolean isInternal(Uri uri) {
        return "https".equalsIgnoreCase(uri.getScheme())
                && APP_HOST.equalsIgnoreCase(uri.getHost());
    }
    private boolean locationAllowed() {
        return Build.VERSION.SDK_INT < 23
                || checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED
                || checkSelfPermission(Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED;
    }
    @Override public void onRequestPermissionsResult(int code, String[] permissions, int[] grants) {
        super.onRequestPermissionsResult(code, permissions, grants);
        if (code != LOCATION_REQUEST || pendingCallback == null) return;
        boolean allowed = locationAllowed();
        pendingCallback.invoke(pendingOrigin, allowed, false);
        pendingCallback = null;
        pendingOrigin = null;
        if (!allowed) Toast.makeText(this, "GPS niet toegestaan. Je kunt handmatig zoeken.", Toast.LENGTH_LONG).show();
    }

    /**
     * Small, same-origin bridge from the APK's trusted UI to public Overpass services.
     * It avoids Chrome CORS problems. Coordinates are sent only after the driver
     * explicitly presses Search/GPS. No personal position is saved here.
     */
    private WebResourceResponse searchParking(Uri request) {
        String area;
        try {
            String bbox = request.getQueryParameter("bbox");
            if (bbox != null) {
                String[] parts = bbox.split(",");
                if (parts.length != 4) return errorJson(400, "Ongeldig kaartgebied");
                double[] b = new double[4];
                for (int i=0; i<4; i++) b[i] = Double.parseDouble(parts[i]);
                if (!validLat(b[0]) || !validLat(b[2]) ||
                    !validLon(b[1]) || !validLon(b[3]) ||
                    b[0] >= b[2] || b[1] >= b[3] ||
                    b[2]-b[0] > 2 || b[3]-b[1] > 3)
                    return errorJson(400, "Zoom verder in op de kaart");
                area = "(" + fmt(b[0]) + "," + fmt(b[1]) + ","
                        + fmt(b[2]) + "," + fmt(b[3]) + ")";
            } else {
                double lat = Double.parseDouble(request.getQueryParameter("lat"));
                double lon = Double.parseDouble(request.getQueryParameter("lon"));
                double radius = Double.parseDouble(request.getQueryParameter("radius"));
                if (!validLat(lat) || !validLon(lon) || !Double.isFinite(radius) ||
                    radius < 1 || radius > 100)
                    return errorJson(400, "Ongeldige GPS-zoekopdracht");
                area = "(around:" + Math.round(radius*1000) + ","
                        + fmt(lat) + "," + fmt(lon) + ")";
            }
        } catch (Exception e) {
            return errorJson(400, "GPS of kaartgegevens ontbreken");
        }

        String query = "[out:json][timeout:25];("
                + "nwr[\"amenity\"=\"parking\"][\"hgv\"~\"^(yes|designated|official)$\"]" + area + ";"
                + "nwr[\"amenity\"=\"parking\"][\"capacity:hgv\"]" + area + ";"
                + "nwr[\"amenity\"=\"parking\"][\"name\"~\"(truck|lkw|autohof|camion|vrachtwagen|camiones|tir|rast|poids.lourds)\",i]" + area + ";"
                + "nwr[\"highway\"~\"^(rest_area|services)$\"]" + area + ";"
                + "nwr[\"amenity\"=\"truck_stop\"]" + area + ";"
                + "nwr[\"parking\"=\"layby\"][\"hgv\"~\"^(yes|designated)$\"]" + area + ";"
                + ");out center tags 350;";
        String[] servers = {
            "https://overpass.private.coffee/api/interpreter",
            "https://overpass-api.de/api/interpreter"
        };
        for (String endpoint:servers) {
            HttpURLConnection connection = null;
            try {
                connection = (HttpURLConnection)new URL(endpoint).openConnection();
                connection.setRequestMethod("POST");
                connection.setConnectTimeout(9000);
                connection.setReadTimeout(26000);
                connection.setRequestProperty("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
                connection.setRequestProperty("Accept", "application/json");
                connection.setRequestProperty("User-Agent", "TruckSpot-Europe-Android-Test/0.10");
                connection.setDoOutput(true);
                byte[] payload = ("data=" + URLEncoder.encode(query, "UTF-8"))
                        .getBytes(StandardCharsets.UTF_8);
                try (OutputStream out = connection.getOutputStream()) {
                    out.write(payload);
                }
                if (connection.getResponseCode() != 200) continue;
                byte[] body;
                try (InputStream in = connection.getInputStream()) {
                    ByteArrayOutputStream bytes = new ByteArrayOutputStream();
                    byte[] chunk = new byte[8192];
                    int n;
                    while ((n = in.read(chunk)) != -1) {
                        bytes.write(chunk, 0, n);
                        if (bytes.size() > 3000000) throw new IOException("Too much data");
                    }
                    body = bytes.toByteArray();
                }
                String result = new String(body, StandardCharsets.UTF_8);
                if (!result.trim().startsWith("{") || !result.contains("\"elements\"")) continue;
                Map<String,String> headers = new HashMap<>();
                headers.put("Cache-Control", "no-store");
                headers.put("X-Content-Type-Options", "nosniff");
                return new WebResourceResponse("application/json", "UTF-8", 200, "OK",
                       headers, new ByteArrayInputStream(body));
            } catch (IOException ignored) {
                // Public servers may be busy. Try the next server once.
            } finally {
                if (connection != null) connection.disconnect();
            }
        }
        return errorJson(503, "Parkeerdata tijdelijk niet bereikbaar. Probeer later opnieuw.");
    }
    private String fmt(double value) {
        return String.format(Locale.US, "%.5f", value);
    }
    private boolean validLat(double v) { return Double.isFinite(v) && v >= -90 && v <= 90; }
    private boolean validLon(double v) { return Double.isFinite(v) && v >= -180 && v <= 180; }
    private WebResourceResponse errorJson(int status, String message) {
        byte[] body = ("{\"error\":\"" + message + "\"}").getBytes(StandardCharsets.UTF_8);
        return new WebResourceResponse("application/json", "UTF-8", status,
            status==400 ? "Bad Request" : "Service Unavailable",
            new HashMap<>(), new ByteArrayInputStream(body));
    }

    private WebResourceResponse embeddedAsset(Uri uri) {
        if (!isInternal(uri)) return null;
        String path = uri.getPath();
        if (path == null || !path.startsWith("/assets/")) return null;
        String file = path.substring("/assets/".length());
        if (file.isEmpty() || file.contains("..") || file.contains("\\"))
            return missing();
        String mime = "application/octet-stream";
        if (file.endsWith(".html")) mime = "text/html";
        else if (file.endsWith(".png")) mime = "image/png";
        else if (file.endsWith(".js")) mime = "application/javascript";
        else if (file.endsWith(".css")) mime = "text/css";
        else if (file.endsWith(".webmanifest")) mime = "application/manifest+json";
        else if (file.endsWith(".json")) mime = "application/json";
        try {
            InputStream stream = getAssets().open("web/" + file);
            Map<String, String> headers = new HashMap<>();
            headers.put("Cache-Control", "no-cache");
            headers.put("X-Content-Type-Options", "nosniff");
            return new WebResourceResponse(mime, "UTF-8", 200, "OK", headers, stream);
        } catch (IOException ignored) { return missing(); }
    }
    private WebResourceResponse missing() {
        return new WebResourceResponse("text/plain", "UTF-8", 404, "Not Found",
                new HashMap<>(), new ByteArrayInputStream(new byte[0]));
    }
    private void openOutside(Uri url) {
        String scheme = url.getScheme();
        if (!("https".equalsIgnoreCase(scheme) || "http".equalsIgnoreCase(scheme))) return;
        try {
            startActivity(new Intent(Intent.ACTION_VIEW, url));
        } catch (ActivityNotFoundException | SecurityException ignored) {
            Toast.makeText(this, "Kan deze link niet openen", Toast.LENGTH_SHORT).show();
        }
    }
    @Override protected void onSaveInstanceState(Bundle b) {
        if (webView != null) webView.saveState(b);
        super.onSaveInstanceState(b);
    }
    @Override public void onBackPressed() {
        if (webView != null && webView.canGoBack()) webView.goBack();
        else super.onBackPressed();
    }
    @Override protected void onDestroy() {
        if (pendingCallback != null) pendingCallback.invoke(pendingOrigin, false, false);
        if (webView != null) webView.destroy();
        super.onDestroy();
    }
}
