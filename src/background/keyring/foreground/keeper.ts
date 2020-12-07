export class KeyRingNotifyKeeper {
  onKeyStoreChanged(): void {
    window.dispatchEvent(new Event("keplr_keystorechange"));
  }
}
