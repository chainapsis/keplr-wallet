import {
  IFeeConfig,
  IFeeRateConfig,
  IPsbtSimulator,
  UIProperties,
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
import { RecipientConfig } from "./recipient";
import { AmountConfig } from "./amount";
import { Psbt } from "bitcoinjs-lib";

// TODO: utxo를 사용하는 체인에서 공통으로 사용할 수 있는 tx 타입 정의
type PsbtSimulate = () => Promise<{
  psbt: Psbt;
  hasChange: boolean;
}>;
export type SimulatePsbtFn = () => PsbtSimulate;

class PsbtSimulatorState {
  @observable
  protected _isInitialized: boolean = false;

  // If the initialSelectedUTXOs is null, it means that there is no value stored or being loaded.
  @observable.ref
  protected _initialPsbt: Psbt | null = null;

  @observable.ref
  protected _psbt: Psbt | null = null;
  @observable
  protected _psbtHasChange: boolean | null = null;

  @observable
  protected _psbtSimulate: PsbtSimulate | undefined = undefined;
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
  setInitialPsbt(value: Psbt) {
    this._initialPsbt = value;
  }

  @action
  refreshPsbtSimulate(value: PsbtSimulate) {
    this._psbtSimulate = value;
  }

  get psbtSimulate(): PsbtSimulate | undefined {
    return this._psbtSimulate;
  }

  @action
  setPsbt(value: Psbt) {
    this._psbt = value;
  }

  get psbt(): Psbt | null {
    return this._psbt;
  }

  @action
  setPsbtHasChange(value: boolean) {
    this._psbtHasChange = value;
  }

  get hasChange(): boolean | null {
    return this._psbtHasChange;
  }

  @action
  setError(error: Error | undefined) {
    this._error = error;
  }

  get error(): Error | undefined {
    return this._error;
  }
}

export class PsbtSimulator extends TxChainSetter implements IPsbtSimulator {
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
  protected _stateMap: Map<string, PsbtSimulatorState> = new Map();

  protected _disposers: IReactionDisposer[] = [];

  constructor(
    // TODO: Add comment about the reason why kvStore field is not observable.
    protected kvStore: KVStore,
    chainGetter: ChainGetter,
    initialChainId: string,
    protected readonly recipientConfig: RecipientConfig,
    protected readonly amountConfig: AmountConfig,
    protected readonly feeRateConfig: IFeeRateConfig,
    protected readonly feeConfig: IFeeConfig,
    protected readonly initialKey: string,
    // TODO: Add comment about the reason why simulatePsbtFn field is not observable.
    protected simulatePsbtFn: SimulatePsbtFn
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

  setSimulatePsbtFn(simulatePsbtFn: SimulatePsbtFn) {
    this.simulatePsbtFn = simulatePsbtFn;
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
        "Psbt simulator is disabled by force. You can not enable the Psbt simulator"
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

  get psbt(): Psbt | null {
    const key = this.storeKey;
    const state = this.getState(key);
    return state.psbt;
  }

  get hasChange(): boolean | null {
    const key = this.storeKey;
    const state = this.getState(key);
    return state.hasChange;
  }

  protected init() {
    // init psbt if it exists
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
              const psbt = Psbt.fromHex(saved);
              state.setInitialPsbt(psbt);
            } catch (e) {
              // just log the error, initial psbt is not critical.
              console.log(e);
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

          const psbtSimulate = this.simulatePsbtFn();

          runInAction(() => {
            if (state.psbt == null || state.error != null) {
              state.refreshPsbtSimulate(psbtSimulate);
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
        // TODO: Add debounce logic?

        const key = this.storeKey;
        const state = this.getState(key);

        if (!state.psbtSimulate) {
          return;
        }

        const promise = state.psbtSimulate();

        runInAction(() => {
          this._isSimulating = true;
        });

        promise
          .then(({ psbt, hasChange }) => {
            // Changing the gas in the gas config definitely will make the reaction to the fee config,
            // and, this reaction can potentially create a reaction in the amount config as well (Ex, when the "Max" option set).
            // These potential reactions can create repeated meaningless reactions.
            // To avoid this potential problem, change the value when there is a meaningful change in the gas estimated.
            const newVsize = psbt.extractTransaction().virtualSize();

            if (state.psbt) {
              const prevVsize = state.psbt.extractTransaction().virtualSize();
              if (newVsize > prevVsize) {
                // it doesn't need to refresh the psbt
                return;
              }
            }

            state.setPsbt(psbt);
            state.setPsbtHasChange(hasChange);
            state.setError(undefined);

            this.kvStore.set(key, psbt.toHex()).catch((e) => {
              console.log(e);
            });
          })
          .catch((e) => {
            console.log(e);
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
      })
    );

    this._disposers.push(
      autorun(() => {
        if (this.enabled && this.psbt != null) {
          this.feeConfig.setVsize(this.psbt.extractTransaction().virtualSize());
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
          return this.psbt == null ? "loading-block" : "loading";
        }
      })(),
    };
  }

  protected getState(key: string): PsbtSimulatorState {
    if (!this._stateMap.has(key)) {
      runInAction(() => {
        this._stateMap.set(key, new PsbtSimulatorState());
      });
    }

    return this._stateMap.get(key)!;
  }

  @computed
  protected get storeKey(): string {
    const chainIdentifier = ChainIdHelper.parse(this.chainId);
    const psbt = "TODO";
    // TODO
    // const fees = this.feeConfig
    //   .toStdFee()
    //   .amount.map((coin) => coin.denom)
    //   .join("/");
    return `${chainIdentifier.identifier}/${psbt}/${this.key}}`;
  }
}

// CONTRACT: Use with `observer`
export const usePsbtSimulator = (
  kvStore: KVStore,
  chainGetter: ChainGetter,
  chainId: string,
  recipientConfig: RecipientConfig,
  amountConfig: AmountConfig,
  feeRateConfig: IFeeRateConfig,
  feeConfig: IFeeConfig,
  key: string,
  simulatePsbtFn: SimulatePsbtFn,
  initialDisabled?: boolean
) => {
  const [psbtSimulator] = useState(() => {
    const psbtSimulator = new PsbtSimulator(
      kvStore,
      chainGetter,
      chainId,
      recipientConfig,
      amountConfig,
      feeRateConfig,
      feeConfig,
      key,
      simulatePsbtFn
    );
    if (initialDisabled) {
      psbtSimulator.setEnabled(false);
    } else {
      psbtSimulator.setEnabled(true);
    }

    return psbtSimulator;
  });
  psbtSimulator.setKVStore(kvStore);
  psbtSimulator.setChain(chainId);
  psbtSimulator.setKey(key);
  psbtSimulator.setSimulatePsbtFn(simulatePsbtFn);

  useEffect(() => {
    return () => {
      psbtSimulator.dispose();
    };
  }, [psbtSimulator]);

  return psbtSimulator;
};
