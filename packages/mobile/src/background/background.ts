import { init } from "@keplr-wallet/background";
import { RNEnv, RNRouter } from "../router";
import { AsyncKVStore } from "../common";

import { getRandomBytesAsync } from "../common";
import { BACKGROUND_PORT } from "@keplr-wallet/router";

import { EmbedChainInfos } from "../config";

const router = new RNRouter(RNEnv.produceEnv);

// TODO: Implement the KVStore for the react-native async storage.
init(
  router,
  (prefix: string) => new AsyncKVStore(prefix),
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
