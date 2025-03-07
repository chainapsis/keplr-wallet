import { ITxSizeConfig, UIProperties } from "./types";
import { TxChainSetter } from "./chain";
import { ChainGetter } from "@keplr-wallet/stores";
import { action, computed, makeObservable, observable } from "mobx";
import { useState } from "react";

export class TxSizeConfig extends TxChainSetter implements ITxSizeConfig {
  @observable.ref
  protected _txSize:
    | {
        txVBytes: number;
        txBytes: number;
        txWeight: number;
        dustVBytes?: number;
      }
    | undefined = undefined;

  @observable
  protected _allowZeroTxSize?: boolean = undefined;

  constructor(chainGetter: ChainGetter, initialChainId: string) {
    super(chainGetter, initialChainId);

    makeObservable(this);
  }

  @action
  setTxSize(txSize: {
    txVBytes: number;
    txBytes: number;
    txWeight: number;
    dustVBytes?: number;
  }): void {
    this._txSize = txSize;
  }

  get txVBytes(): number {
    return this._txSize?.txVBytes ?? 0;
  }

  get txBytes(): number {
    return this._txSize?.txBytes ?? 0;
  }

  get txWeight(): number {
    return this._txSize?.txWeight ?? 0;
  }

  get dustVBytes(): number | undefined {
    return this._txSize?.dustVBytes;
  }

  @computed
  get uiProperties(): UIProperties {
    if (!this._txSize) {
      return {
        error: new Error("Tx size not set"),
      };
    }

    return {};
  }
}

export const useTxSizeConfig = (chainGetter: ChainGetter, chainId: string) => {
  const [txConfig] = useState(() => new TxSizeConfig(chainGetter, chainId));
  txConfig.setChain(chainId);

  return txConfig;
};
