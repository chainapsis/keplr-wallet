import {
  keyStoreEventInit,
  KeyStoreEventService,
} from "@keplr-wallet/background";
import { Router } from "@keplr-wallet/router";

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
