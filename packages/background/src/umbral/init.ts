import { getHandler } from "./handler";
import { Router } from "@keplr-wallet/router";
import { UmbralService } from "./service";
import {
  ROUTE,
  UmbralDecryptMsg,
  UmbralDecryptReEncryptedMsg,
  UmbralEncryptMsg,
  UmbralGenerateKeyFragsMsg,
  UmbralGetPublicKeyMsg,
  UmbralGetSigningPublicKeyMsg,
  UmbralVerifyCapsuleFragMsg,
} from "@fetchai/umbral-types";

export function init(router: Router, service: UmbralService): void {
  router.registerMessage(UmbralGetPublicKeyMsg);
  router.registerMessage(UmbralGetSigningPublicKeyMsg);
  router.registerMessage(UmbralEncryptMsg);
  router.registerMessage(UmbralGenerateKeyFragsMsg);
  router.registerMessage(UmbralDecryptMsg);
  router.registerMessage(UmbralDecryptReEncryptedMsg);
  router.registerMessage(UmbralVerifyCapsuleFragMsg);

  router.addHandler(ROUTE, getHandler(service));
}
