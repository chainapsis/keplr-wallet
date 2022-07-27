import { IGasConfig, IGasSimulator } from "./types";
import {
  action,
  autorun,
  IReactionDisposer,
  makeObservable,
  observable,
  runInAction,
} from "mobx";
import { useEffect, useState } from "react";

export type SimulateGasFn = () => Promise<number>;

export class GasSimulator implements IGasSimulator {
  @observable
  protected _gasEstimated: number | undefined = undefined;

  @observable
  protected _gasAdjustmentRaw: string = "1.3";

  @observable
  protected _enabled: boolean = false;

  protected _disposers: IReactionDisposer[] = [];

  constructor(
    protected readonly gasConfig: IGasConfig,
    // TODO: Add comment about the reason why simulateGasFn field is not observable.
    protected simulateGasFn: SimulateGasFn
  ) {
    makeObservable(this);

    this.init();
  }

  setSimulateGasFn(simulateGasFn: SimulateGasFn) {
    this.simulateGasFn = simulateGasFn;
  }

  get enabled(): boolean {
    return this._enabled;
  }

  @action
  setEnabled(value: boolean) {
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
        if (!this.enabled) {
          return;
        }

        // The lines below look a bit odd...
        // But did this intentionally because we have to catch the error in both cases,
        // the error from the function returning the promise and the error from the returned promise.
        try {
          this.simulateGasFn()
            .then((gasEstimated) => {
              if (this.enabled) {
                runInAction(() => {
                  this._gasEstimated = gasEstimated;
                });
              }
            })
            .catch((e) => {
              console.log(e);
            });
        } catch (e) {
          console.log(e);
          return;
        }
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
}

// CONTRACT: Use with `observer`
export const useGasSimulator = (
  gasConfig: IGasConfig,
  simulateGasFn: SimulateGasFn,
  initialDisabled?: boolean
) => {
  const [gasSimulator] = useState(() => {
    const gasSimulator = new GasSimulator(gasConfig, simulateGasFn);
    if (initialDisabled) {
      gasSimulator.setEnabled(false);
    } else {
      gasSimulator.setEnabled(true);
    }

    return gasSimulator;
  });
  gasSimulator.setSimulateGasFn(simulateGasFn);

  useEffect(() => {
    return () => {
      gasSimulator.dispose();
    };
  }, [gasSimulator]);

  return gasSimulator;
};
