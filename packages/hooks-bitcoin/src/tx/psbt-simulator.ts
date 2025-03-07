import {
  IFeeConfig,
  IPsbtSimulator,
  ITxSizeConfig,
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
import { Psbt } from "bitcoinjs-lib";
import { CoinPretty } from "@keplr-wallet/unit";

// TODO: utxo를 사용하는 체인에서 공통으로 사용할 수 있는 tx 타입 정의
type PsbtSimulate = () => Promise<{
  psbtHex: string;
  estimatedFee: CoinPretty;
  txSize: {
    txVBytes: number;
    txBytes: number;
    txWeight: number;
    dustVBytes?: number;
  };
}>;
export type SimulatePsbtFn = () => PsbtSimulate;

class PsbtSimulatorState {
  @observable
  protected _isInitialized: boolean = false;

  // If the initialPsbtHex is null, it means that there is no value stored or being loaded.
  @observable.ref
  protected _initialPsbtHex: string | null = null;

  // TODO: remove unnecessary observable
  @observable
  protected _psbtHex: string | null = null;
  @observable.ref
  protected _estimatedFee: CoinPretty | null = null;
  @observable.ref
  protected _txSize: {
    txVBytes: number;
    txBytes: number;
    txWeight: number;
    dustVBytes?: number;
  } | null = null;

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
  setInitialPsbtHex(value: string) {
    this._initialPsbtHex = value;
  }

  @action
  refreshPsbtSimulate(value: PsbtSimulate) {
    this._psbtSimulate = value;
  }

  get psbtSimulate(): PsbtSimulate | undefined {
    return this._psbtSimulate;
  }

  @action
  setPsbtHex(value: string) {
    this._psbtHex = value;
  }

  get psbtHex(): string | null {
    return this._psbtHex;
  }

  @action
  setEstimatedFee(value: CoinPretty) {
    this._estimatedFee = value;
  }

  get estimatedFee(): CoinPretty | null {
    return this._estimatedFee;
  }

  @action
  setTxSize(value: { txVBytes: number; txBytes: number; txWeight: number }) {
    this._txSize = value;
  }

  get txSize(): { txVBytes: number; txBytes: number; txWeight: number } | null {
    return this._txSize;
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
    protected readonly txSizeConfig: ITxSizeConfig,
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

  get psbtHex(): string | null {
    const key = this.storeKey;
    const state = this.getState(key);
    return state.psbtHex;
  }

  get txSize(): {
    txVBytes: number;
    txBytes: number;
    txWeight: number;
    dustVBytes?: number;
  } | null {
    const key = this.storeKey;
    const state = this.getState(key);
    return state.txSize;
  }

  get estimatedFee(): CoinPretty | null {
    const key = this.storeKey;
    const state = this.getState(key);
    return state.estimatedFee;
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
              const { psbtHex, txSize } = this.decodeStoreData(saved);
              Psbt.fromHex(psbtHex); // validate the psbt hex
              state.setInitialPsbtHex(psbtHex);
              state.setTxSize(txSize);
            } catch (e) {
              // initial psbt is not critical,
              // just log the error and delete the psbt from the store.
              console.log(e);
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

          const psbtSimulate = this.simulatePsbtFn();

          runInAction(() => {
            if (state.psbtHex == null || state.error != null) {
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
          .then(({ psbtHex, txSize, estimatedFee }) => {
            // Changing the gas in the gas config definitely will make the reaction to the fee config,
            // and, this reaction can potentially create a reaction in the amount config as well (Ex, when the "Max" option set).
            // These potential reactions can create repeated meaningless reactions.
            // To avoid this potential problem, change the value when there is a meaningful change in the gas estimated.

            state.setPsbtHex(psbtHex);
            state.setEstimatedFee(estimatedFee);
            state.setTxSize(txSize);
            state.setError(undefined);

            this.kvStore
              .set(key, this.encodeStoreData(psbtHex, txSize))
              .catch((e) => {
                console.log(e);
              });
          })
          .catch((e) => {
            console.log("psbt simulate error", e);
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
        if (this.enabled) {
          if (this.estimatedFee != null) {
            this.feeConfig.setFee(this.estimatedFee);
          }
          if (this.txSize != null) {
            this.txSizeConfig.setTxSize(this.txSize);
          }
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
          return this.psbtHex == null ? "loading-block" : "loading";
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

  protected encodeStoreData(
    psbtHex: string,
    txSize: {
      txVBytes: number;
      txBytes: number;
      txWeight: number;
      dustVBytes?: number;
    }
  ): string {
    const data = JSON.stringify({
      psbtHex,
      txSize,
    });
    return Buffer.from(data).toString("base64");
  }

  protected decodeStoreData(data: string) {
    const decoded = Buffer.from(data, "base64").toString("utf-8");
    return JSON.parse(decoded);
  }
}

// CONTRACT: Use with `observer`
export const usePsbtSimulator = (
  kvStore: KVStore,
  chainGetter: ChainGetter,
  chainId: string,
  txSizeConfig: ITxSizeConfig,
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
      txSizeConfig,
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
