import { IGasConfig } from "./types";
import {
  action,
  autorun,
  IReactionDisposer,
  makeObservable,
  observable,
} from "mobx";

export type SimulateGasFn = () => Promise<number>;

export class GasSimulator {
  @observable
  protected _gasEstimated: number | undefined = undefined;

  @observable
  protected _gasAdjustmentRaw: string = "1.3";

  @observable
  protected _enabled: boolean = false;
  @observable
  protected _simulateGasFnIsProvided: boolean;

  protected _disposers: IReactionDisposer[] = [];

  constructor(
    protected readonly gasConfig: IGasConfig,
    protected simulateGasFn?: SimulateGasFn
  ) {
    this._simulateGasFnIsProvided = simulateGasFn != null;

    makeObservable(this);

    this.init();
  }

  get canEnabled(): boolean {
    return this._simulateGasFnIsProvided;
  }

  /*
   * Set `simulateGasFn` and `simulateGasFnIsProvided` and turn off `enabled` if simulateGasFn is null.
   * But `simulateGasFn` is not observable.
   * It is intended that `simulateGasFn` is not observable.
   * See other comments for why `simulateGasFn` is not observable...
   */
  @action
  setSimulateGasFn(simulateGasFn?: SimulateGasFn) {
    this.simulateGasFn = simulateGasFn;
    this._simulateGasFnIsProvided = simulateGasFn != null;

    if (!simulateGasFn && this.enabled) {
      console.log(
        "Turn off gas simulator because the simulateGasFn becomes null"
      );
      this.setEnabled(false);
    }
  }

  get enabled(): boolean {
    return this._enabled;
  }

  @action
  setEnabled(value: boolean) {
    if (value && !this.canEnabled) {
      console.log(
        "You can't enable gas simulator because no simulateGasFn is provided"
      );
      this._enabled = false;
      return;
    }
    this._enabled = value;
  }

  get gasEstimated(): number | undefined {
    return this._gasEstimated;
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
        if (!this.enabled || !this.simulateGasFn) {
          return;
        }

        const promise = this.simulateGasFn();

        promise
          .then((gasEstimated) => {
            if (this.enabled) {
              this._gasEstimated = gasEstimated;
            }
          })
          .catch((e) => {
            console.log(e);
          });
      })
    );

    this._disposers.push(
      autorun(() => {
        if (this.gasEstimated != null) {
          this.gasConfig.setGas(this.gasEstimated * this.gasAdjustment);
        }
      })
    );
  }

  protected dispose() {
    for (const disposer of this._disposers) {
      disposer();
    }
  }
}

// CONTRACT: Use with `observer`
export const useGasSimulator: (gasConfig: IGasConfig, enabled: boolean) => {};
