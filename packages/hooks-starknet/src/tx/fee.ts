import {
  IAmountConfig,
  IFeeConfig,
  IGasConfig,
  ISenderConfig,
  UIProperties,
} from "./types";
import { TxChainSetter } from "./chain";
import { ChainGetter } from "@keplr-wallet/stores";
import { action, computed, makeObservable, observable } from "mobx";
import { useState } from "react";
import { StarknetQueriesStore } from "@keplr-wallet/stores-starknet";
import { CoinPretty } from "@keplr-wallet/unit";

export class FeeConfig extends TxChainSetter implements IFeeConfig {
  @observable.ref
  protected _fee: CoinPretty | undefined = undefined;
  @observable.ref
  protected _maxFee: CoinPretty | undefined = undefined;
  @observable
  protected _type: "ETH" | "STRK" = "STRK";

  @observable
  protected _disableBalanceCheck: boolean = false;

  constructor(
    chainGetter: ChainGetter,
    protected readonly starknetQueriesStore: StarknetQueriesStore,
    initialChainId: string,
    protected readonly senderConfig: ISenderConfig,
    protected readonly amountConfig: IAmountConfig,
    protected readonly gasConfig: IGasConfig
  ) {
    super(chainGetter, initialChainId);

    makeObservable(this);
  }

  @action
  setDisableBalanceCheck(bool: boolean) {
    this._disableBalanceCheck = bool;
  }

  get disableBalanceCheck(): boolean {
    return this._disableBalanceCheck;
  }

  @computed
  get uiProperties(): UIProperties {
    if (this.disableBalanceCheck) {
      return {};
    }

    if (!this._fee) {
      return {
        error: new Error("Fee is not set"),
        loadingState: "loading-block",
      };
    }

    return {};
  }

  get fee(): CoinPretty | undefined {
    return this._fee;
  }

  get maxFee(): CoinPretty | undefined {
    return this._maxFee;
  }

  get type(): "ETH" | "STRK" {
    return this._type;
  }

  @action
  setFee(
    fee:
      | {
          fee: CoinPretty;
          maxFee: CoinPretty;
        }
      | undefined
  ): void {
    this._fee = fee?.fee;
    this._maxFee = fee?.maxFee;
  }

  @action
  setType(type: "ETH" | "STRK"): void {
    if (this._type !== type) {
      this._type = type;
      this._fee = undefined;
    }
  }
}

export const useFeeConfig = (
  chainGetter: ChainGetter,
  queriesStore: StarknetQueriesStore,
  chainId: string,
  senderConfig: ISenderConfig,
  amountConfig: IAmountConfig,
  gasConfig: IGasConfig
) => {
  const [config] = useState(
    () =>
      new FeeConfig(
        chainGetter,
        queriesStore,
        chainId,
        senderConfig,
        amountConfig,
        gasConfig
      )
  );
  config.setChain(chainId);

  return config;
};
