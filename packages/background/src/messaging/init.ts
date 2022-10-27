import { Router } from "@keplr-wallet/router";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import { MessagingService } from "./service";
import {
  DecryptMessagingMessage,
  EncryptMessagingMessage,
  GetMessagingPublicKey,
  RegisterPublicKey,
  SignMessagingPayload,
} from "./messages";

export function init(router: Router, service: MessagingService): void {
  router.registerMessage(GetMessagingPublicKey);
  router.registerMessage(RegisterPublicKey);
  router.registerMessage(EncryptMessagingMessage);
  router.registerMessage(DecryptMessagingMessage);
  router.registerMessage(SignMessagingPayload);

  router.addHandler(ROUTE, getHandler(service));
}
