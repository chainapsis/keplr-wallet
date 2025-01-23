
# Custom Event

## Key Store Change

To ensure your application stays updated with the current key store or account, Keplr emits a `keplr_keystorechange` event whenever the user switches their account.

#### Event Name

```javascript
keplr_keystorechange
```

#### Example Usage

```javascript
window.addEventListener("keplr_keystorechange", () => {
  console.log("Keplr key store has changed. Refetching account info...");
  // Refetch account or key information here
});
```