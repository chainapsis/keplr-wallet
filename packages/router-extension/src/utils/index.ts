/**
 * getKeplrExtensionRouterId returns the `window.keplrExtensionRouterId`.
 * If the `window.keplrExtensionRouterId` is not initialized, it will be initialized and returned.
 */
export function getKeplrExtensionRouterId(): number {
  if (window.keplrExtensionRouterId == null) {
    window.keplrExtensionRouterId = Math.floor(Math.random() * 1000000);
  }
  return window.keplrExtensionRouterId;
}
