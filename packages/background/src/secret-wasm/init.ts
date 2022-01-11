import { Router } from "@keplr-wallet/router";
import {
  GetPubkeyMsg,
  GetTxEncryptionKeyMsg,
  ReqeustEncryptMsg,
  RequestDecryptMsg,
} from "./messages";
import { SecretWasmService } from "./service";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";

export function init(router: Router, service: SecretWasmService): void {
  router.registerMessage(GetPubkeyMsg);
  router.registerMessage(ReqeustEncryptMsg);
  router.registerMessage(RequestDecryptMsg);
  router.registerMessage(GetTxEncryptionKeyMsg);

  router.addHandler(ROUTE, getHandler(service));
}
