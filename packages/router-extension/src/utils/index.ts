/**
 * getKeplrExtensionRouterId returns the `globalThis.keplrExtensionRouterId`.
 * If the `globalThis.keplrExtensionRouterId` is not initialized, it will be initialized and returned.
 */
export function getKeplrExtensionRouterId(): number {
  if (globalThis.keplrExtensionRouterId == null) {
    globalThis.keplrExtensionRouterId = Math.floor(
      Math.random() * Number.MAX_SAFE_INTEGER
    );
  }
  return globalThis.keplrExtensionRouterId;
}
