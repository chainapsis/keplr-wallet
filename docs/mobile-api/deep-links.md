---
title: Use Deep Links
order: 1
---

# How to use Deep Link

::: danger
:point_up_2: This feature is available in **Keplr Mobile v2.0.47 or later**. 
Please update to the latest version to use this feature.
:::

This page outlines how to use deep links, which are requests from external sources, to navigate to a specific page in Keplr Mobile and execute particular actions.

### DeepLink Scheme

 - Android
```
intent://{Deep Link Path}?{Deep Link Parameter}#Intent;package=com.chainapsis.keplr;scheme=keplrwallet;end;
```

 - iOS
```
keplrwallet://{Deep Link Path}?{Deep Link Parameter}
```

### Path of Deep Links supported(more coming)

 - `web-browser`

Go to the Browser tab at the bottom of Keplr Mobile app and navigate to the URL you received from the external source.

| Parameter | Type | Description |
| --- | --- | --- |
| url | string | The URL you need to navigate to in the Keplr Mobile internal browser |

### Using Examples

Create a deep link by combining the Scheme and Path mentioned above.

 - web page

```html
<html>
	<body>
		<!-- iOS should be "keplrwallet://web-browser?url=app.osmosis.zone" -->
		<!-- Below is an example for Android. -->
		<a href="intent://web-browser?url=app.osmosis.zone#Intent;package=com.chainapsis.keplr;scheme=keplrwallet;end;">
			<h1>Go to Swap</h1>
		</a>
	
	</body>

</html>
```

 - react native

```javascript
<Button
  title={'Linking'}
  onPress={() => {
    // iOS should be "keplrwallet://web-browser?url=app.osmosis.zone"
    // Below is an example for Android.
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
