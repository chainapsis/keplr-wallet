import {
  interactionForegroundInit,
  InteractionForegroundService,
} from "@keplr-wallet/background";
import { Router } from "@keplr-wallet/router";

export function initEvents(router: Router) {
  interactionForegroundInit(
    router,
    new InteractionForegroundService({
      onInteractionDataReceived: (): void => {
        // noop
      },
      onEventDataReceived: (data): void => {
        if (data.type === "keystore-changed") {
          window.dispatchEvent(new Event("keplr_keystorechange"));
        }
      },
    })
  );
}
