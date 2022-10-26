import {
  DefaultGasPriceStep,
  FeeType,
  IAmountConfig,
  IFeeConfig,
  IGasConfig,
} from "./types";
import { TxChainSetter } from "./chain";
import { ChainGetter, CoinPrimitive } from "@keplr-wallet/stores";
import { action, computed, makeObservable, observable } from "mobx";
import { Coin, CoinPretty, Dec, DecUtils, Int } from "@keplr-wallet/unit";
import { FeeCurrency } from "@keplr-wallet/types";
import { computedFn } from "mobx-utils";
import { StdFee } from "@cosmjs/launchpad";
import { useState } from "react";
import { InsufficientFeeError, NotLoadedFeeError } from "./errors";
import { QueriesStore } from "./internal";

export class FeeConfig extends TxChainSetter implements IFeeConfig {
  @observable
  protected _sender: string;

  @observable
  protected _autoFeeCoinMinimalDenom: string | undefined = undefined;
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
    protected readonly queriesStore: QueriesStore,
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

  get sender(): string {
    return this._sender;
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

  @action
  setAutoFeeCoinMinimalDenom(denom: string | undefined) {
    this._autoFeeCoinMinimalDenom = denom;
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

  @computed
  get feeCurrencies(): FeeCurrency[] {
    if (this.canOsmosisTxFeesAndReady()) {
      const queryOsmosis = this.queriesStore.get(this.chainId).osmosis;

      if (queryOsmosis) {
        const txFees = queryOsmosis.queryTxFeesFeeTokens;

        const exists: { [denom: string]: boolean | undefined } = {};

        // To reduce the confusion, add the priority to native (not ibc token) currency.
        // And, put the most priority to the base denom.
        // Remainings are sorted in alphabetical order.
        return this.chainInfo.feeCurrencies
          .concat(txFees.feeCurrencies)
          .filter((cur) => {
            if (!exists[cur.coinMinimalDenom]) {
              exists[cur.coinMinimalDenom] = true;
              return true;
            }

            return false;
          })
          .sort((cur1, cur2) => {
            if (
              cur1.coinMinimalDenom ===
              queryOsmosis.queryTxFeesBaseDenom.baseDenom
            ) {
              return -1;
            }
            if (
              cur2.coinMinimalDenom ===
              queryOsmosis.queryTxFeesBaseDenom.baseDenom
            ) {
              return 1;
            }

            const cur1IsIBCToken = cur1.coinMinimalDenom.startsWith("ibc/");
            const cur2IsIBCToken = cur2.coinMinimalDenom.startsWith("ibc/");
            if (cur1IsIBCToken && !cur2IsIBCToken) {
              return 1;
            }
            if (!cur1IsIBCToken && cur2IsIBCToken) {
              return -1;
            }

            return cur1.coinMinimalDenom < cur2.coinMinimalDenom ? -1 : 1;
          });
      }
    }

    const res: FeeCurrency[] = [];

    for (const feeCurrency of this.chainInfo.feeCurrencies) {
      const cur = this.chainInfo.findCurrency(feeCurrency.coinMinimalDenom);
      if (cur) {
        res.push({
          ...feeCurrency,
          ...cur,
        });
      }
    }

    return res;
  }

  @computed
  get feeCurrency(): FeeCurrency | undefined {
    if (this._manualFee) {
      for (const currency of this.feeCurrencies) {
        if (currency.coinMinimalDenom === this._manualFee.denom) {
          return currency;
        }
      }

      return {
        coinMinimalDenom: this._manualFee.denom,
        coinDenom: this._manualFee.denom,
        coinDecimals: 0,
      };
    }

    if (this._autoFeeCoinMinimalDenom) {
      for (const currency of this.feeCurrencies) {
        if (currency.coinMinimalDenom === this._autoFeeCoinMinimalDenom) {
          return currency;
        }
      }
    }

    return this.feeCurrencies[0];
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
      return this.getFeeTypePrimitive(this.feeCurrency, this.feeType);
    }

    // If fee is not set, just return with empty fee amount.
    return undefined;
  }

  protected canOsmosisTxFeesAndReady(): boolean {
    if (
      this.chainInfo.features &&
      this.chainInfo.features.includes("osmosis-txfees")
    ) {
      if (!this.queriesStore.get(this.chainId).osmosis) {
        console.log(
          "Chain has osmosis-txfees feature. But no osmosis queries provided."
        );
        return false;
      }

      const queryBaseDenom = this.queriesStore.get(this.chainId).osmosis!
        .queryTxFeesBaseDenom;

      if (
        queryBaseDenom.baseDenom &&
        this.chainInfo.feeCurrencies.find(
          (cur) => cur.coinMinimalDenom === queryBaseDenom.baseDenom
        )
      ) {
        return true;
      }
    }

    return false;
  }

  protected getFeeTypePrimitive(
    feeCurrency: FeeCurrency,
    feeType: FeeType
  ): CoinPrimitive {
    if (this._manualFee) {
      throw new Error(
        "Can't calculate fee from fee type. Because fee config uses the manual fee now"
      );
    }

    if (
      this.chainInfo.features &&
      this.chainInfo.features.includes("osmosis-txfees") &&
      this.queriesStore.get(this.chainId).osmosis &&
      this.queriesStore
        .get(this.chainId)
        .osmosis?.queryTxFeesFeeTokens.isTxFeeToken(
          feeCurrency.coinMinimalDenom
        )
    ) {
      const gasPriceStep =
        this.feeCurrencies[0].gasPriceStep ?? DefaultGasPriceStep;

      const gasPrice = new Dec(gasPriceStep[feeType].toString());
      let feeAmount = gasPrice.mul(new Dec(this.gasConfig.gas));

      const spotPriceDec = this.queriesStore
        .get(this.chainId)
        .osmosis!.queryTxFeesSpotPriceByDenom.getQueryDenom(
          feeCurrency.coinMinimalDenom
        ).spotPriceDec;
      if (spotPriceDec.gt(new Dec(0))) {
        // If you calculate only the spot price, slippage cannot be considered. However, rather than performing the actual calculation here, the slippage problem is avoided by simply giving an additional value of 1%.
        feeAmount = feeAmount.quo(spotPriceDec).mul(new Dec(1.01));
      } else {
        // 0 fee amount makes the simulation twice because there will be no zero fee immediately.
        // To reduce this problem, just set the fee amount as 1.
        feeAmount = new Dec(1);
      }

      return {
        denom: feeCurrency.coinMinimalDenom,
        amount: feeAmount.roundUp().toString(),
      };
    }

    // For legacy support
    // Fallback gas price step to legacy chain info which includes gas price step field in root,
    // if there is no gas price step in fee currency.
    const chainInfoWithGasPriceStep = (this.chainInfo.raw ?? {}) as {
      gasPriceStep?: {
        low: number;
        average: number;
        high: number;
      };
    };
    const gasPriceStep =
      this.feeCurrency?.gasPriceStep ??
      chainInfoWithGasPriceStep.gasPriceStep ??
      DefaultGasPriceStep;

    const gasPrice = new Dec(gasPriceStep[feeType].toString());
    const feeAmount = gasPrice.mul(new Dec(this.gasConfig.gas));

    return {
      denom: feeCurrency.coinMinimalDenom,
      amount: feeAmount.roundUp().toString(),
    };
  }

  readonly getFeeTypePretty = computedFn((feeType: FeeType) => {
    if (this._manualFee) {
      throw new Error(
        "Can't calculate fee from fee type. Because fee config uses the manual fee now"
      );
    }

    if (!this.feeCurrency) {
      throw new Error("Fee currency not set");
    }

    const feeTypePrimitive = this.getFeeTypePrimitive(
      this.feeCurrency,
      feeType
    );
    const feeCurrency = this.feeCurrency;

    return new CoinPretty(
      feeCurrency,
      new Int(feeTypePrimitive.amount)
    ).maxDecimals(feeCurrency.coinDecimals);
  });

  readonly getFeeTypePrettyForFeeCurrency = computedFn(
    (feeCurrency: FeeCurrency, feeType: FeeType) => {
      if (this._manualFee) {
        throw new Error(
          "Can't calculate fee from fee type. Because fee config uses the manual fee now"
        );
      }

      const feeTypePrimitive = this.getFeeTypePrimitive(feeCurrency, feeType);

      return new CoinPretty(
        feeCurrency,
        new Int(feeTypePrimitive.amount)
      ).maxDecimals(feeCurrency.coinDecimals);
    }
  );

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

    if (
      this.feeCurrency &&
      this.chainInfo.features &&
      this.chainInfo.features.includes("osmosis-txfees") &&
      this.queriesStore.get(this.chainId).osmosis &&
      this.queriesStore
        .get(this.chainId)
        .osmosis?.queryTxFeesFeeTokens.isTxFeeToken(
          this.feeCurrency.coinMinimalDenom
        )
    ) {
      const spotPrice = this.queriesStore
        .get(this.chainId)
        .osmosis!.queryTxFeesSpotPriceByDenom.getQueryDenom(
          this.feeCurrency.coinMinimalDenom
        );

      if (spotPrice.isFetching) {
        // Show loading indicator
        return new NotLoadedFeeError(
          `spot price of ${this.feeCurrency.coinMinimalDenom} is loading`
        );
      } else if (spotPrice.error) {
        return new Error("Failed to fetch spot price");
      }
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
  queriesStore: QueriesStore,
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
