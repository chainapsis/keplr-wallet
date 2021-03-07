import { init } from "@keplr-wallet/background";
import { RNEnv, RNRouter } from "../router";
import { MemoryKVStore } from "@keplr-wallet/common";

import { getRandomBytesAsync } from "../common";
import { BACKGROUND_PORT } from "@keplr-wallet/router";

import { EmbedChainInfos } from "../config";

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
