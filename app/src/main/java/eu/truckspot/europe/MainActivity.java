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
import android.os.Message;
import android.view.View;
import android.webkit.GeolocationPermissions;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

public final class MainActivity extends Activity {
    private static final String START_URL = "https://inspiring-melba-a85bfd.netlify.app/";
    private static final String TRUSTED_HOST = "inspiring-melba-a85bfd.netlify.app";
    private static final int REQUEST_LOCATION = 301;

    private WebView webView;
    private GeolocationPermissions.Callback waitingCallback;
    private String waitingOrigin;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setStatusBarColor(Color.rgb(10, 17, 15));
        getWindow().setNavigationBarColor(Color.rgb(10, 17, 15));
        webView = new WebView(this);
        webView.setBackgroundColor(Color.rgb(10, 17, 15));
        webView.setOverScrollMode(View.OVER_SCROLL_NEVER);
        setContentView(webView);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setGeolocationEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setSupportMultipleWindows(true);
        settings.setJavaScriptCanOpenWindowsAutomatically(false);

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                if (!request.isForMainFrame()) return false;
                Uri url = request.getUrl();
                if (trusted(url)) return false;
                openOutside(url);
                return true;
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onGeolocationPermissionsShowPrompt(String origin, GeolocationPermissions.Callback callback) {
                Uri url = Uri.parse(origin);
                if (!trusted(url)) {
                    callback.invoke(origin, false, false);
                    return;
                }
                if (locationAllowed()) {
                    callback.invoke(origin, true, false);
                } else if (Build.VERSION.SDK_INT >= 23) {
                    if (waitingCallback != null) {
                        waitingCallback.invoke(waitingOrigin, false, false);
                    }
                    waitingCallback = callback;
                    waitingOrigin = origin;
                    requestPermissions(new String[]{
                        Manifest.permission.ACCESS_FINE_LOCATION,
                        Manifest.permission.ACCESS_COARSE_LOCATION
                    }, REQUEST_LOCATION);
                } else {
                    callback.invoke(origin, false, false);
                }
            }

            @Override
            public boolean onCreateWindow(WebView view, boolean isDialog, boolean isUserGesture, Message resultMsg) {
                if (!isUserGesture) return false;
                WebView popup = new WebView(MainActivity.this);
                popup.setWebViewClient(new WebViewClient() {
                    private boolean opened = false;
                    @Override
                    public void onPageStarted(WebView v, String url, android.graphics.Bitmap favicon) {
                        if (!opened && url != null && (url.startsWith("https://") || url.startsWith("http://"))) {
                            opened = true;
                            openOutside(Uri.parse(url));
                            v.stopLoading();
                            v.post(v::destroy);
                        }
                    }
                });
                WebView.WebViewTransport transport = (WebView.WebViewTransport) resultMsg.obj;
                transport.setWebView(popup);
                resultMsg.sendToTarget();
                return true;
            }
        });

        if (savedInstanceState == null) webView.loadUrl(START_URL);
        else webView.restoreState(savedInstanceState);
    }

    private boolean trusted(Uri uri) {
        return "https".equalsIgnoreCase(uri.getScheme())
            && TRUSTED_HOST.equalsIgnoreCase(uri.getHost());
    }

    private boolean locationAllowed() {
        return Build.VERSION.SDK_INT < 23
            || checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED
            || checkSelfPermission(Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED;
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode != REQUEST_LOCATION || waitingCallback == null) return;
        boolean allowed = locationAllowed();
        waitingCallback.invoke(waitingOrigin, allowed, false);
        waitingCallback = null;
        waitingOrigin = null;
        if (!allowed) Toast.makeText(this, "GPS is niet toegestaan. Je kunt de kaart handmatig gebruiken.", Toast.LENGTH_LONG).show();
    }

    private void openOutside(Uri uri) {
        try {
            startActivity(new Intent(Intent.ACTION_VIEW, uri));
        } catch (ActivityNotFoundException | SecurityException exception) {
            Toast.makeText(this, "Kan deze link niet openen.", Toast.LENGTH_SHORT).show();
        }
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) webView.goBack();
        else super.onBackPressed();
    }

    @Override
    protected void onDestroy() {
        if (waitingCallback != null) {
            waitingCallback.invoke(waitingOrigin, false, false);
            waitingCallback = null;
        }
        if (webView != null) webView.destroy();
        super.onDestroy();
    }
}
