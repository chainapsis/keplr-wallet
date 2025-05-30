import {
  IFeeConfig,
  IGasConfig,
  IGasSimulator,
  UIProperties,
  GasEstimate,
} from "./types";
import {
  action,
  autorun,
  computed,
  IReactionDisposer,
  makeObservable,
  observable,
  runInAction,
} from "mobx";
import { useEffect, useState } from "react";
import { KVStore } from "@keplr-wallet/common";
import { ChainIdHelper } from "@keplr-wallet/cosmos";
import { TxChainSetter } from "./chain";
import { ChainGetter } from "@keplr-wallet/stores";
import { isSimpleFetchError } from "@keplr-wallet/simple-fetch";
import { Dec } from "@keplr-wallet/unit";

export type GasSimulate = () => Promise<GasEstimate>;
export type SimulateGasFn = () => GasSimulate;

class GasSimulatorState {
  @observable
  protected _isInitialized: boolean = false;

  // If the initialGasEstimate is null, it means that there is no value stored or being loaded.
  @observable.ref
  protected _initialGasEstimate: GasEstimate | null = null;

  @observable.ref
  protected _recentGasEstimate: GasEstimate | null = null;

  @observable.ref
  protected _gasSimulate: GasSimulate | undefined = undefined;
  @observable.ref
  protected _error: Error | undefined = undefined;

  constructor() {
    makeObservable(this);
  }

  @action
  setIsInitialized(value: boolean) {
    this._isInitialized = value;
  }

  get isInitialized(): boolean {
    return this._isInitialized;
  }

  @action
  setInitialGasEstimate(estimate: GasEstimate) {
    this._initialGasEstimate = estimate;
  }

  get initialGasEstimate(): GasEstimate | null {
    return this._initialGasEstimate;
  }

  @action
  setRecentGasEstimate(estimate: GasEstimate) {
    this._recentGasEstimate = estimate;
  }

  get recentGasEstimate(): GasEstimate | null {
    return this._recentGasEstimate;
  }

  @action
  refreshGasSimulate(value: GasSimulate) {
    this._gasSimulate = value;
  }

  get gasSimulate(): GasSimulate | undefined {
    return this._gasSimulate;
  }

  @action
  setError(error: Error | undefined) {
    this._error = error;
  }

  get error(): Error | undefined {
    return this._error;
  }
}

export class GasSimulator extends TxChainSetter implements IGasSimulator {
  @observable
  protected _key: string;

  @observable
  protected _enabled: boolean = false;

  @observable
  protected _forceDisabled: boolean = false;
  @observable
  protected _forceDisableReason: Error | undefined = undefined;

  @observable
  protected _isSimulating: boolean = false;

  // Key is the store key (probably, ${chainIdentifier}/${key})
  @observable.shallow
  protected _stateMap: Map<string, GasSimulatorState> = new Map();

  protected _debounceTimeoutId: NodeJS.Timeout | null = null;
  protected readonly _debounceMs: number = 300;

  protected _disposers: IReactionDisposer[] = [];

  constructor(
    // TODO: Add comment about the reason why kvStore field is not observable.
    protected kvStore: KVStore,
    chainGetter: ChainGetter,
    initialChainId: string,
    protected readonly gasConfig: IGasConfig,
    protected readonly feeConfig: IFeeConfig,
    protected readonly initialKey: string,
    protected simulateGasFn: SimulateGasFn
  ) {
    super(chainGetter, initialChainId);

    this._key = initialKey;

    makeObservable(this);

    this.init();
  }

  setKVStore(kvStore: KVStore) {
    this.kvStore = kvStore;
  }

  get key(): string {
    return this._key;
  }

  @action
  setKey(value: string) {
    this._key = value;
  }

  get isSimulating(): boolean {
    return this._isSimulating;
  }

  setSimulateGasFn(simulateGasFn: SimulateGasFn) {
    this.simulateGasFn = simulateGasFn;
  }

  get enabled(): boolean {
    if (this._forceDisabled) {
      return false;
    }

    return this._enabled;
  }

  @action
  setEnabled(value: boolean) {
    if (this._forceDisabled && value) {
      console.log(
        "Gas simulator is disabled by force. You can not enable the gas simulator"
      );
      return;
    }

    this._enabled = value;
  }

  get forceDisabled(): boolean {
    return this._forceDisabled;
  }

  get forceDisableReason(): Error | undefined {
    return this._forceDisableReason;
  }

  @action
  forceDisable(valueOrReason: boolean | Error) {
    if (!valueOrReason) {
      this._forceDisabled = false;
      this._forceDisableReason = undefined;
    } else {
      if (this.enabled) {
        this.setEnabled(false);
      }
      this._forceDisabled = true;
      if (typeof valueOrReason !== "boolean") {
        this._forceDisableReason = valueOrReason;
      }
    }
  }

  get error(): Error | undefined {
    const key = this.storeKey;
    const state = this.getState(key);
    return state.error;
  }

  get gasEstimate(): GasEstimate | undefined {
    const key = this.storeKey;
    const state = this.getState(key);

    if (state.recentGasEstimate != null) {
      return state.recentGasEstimate;
    }

    return state.initialGasEstimate ?? undefined;
  }

  protected init() {
    this._disposers.push(
      autorun(() => {
        if (!this.enabled) {
          return;
        }

        const key = this.storeKey;
        const state = this.getState(key);

        this.kvStore.get<string>(key).then((saved) => {
          if (saved) {
            try {
              const gasEstimate: GasEstimate = JSON.parse(saved);
              state.setInitialGasEstimate(gasEstimate);
            } catch (e) {
              // initial gas estimate is not critical,
              // just log the error and delete the estimate from the store.
              console.warn(e);
              this.kvStore.set(key, "");
            }
          }

          state.setIsInitialized(true);
        });
      })
    );

    // autorun is intentionally split.
    // The main reason for this implementation is that the gas when paying the fee is somewhat different from when there is a zero fee.
    // In order to calculate the gas more accurately, the fee should be included in the simulation,
    // but in the current reactive logic, the gas change by the simulation changes the fee and causes the simulation again.
    // Even though the implementation is not intuitive, the goals are
    // - Every time the observable used in simulateGasFn is updated, the simulation is refreshed.
    // - The simulation is refreshed only when changing from zero fee to paying fee or vice versa.
    // - feemarket 등에서 문제를 일으켜서 fee의 currency 자체가 바뀔때도 refresh 하도록 수정되었다. 이 경우 원활한 처리를 위해서 (귀찮아서) storeKey setter에서 적용된다.
    this._disposers.push(
      autorun(() => {
        if (!this.enabled) {
          return;
        }

        try {
          const key = this.storeKey;
          const state = this.getState(key);

          if (!state.isInitialized) {
            return;
          }

          const gasSimulate = this.simulateGasFn();

          runInAction(() => {
            if (state.recentGasEstimate == null || state.error != null) {
              state.refreshGasSimulate(gasSimulate);
            }
          });
        } catch (e) {
          console.log(e);
          return;
        }
      })
    );

    this._disposers.push(
      autorun(() => {
        const key = this.storeKey;
        const state = this.getState(key);

        if (!state.gasSimulate) {
          return;
        }

        if (this._debounceTimeoutId) {
          clearTimeout(this._debounceTimeoutId);
        }

        const promise = state.gasSimulate();

        this._debounceTimeoutId = setTimeout(() => {
          runInAction(() => {
            this._isSimulating = true;
          });

          promise
            .then((gasEstimate) => {
              state.setRecentGasEstimate(gasEstimate);
              state.setError(undefined);

              this.kvStore.set(key, JSON.stringify(gasEstimate)).catch((e) => {
                console.log(e);
              });
            })
            .catch((e) => {
              console.log("starknet gas simulate error", e);
              if (isSimpleFetchError(e) && e.response) {
                let message = "";
                const contentType: string = e.response.headers
                  ? e.response.headers.get("content-type") || ""
                  : "";
                // Try to figure out the message from the response.
                // If the contentType in the header is specified, try to use the message from the response.
                if (
                  contentType.startsWith("text/plain") &&
                  typeof e.response.data === "string"
                ) {
                  message = e.response.data;
                }
                // If the response is an object and "message" field exists, it is used as a message.
                if (
                  contentType.startsWith("application/json") &&
                  e.response.data?.message &&
                  typeof e.response.data?.message === "string"
                ) {
                  message = e.response.data.message;
                }

                if (message !== "") {
                  state.setError(new Error(message));
                  return;
                }
              }

              state.setError(e);
            })
            .finally(() => {
              runInAction(() => {
                this._isSimulating = false;
              });
            });
        }, this._debounceMs);
      })
    );

    this._disposers.push(
      autorun(() => {
        if (this.enabled && this.gasEstimate != null) {
          const { l1DataGas, l1Gas, l2Gas } = this.gasEstimate;

          const gas = new Dec(l1DataGas.consumed)
            .add(new Dec(l1Gas.consumed))
            .add(new Dec(l2Gas.consumed));

          this.gasConfig.setValue(gas.truncate().toString());
        }
      })
    );
  }

  dispose() {
    for (const disposer of this._disposers) {
      disposer();
    }
  }

  get uiProperties(): UIProperties {
    const key = this.storeKey;
    const state = this.getState(key);

    return {
      warning: (() => {
        if (this.forceDisableReason) {
          return this.forceDisableReason;
        }

        if (this.error) {
          return this.error;
        }
      })(),
      loadingState: (() => {
        if (!this.enabled) {
          return;
        }

        if (this.isSimulating) {
          // If there is no saved result of the last simulation, user interaction is blocked.
          return state.initialGasEstimate == null ? "loading-block" : "loading";
        }
      })(),
    };
  }

  protected getState(key: string): GasSimulatorState {
    if (!this._stateMap.has(key)) {
      runInAction(() => {
        this._stateMap.set(key, new GasSimulatorState());
      });
    }

    return this._stateMap.get(key)!;
  }

  @computed
  protected get storeKey(): string {
    const chainIdentifier = ChainIdHelper.parse(this.chainId);
    const fees = "TODO";
    // TODO
    // const fees = this.feeConfig
    //   .toStdFee()
    //   .amount.map((coin) => coin.denom)
    //   .join("/");
    return `${chainIdentifier.identifier}/${fees}/${this.key}`;
  }
}

// CONTRACT: Use with `observer`
export const useGasSimulator = (
  kvStore: KVStore,
  chainGetter: ChainGetter,
  chainId: string,
  gasConfig: IGasConfig,
  feeConfig: IFeeConfig,
  key: string,
  simulateGasFn: SimulateGasFn,
  initialDisabled?: boolean
) => {
  const [gasSimulator] = useState(() => {
    const gasSimulator = new GasSimulator(
      kvStore,
      chainGetter,
      chainId,
      gasConfig,
      feeConfig,
      key,
      simulateGasFn
    );
    if (initialDisabled) {
      gasSimulator.setEnabled(false);
    } else {
      gasSimulator.setEnabled(true);
    }

    return gasSimulator;
  });
  gasSimulator.setKVStore(kvStore);
  gasSimulator.setChain(chainId);
  gasSimulator.setKey(key);
  gasSimulator.setSimulateGasFn(simulateGasFn);

  useEffect(() => {
    return () => {
      gasSimulator.dispose();
    };
  }, [gasSimulator]);

  return gasSimulator;
};
