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
    // TODO: The message requester in the background services is used to emit the event like "keystore_changed" to the webpage.
    // But, it is not needed yet in the mobile environment.
    // So, just let it return undefined always and do nothing.
    // The message requester to the webpage should be implemented in future.
    sendMessage: async (_port: string, _msg: any): Promise<any> => {
      return undefined;
    },
  },
  EmbedChainInfos,
  [],
  getRandomBytesAsync
);

router.listen(BACKGROUND_PORT);
