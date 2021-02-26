import {
  Router,
  ExtensionGuards,
  ExtensionEnv,
  BACKGROUND_PORT,
  ContentScriptMessageRequester,
} from "@keplr-wallet/router";
import { ExtensionKVStore } from "@keplr-wallet/common";
import { init } from "@keplr-wallet/background";

import { EmbedChainInfos, PrivilegedOrigins } from "../config";

const router = new Router(ExtensionEnv.produceEnv);
router.addGuard(ExtensionGuards.checkOriginIsValid);
router.addGuard(ExtensionGuards.checkMessageIsInternal);

init(
  router,
  (prefix: string) => new ExtensionKVStore(prefix),
  new ContentScriptMessageRequester(),
  EmbedChainInfos,
  PrivilegedOrigins,
  (array) => {
    return Promise.resolve(crypto.getRandomValues(array));
  }
);

router.listen(BACKGROUND_PORT);
