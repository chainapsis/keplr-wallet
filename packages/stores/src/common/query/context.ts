import {
  DebounceActionTimer,
  KVStore,
  MultiGet,
  WrapMultiGetKVStore,
} from "@keplr-wallet/common";
import { SettledResponse } from "@keplr-wallet/types";

export class QuerySharedContext {
  protected multiGetStore: MultiGet;

  protected storeDebounceTimer: DebounceActionTimer<[key: string], any>;

  protected handleResponseDebounceTimer: DebounceActionTimer<[], void>;

  constructor(
    protected readonly kvStore: KVStore | (KVStore & MultiGet),
    protected readonly options: {
      responseDebounceMs: number;
    }
  ) {
    if ("multiGet" in kvStore) {
      this.multiGetStore = kvStore;
    } else {
      this.multiGetStore = new WrapMultiGetKVStore(kvStore);
    }

    this.storeDebounceTimer = new DebounceActionTimer<[key: string], any>(
      0,
      async (requests) => {
        // Remove duplicated keys
        const keys = Array.from(new Set(requests.map((req) => req.args[0])));
        const res = await this.multiGetStore.multiGet(keys);

        return requests.map((req) => {
          return {
            status: "fulfilled",
            value: res[req.args[0]],
          };
        });
      }
    );

    this.handleResponseDebounceTimer = new DebounceActionTimer<[], void>(
      this.options.responseDebounceMs,
      (requests) => {
        return requests.map(() => ({
          status: "fulfilled",
          value: undefined,
        }));
      }
    );
  }

  loadStore<T = unknown>(
    key: string,
    action: (value: SettledResponse<T | undefined>) => void
  ) {
    return this.storeDebounceTimer.call([key], action);
  }

  handleResponse(action: () => void) {
    return this.handleResponseDebounceTimer.call([], action);
  }

  async saveResponse(key: string, response: unknown): Promise<void> {
    await this.kvStore.set(key, response);
  }
}
