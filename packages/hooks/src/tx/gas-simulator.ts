import { IFeeConfig, IGasConfig, IGasSimulator } from "./types";
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
import { ChainGetter, MakeTxResponse } from "@keplr-wallet/stores";
import { Coin, StdFee } from "@cosmjs/launchpad";
import Axios from "axios";

type TxSimulate = Pick<MakeTxResponse, "simulate">;
export type SimulateGasFn = () => TxSimulate;

class GasSimulatorState {
  @observable
  protected _outdatedCosmosSdk: boolean = false;

  // If the initialGasEstimated is null, it means that there is no value stored or being loaded.
  @observable
  protected _initialGasEstimated: number | null = null;

  @observable
  protected _recentGasEstimated: number | undefined = undefined;

  @observable.ref
  protected _tx: TxSimulate | undefined = undefined;
  @observable.ref
  protected _stdFee: StdFee | undefined = undefined;

  constructor() {
    makeObservable(this);
  }

  get outdatedCosmosSdk(): boolean {
    return this._outdatedCosmosSdk;
  }

  @action
  setOutdatedCosmosSdk(value: boolean) {
    this._outdatedCosmosSdk = value;
  }

  get initialGasEstimated(): number | null {
    return this._initialGasEstimated;
  }

  @action
  setInitialGasEstimated(value: number) {
    this._initialGasEstimated = value;
  }

  get recentGasEstimated(): number | undefined {
    return this._recentGasEstimated;
  }

  @action
  setRecentGasEstimated(value: number) {
    this._recentGasEstimated = value;
  }

  get tx(): TxSimulate | undefined {
    return this._tx;
  }

  @action
  refreshTx(tx: TxSimulate | undefined) {
    this._tx = tx;
  }

  get stdFee(): StdFee | undefined {
    return this._stdFee;
  }

  @action
  refreshStdFee(fee: StdFee | undefined) {
    this._stdFee = fee;
  }

  static isZeroFee(amount: readonly Coin[] | undefined): boolean {
    if (!amount) {
      return true;
    }

    for (const coin of amount) {
      if (coin.amount !== "0") {
        return false;
      }
    }

    return true;
  }
}

export class GasSimulator extends TxChainSetter implements IGasSimulator {
  @observable
  protected _key: string;

  @observable
  protected _gasAdjustmentRaw: string = "1.3";

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

  protected _disposers: IReactionDisposer[] = [];

  constructor(
    // TODO: Add comment about the reason why kvStore field is not observable.
    protected kvStore: KVStore,
    chainGetter: ChainGetter,
    initialChainId: string,
    protected readonly gasConfig: IGasConfig,
    protected readonly feeConfig: IFeeConfig,
    protected readonly initialKey: string,
    // TODO: Add comment about the reason why simulateGasFn field is not observable.
    protected simulateGasFn: SimulateGasFn
  ) {
    super(chainGetter, initialChainId);

    this._chainId = initialChainId;
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

  get outdatedCosmosSdk(): boolean {
    const key = this.storeKey;
    const state = this.getState(key);
    return state.outdatedCosmosSdk;
  }

  get gasEstimated(): number | undefined {
    const key = this.storeKey;
    const state = this.getState(key);
    if (state.recentGasEstimated != null) {
      return state.recentGasEstimated;
    }

    if (state.initialGasEstimated != null) {
      return state.initialGasEstimated;
    }

    return undefined;
  }

  get gasAdjustment(): number {
    if (this._gasAdjustmentRaw === "") {
      return 0;
    }

    const num = parseFloat(this._gasAdjustmentRaw);
    if (Number.isNaN(num) || num < 0) {
      return 0;
    }

    return num;
  }

  get gasAdjustmentRaw(): string {
    return this._gasAdjustmentRaw;
  }

  @action
  setGasAdjustment(gasAdjustment: string | number) {
    if (typeof gasAdjustment === "number") {
      if (gasAdjustment < 0 || gasAdjustment > 2) {
        return;
      }

      this._gasAdjustmentRaw = gasAdjustment.toString();
      return;
    }

    if (gasAdjustment === "") {
      this._gasAdjustmentRaw = "";
      return;
    }

    if (gasAdjustment.startsWith(".")) {
      this._gasAdjustmentRaw = "0" + gasAdjustment;
    }

    const num = parseFloat(gasAdjustment);
    if (Number.isNaN(num) || num < 0 || num > 2) {
      return;
    }

    this._gasAdjustmentRaw = gasAdjustment;
  }

  protected init() {
    this._disposers.push(
      autorun(() => {
        if (!this.enabled) {
          return;
        }

        const key = this.storeKey;
        const state = this.getState(key);

        this.kvStore.get<number>(key).then((saved) => {
          if (saved) {
            state.setInitialGasEstimated(saved);
          }
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
    this._disposers.push(
      autorun(() => {
        if (!this.enabled) {
          return;
        }

        try {
          const tx = this.simulateGasFn();

          const key = this.storeKey;
          const state = this.getState(key);

          state.refreshTx(tx);
        } catch (e) {
          console.log(e);
          return;
        }
      })
    );

    this._disposers.push(
      autorun(() => {
        if (!this.enabled) {
          return;
        }

        const fee = this.feeConfig.toStdFee();

        const key = this.storeKey;
        const state = this.getState(key);

        if (
          GasSimulatorState.isZeroFee(state.stdFee?.amount) !==
          GasSimulatorState.isZeroFee(fee.amount)
        ) {
          state.refreshStdFee(fee);
        }
      })
    );

    this._disposers.push(
      autorun(() => {
        // TODO: Add debounce logic?

        const key = this.storeKey;
        const state = this.getState(key);

        if (!state.tx) {
          return;
        }

        const promise = state.tx.simulate(state.stdFee);

        runInAction(() => {
          this._isSimulating = true;
        });

        promise
          .then(({ gasUsed }) => {
            // Changing the gas in the gas config definitely will make the reaction to the fee config,
            // and, this reaction can potentially create a reaction in the amount config as well (Ex, when the "Max" option set).
            // These potential reactions can create repeated meaningless reactions.
            // To avoid this potential problem, change the value when there is a meaningful change in the gas estimated.
            if (
              !state.recentGasEstimated ||
              Math.abs(state.recentGasEstimated - gasUsed) /
                state.recentGasEstimated >
                0.02
            ) {
              state.setRecentGasEstimated(gasUsed);
            }

            state.setOutdatedCosmosSdk(false);

            this.kvStore.set(key, gasUsed).catch((e) => {
              console.log(e);
            });
          })
          .catch((e) => {
            if (Axios.isAxiosError(e) && e.response) {
              if (
                e.response.status === 400 &&
                e.response.data?.message &&
                typeof e.response.data.message === "string" &&
                e.response.data.message.includes("invalid empty tx")
              ) {
                state.setOutdatedCosmosSdk(true);
              }
            }

            console.log(e);
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
        if (this.enabled && this.gasEstimated != null) {
          this.gasConfig.setGas(this.gasEstimated * this.gasAdjustment);
        }
      })
    );
  }

  dispose() {
    for (const disposer of this._disposers) {
      disposer();
    }
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
    return `${chainIdentifier.identifier}/${this.key}`;
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
