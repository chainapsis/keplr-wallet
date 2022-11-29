/**
 * getKeplrExtensionRouterId returns the `window.keplrExtensionRouterId`.
 * If the `window.keplrExtensionRouterId` is not initialized, it will be initialized and returned.
 */
export function getKeplrExtensionRouterId(): number {
  if (window.keplrExtensionRouterId == null) {
    window.keplrExtensionRouterId = Math.floor(
      Math.random() * Number.MAX_SAFE_INTEGER
    );
  }
  return window.keplrExtensionRouterId;
}
