import { DebounceActionTimer, KVStore } from "@keplr-wallet/common";
import { SettledResponse } from "@keplr-wallet/types";
import { WrapMultiGetKVStore } from "@keplr-wallet/common/build/kv-store/multi-get";

export class QuerySharedContext {
  protected storeDebounceTimer = new DebounceActionTimer<
    [kvStore: KVStore, key: string],
    any
  >(0, async (requests) => {
    const map = new Map<KVStore, Set<string>>();
    const resMap = new Map<KVStore, Map<string, any>>();

    for (const req of requests) {
      if (!map.has(req.args[0])) {
        map.set(req.args[0], new Set());
      }

      if (!resMap.has(req.args[0])) {
        resMap.set(req.args[0], new Map());
      }

      map.get(req.args[0])!.add(req.args[1]);
    }

    for (const [kvStore, keySet] of map) {
      const keys = Array.from(keySet);
      const res = await new WrapMultiGetKVStore(kvStore).multiGet(keys);

      const resMapPerKVStore = resMap.get(kvStore)!;
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        resMapPerKVStore.set(key, res[key]);
      }

      resMap.set(kvStore, resMapPerKVStore);
    }

    return requests.map((req) => {
      return {
        status: "fulfilled",
        value: resMap.get(req.args[0])!.get(req.args[1])!,
      };
    });
  });

  protected handleResponseDebounceTimer = new DebounceActionTimer<[], void>(
    50,
    (requests) => {
      return requests.map(() => ({
        status: "fulfilled",
        value: undefined,
      }));
    }
  );

  loadStore<T = unknown>(
    kvStore: KVStore,
    key: string,
    action: (value: SettledResponse<T | undefined>) => void
  ) {
    return this.storeDebounceTimer.call([kvStore, key], action);
  }

  handleResponse(action: () => void) {
    return this.handleResponseDebounceTimer.call([], action);
  }
}
