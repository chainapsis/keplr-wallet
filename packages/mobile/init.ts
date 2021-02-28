import { init } from "@keplr-wallet/background";
import { RNEnv, RNRouter } from "./src/router";
import { MemoryKVStore } from "@keplr-wallet/common";

import { getRandomBytesAsync } from "./src/common";
import { BACKGROUND_PORT } from "@keplr-wallet/router";

import { Keplr } from "@keplr-wallet/provider";
import { RNMessageRequester } from "./src/router/requester";
import { EmbedChainInfos } from "./src/config";

const router = new RNRouter(RNEnv.produceEnv);

// TODO: Implement the KVStore for the react-native async storage.
init(
  router,
  (key: string) => new MemoryKVStore(key),
  {
    sendMessage: () => {
      throw new Error("TODO: Implement me");
    },
  },
  EmbedChainInfos,
  [],
  getRandomBytesAsync
);

router.listen(BACKGROUND_PORT);

// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
window.keplr = new Keplr(new RNMessageRequester());
