import { init } from "@keplr-wallet/background";
import { RNRouter } from "./src/router";
import { MemoryKVStore } from "@keplr-wallet/common";

// TODO: Implement the env producer for the react native
const router = new RNRouter(undefined as any);

// TODO: Implement the KVStore for the react-native async storage.
init(
  router,
  (key: string) => new MemoryKVStore(key),
  {
    sendMessage: () => {
      throw new Error("TODO: Implement me");
    },
  },
  [],
  [],
  (array) => {
    return Promise.resolve(crypto.getRandomValues(array));
  }
);
