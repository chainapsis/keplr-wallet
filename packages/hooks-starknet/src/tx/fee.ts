import {
  FeeType,
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
import { CoinPretty, Dec, Int } from "@keplr-wallet/unit";
import { InsufficientFeeError } from "./errors";

export class FeeConfig extends TxChainSetter implements IFeeConfig {
  @observable.ref
  protected _gasPrice: CoinPretty | undefined = undefined;
  @observable.ref
  protected _maxGasPrice: CoinPretty | undefined = undefined;
  @observable
  protected _type: FeeType = "STRK";

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

    if (!this._gasPrice) {
      return {
        error: new Error("Fee is not set"),
        loadingState: "loading-block",
      };
    }

    if (!this._maxGasPrice) {
      return {
        error: new Error("Fee is not set"),
        loadingState: "loading-block",
      };
    }

    if (!this.fee) {
      return {
        error: new Error("Fee is not set"),
        loadingState: "loading-block",
      };
    }

    if (!this.maxFee) {
      return {
        error: new Error("Fee is not set"),
        loadingState: "loading-block",
      };
    }

    const maxFee = this.maxFee;

    const bal = this.starknetQueriesStore
      .get(this.chainId)
      .queryStarknetERC20Balance.getBalance(
        this.chainId,
        this.chainGetter,
        this.senderConfig.value,
        maxFee.currency.coinMinimalDenom
      );

    if (!bal) {
      return {
        warning: new Error(
          `Can't parse the balance for ${maxFee.currency.coinMinimalDenom}`
        ),
      };
    }

    if (bal.error) {
      return {
        warning: new Error("Failed to fetch balance"),
      };
    }

    if (!bal.response) {
      return {
        loadingState: "loading-block",
      };
    }

    if (
      new Int(bal.balance.toCoin().amount).lt(new Int(maxFee.toCoin().amount))
    ) {
      return {
        error: new InsufficientFeeError("Insufficient fee"),
        loadingState: bal.isFetching ? "loading" : undefined,
      };
    }

    return {};
  }

  get gasPrice(): CoinPretty | undefined {
    return this._gasPrice;
  }

  get maxGasPrice(): CoinPretty | undefined {
    return this._maxGasPrice;
  }

  get type(): FeeType {
    return this._type;
  }

  @action
  setGasPrice(
    gasPrice:
      | {
          gasPrice: CoinPretty;
          maxGasPrice: CoinPretty;
        }
      | undefined
  ): void {
    this._gasPrice = gasPrice?.gasPrice;
    this._maxGasPrice = gasPrice?.maxGasPrice;
  }

  @action
  setType(type: FeeType): void {
    if (this._type !== type) {
      this._type = type;
      this._gasPrice = undefined;
      this._maxGasPrice = undefined;
    }
  }

  // TODO: convert STRK to ETH if needed
  @computed
  get fee(): CoinPretty | undefined {
    if (!this._gasPrice) {
      return;
    }

    const gasDec = new Dec(this.gasConfig.gas);
    return this._gasPrice.mul(gasDec);
  }

  // TODO: convert STRK to ETH if needed
  @computed
  get maxFee(): CoinPretty | undefined {
    if (!this._maxGasPrice) {
      return;
    }

    const gasDec = new Dec(this.gasConfig.maxGas);
    return this._maxGasPrice.mul(gasDec);
  }
}

export const useFeeConfig = (
  chainGetter: ChainGetter,
  queriesStore: StarknetQueriesStore,
  chainId: string,
  senderConfig: ISenderConfig,
  amountConfig: IAmountConfig,
  gasConfig: IGasConfig,
  initialFn?: (config: FeeConfig) => void
) => {
  const [config] = useState(() => {
    const config = new FeeConfig(
      chainGetter,
      queriesStore,
      chainId,
      senderConfig,
      amountConfig,
      gasConfig
    );

    if (initialFn) {
      initialFn(config);
    }

    return config;
  });
  config.setChain(chainId);

  return config;
};
