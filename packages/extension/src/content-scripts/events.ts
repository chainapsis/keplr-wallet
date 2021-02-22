import { keyStoreEventInit, KeyStoreEventService } from "@keplr/background";
import { Router } from "@keplr/router";

export function initEvents(router: Router) {
  keyStoreEventInit(
    router,
    new KeyStoreEventService({
      onKeyStoreChanged: () => {
        window.dispatchEvent(new Event("keplr_keystorechange"));
      },
    })
  );
}
