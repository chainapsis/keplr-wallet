# Deeplinking

This guide explains how to use deeplinks in Keplr Mobile, allowing external sources to navigate to specific pages and execute predefined actions.

:::info
This feature is available in **Keplr v2.0.63 or later**.
Please update to the latest version to use this feature.
:::

## Download Keplr Mobile

| Platform | Download Link |
|----------|----------------|
| iOS      | [App Store](https://apps.apple.com/us/app/keplr-wallet/id1567851089) |
| Android  | [Play Store](https://play.google.com/store/apps/details?id=com.chainapsis.keplr&hl=en) |

---

## Deeplink Schemes

Keplr Mobile supports different deeplink schemes for Android and iOS, each with its specific use case.

### Universal/App Links (iOS & Android)

**Format:**
```
https://deeplink.keplr.app/{deeplink-path}?{deeplink-parameter}
```

**Notes:**
- Works on both iOS and Android.
- Ideal for external web links and browser-based navigation.
- Fallback available (redirects to a website if the app is not installed).

### Intent-based Deeplink (Android Only)

**Format:**
```
intent://{deeplink-path}?{deeplink-parameter}#Intent;package=com.chainapsis.keplr;scheme=keplrwallet;end;
```

**Notes:**
- Ideal for in-app linking from another Android app.
- Does not work if the app is not installed (unless handled manually).

### Custom URL Scheme (iOS Only)

**Format:**
```
keplrwallet://{deeplink-path}?{deeplink-parameter}
```

**Notes:**
- Ideal for in-app linking from another iOS app.
- Does not work if the app is not installed (unless handled manually).

---

## Supported Deeplink Paths

Keplr Mobile currently supports the following deeplink path:

### `web-browser`
Navigates to the Browser tab within Keplr Mobile and loads a specified URL.

| Parameter | Type | Description |
|-----------|------|-------------|
| url       | string | The URL to be opened in the Keplr Mobile internal browser |

### `show-address`
Displays the user's address for a specified blockchain network.

| Parameter | Type | Description |
|-----------|------|-------------|
| chainId   | string | The chain ID whose address you want to view |

---

## Examples

Create a deeplink by combining the Scheme and Path.

### Web Page Example

```html
<html>
  <body>
    <!-- Example for Universal Links -->
    <a href="https://deeplink.keplr.app/show-address?chainId=osmosis-1">
      <h1>Show Address</h1>
    </a>
  </body>
</html>
```

### React Native Example

```tsx
<Button
  title="Linking"
  onPress={() => {
    // iOS should use "keplrwallet://web-browser?url=app.osmosis.zone"
    // Example for Android
    const url =
      'intent://web-browser?url=app.osmosis.zone#Intent;package=com.chainapsis.keplr;scheme=keplrwallet;end;';
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        console.log("Don't know how to open URI: " + url);
      }
    });
  }}
/>
```




