import { Router } from "@keplr-wallet/router";
import { KeyStoreChangedEventMsg } from "./messages";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import { KeyStoreEventService } from "./service";

export function keyStoreEventInit(
  router: Router,
  service: KeyStoreEventService
): void {
  router.registerMessage(KeyStoreChangedEventMsg);

  router.addHandler(ROUTE, getHandler(service));
}
