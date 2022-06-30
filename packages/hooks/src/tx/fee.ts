import {
  DefaultGasPriceStep,
  FeeType,
  IAmountConfig,
  IFeeConfig,
  IGasConfig,
} from "./types";
import { TxChainSetter } from "./chain";
import {
  ChainGetter,
  CoinPrimitive,
  IQueriesStore,
} from "@keplr-wallet/stores";
import { action, computed, makeObservable, observable } from "mobx";
import { Coin, CoinPretty, Dec, DecUtils, Int } from "@keplr-wallet/unit";
import { Currency } from "@keplr-wallet/types";
import { computedFn } from "mobx-utils";
import { StdFee } from "@cosmjs/launchpad";
import { useState } from "react";
import { InsufficientFeeError, NotLoadedFeeError } from "./errors";

export class FeeConfig extends TxChainSetter implements IFeeConfig {
  @observable
  protected _sender: string;

  @observable
  protected _feeType: FeeType | undefined = undefined;

  @observable
  protected _manualFee: CoinPrimitive | undefined = undefined;

  /**
   * `additionAmountToNeedFee` indicated that the fee config should consider the amount config's amount
   *  when checking that the fee is sufficient to send tx.
   *  If this value is true and if the amount + fee is not sufficient to send tx, it will return error.
   *  Else, only consider the fee without addition the amount.
   * @protected
   */
  @observable
  protected additionAmountToNeedFee: boolean = true;

  @observable
  protected _disableBalanceCheck: boolean = false;

  constructor(
    chainGetter: ChainGetter,
    protected readonly queriesStore: IQueriesStore,
    initialChainId: string,
    sender: string,
    protected readonly amountConfig: IAmountConfig,
    protected readonly gasConfig: IGasConfig,
    additionAmountToNeedFee: boolean = true
  ) {
    super(chainGetter, initialChainId);

    this._sender = sender;
    this.additionAmountToNeedFee = additionAmountToNeedFee;

    makeObservable(this);
  }

  @action
  setAdditionAmountToNeedFee(additionAmountToNeedFee: boolean) {
    this.additionAmountToNeedFee = additionAmountToNeedFee;
  }

  @action
  setSender(sender: string) {
    this._sender = sender;
  }

  @action
  setFeeType(feeType: FeeType | undefined) {
    this._feeType = feeType;
    this._manualFee = undefined;
  }

  get isManual(): boolean {
    return this.feeType === undefined;
  }

  get feeType(): FeeType | undefined {
    return this._feeType;
  }

  @action
  setManualFee(fee: CoinPrimitive) {
    this._manualFee = fee;
    this._feeType = undefined;
  }

  get feeCurrencies(): Currency[] {
    return this.chainInfo.feeCurrencies;
  }

  get feeCurrency(): Currency | undefined {
    return this.chainInfo.feeCurrencies[0];
  }

  toStdFee(): StdFee {
    const amount = this.getFeePrimitive();
    if (!amount) {
      return {
        gas: this.gasConfig.gas.toString(),
        amount: [],
      };
    }

    return {
      gas: this.gasConfig.gas.toString(),
      amount: [amount],
    };
  }

  @computed
  get fee(): CoinPretty | undefined {
    if (!this.feeCurrency) {
      return undefined;
    }

    const feePrimitive = this.getFeePrimitive();
    if (!feePrimitive) {
      return undefined;
    }

    return new CoinPretty(this.feeCurrency, new Int(feePrimitive.amount));
  }

  getFeePrimitive(): CoinPrimitive | undefined {
    // If there is no fee currency, just return with empty fee amount.
    if (!this.feeCurrency) {
      return undefined;
    }

    if (this._manualFee) {
      return this._manualFee;
    }

    if (this.feeType) {
      return this.getFeeTypePrimitive(this.feeType);
    }

    // If fee is not set, just return with empty fee amount.
    return undefined;
  }

  protected getFeeTypePrimitive(feeType: FeeType): CoinPrimitive {
    if (!this.feeCurrency) {
      throw new Error("Fee currency not set");
    }

    const gasPriceStep = this.chainInfo.gasPriceStep
      ? this.chainInfo.gasPriceStep
      : DefaultGasPriceStep;

    const gasPrice = new Dec(gasPriceStep[feeType].toString());
    const feeAmount = gasPrice.mul(new Dec(this.gasConfig.gas));

    return {
      denom: this.feeCurrency.coinMinimalDenom,
      amount: feeAmount.roundUp().toString(),
    };
  }

  readonly getFeeTypePretty = computedFn((feeType: FeeType) => {
    if (!this.feeCurrency) {
      throw new Error("Fee currency not set");
    }

    const feeTypePrimitive = this.getFeeTypePrimitive(feeType);
    const feeCurrency = this.feeCurrency;

    return new CoinPretty(
      feeCurrency,
      new Int(feeTypePrimitive.amount)
    ).maxDecimals(feeCurrency.coinDecimals);
  });

  @computed
  get error(): Error | undefined {
    if (this.gasConfig.error) {
      return this.gasConfig.error;
    }

    if (this.disableBalanceCheck) {
      return undefined;
    }

    const fee = this.getFeePrimitive();
    if (!fee) {
      return undefined;
    }

    const amount = this.amountConfig.getAmountPrimitive();

    let need: Coin;
    if (this.additionAmountToNeedFee && fee && fee.denom === amount.denom) {
      need = new Coin(
        fee.denom,
        new Int(fee.amount).add(new Int(amount.amount))
      );
    } else {
      need = new Coin(fee.denom, new Int(fee.amount));
    }

    if (need.amount.gt(new Int(0))) {
      const bal = this.queriesStore
        .get(this.chainId)
        .queryBalances.getQueryBech32Address(this._sender)
        .balances.find((bal) => {
          return bal.currency.coinMinimalDenom === need.denom;
        });

      if (!bal) {
        return new InsufficientFeeError("insufficient fee");
      } else if (!bal.response && !bal.error) {
        // If fetching balance doesn't have the response nor error,
        // assume it is not loaded from KVStore(cache).
        return new NotLoadedFeeError(
          `${bal.currency.coinDenom} is not loaded yet`
        );
      } else if (
        bal.balance
          .toDec()
          .mul(DecUtils.getPrecisionDec(bal.currency.coinDecimals))
          .truncate()
          .lt(need.amount)
      ) {
        return new InsufficientFeeError("insufficient fee");
      }
    }
  }

  @action
  setDisableBalanceCheck(bool: boolean) {
    this._disableBalanceCheck = bool;
  }

  get disableBalanceCheck(): boolean {
    return this._disableBalanceCheck;
  }
}

export const useFeeConfig = (
  chainGetter: ChainGetter,
  queriesStore: IQueriesStore,
  chainId: string,
  sender: string,
  amountConfig: IAmountConfig,
  gasConfig: IGasConfig,
  additionAmountToNeedFee: boolean = true
) => {
  const [config] = useState(
    () =>
      new FeeConfig(
        chainGetter,
        queriesStore,
        chainId,
        sender,
        amountConfig,
        gasConfig,
        additionAmountToNeedFee
      )
  );
  config.setChain(chainId);
  config.setSender(sender);
  config.setAdditionAmountToNeedFee(additionAmountToNeedFee);

  return config;
};
