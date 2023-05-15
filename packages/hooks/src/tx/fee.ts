import {
  DefaultGasPriceStep,
  FeeType,
  IBaseAmountConfig,
  IFeeConfig,
  IGasConfig,
  ISenderConfig,
  UIProperties,
} from "./types";
import { TxChainSetter } from "./chain";
import { ChainGetter } from "@keplr-wallet/stores";
import { action, computed, makeObservable, observable } from "mobx";
import { CoinPretty, Dec, Int } from "@keplr-wallet/unit";
import { Currency, FeeCurrency, StdFee } from "@keplr-wallet/types";
import { computedFn } from "mobx-utils";
import { useState } from "react";
import { InsufficientFeeError } from "./errors";
import { QueriesStore } from "./internal";

export class FeeConfig extends TxChainSetter implements IFeeConfig {
  @observable.ref
  protected _fee:
    | {
        type: FeeType;
        currency: Currency;
      }
    | CoinPretty[]
    | undefined = undefined;

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
  protected computeTerraClassicTax: boolean = false;

  @observable
  protected _disableBalanceCheck: boolean = false;

  constructor(
    chainGetter: ChainGetter,
    protected readonly queriesStore: QueriesStore,
    initialChainId: string,
    protected readonly senderConfig: ISenderConfig,
    protected readonly amountConfig: IBaseAmountConfig,
    protected readonly gasConfig: IGasConfig,
    additionAmountToNeedFee: boolean = true,
    computeTerraClassicTax: boolean = false
  ) {
    super(chainGetter, initialChainId);

    this.additionAmountToNeedFee = additionAmountToNeedFee;
    this.computeTerraClassicTax = computeTerraClassicTax;

    makeObservable(this);
  }

  @action
  setAdditionAmountToNeedFee(additionAmountToNeedFee: boolean) {
    this.additionAmountToNeedFee = additionAmountToNeedFee;
  }

  @action
  setComputeTerraClassicTax(computeTerraClassicTax: boolean) {
    this.computeTerraClassicTax = computeTerraClassicTax;
  }

  @action
  setDisableBalanceCheck(bool: boolean) {
    this._disableBalanceCheck = bool;
  }

  get disableBalanceCheck(): boolean {
    return this._disableBalanceCheck;
  }

  get type(): FeeType | "manual" {
    if (!this._fee) {
      return "manual";
    }

    if ("type" in this._fee) {
      return this._fee.type;
    }

    return "manual";
  }

  @action
  setFee(
    fee:
      | {
          type: FeeType;
          currency: Currency;
        }
      | CoinPretty
      | CoinPretty[]
      | undefined
  ): void {
    if (fee && "type" in fee) {
      // Destruct it to ensure ref update.
      this._fee = {
        ...fee,
      };
    } else if (fee) {
      if ("length" in fee) {
        this._fee = fee;
      } else {
        this._fee = [fee];
      }
    } else {
      this._fee = undefined;
    }
  }

  @computed
  get selectableFeeCurrencies(): FeeCurrency[] {
    if (
      this.computeTerraClassicTax &&
      this.chainInfo.hasFeature("terra-classic-fee")
    ) {
      // TODO: 나중에 하자...
    }

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

  toStdFee(): StdFee {
    const primitive = this.getFeePrimitive();

    return {
      gas: this.gasConfig.gas.toString(),
      amount: primitive.map((p) => {
        return {
          amount: p.amount,
          denom: p.currency.coinMinimalDenom,
        };
      }),
    };
  }

  @computed
  get fees(): CoinPretty[] {
    const primitives = this.getFeePrimitive();

    return primitives.map((p) => {
      return new CoinPretty(p.currency, p.amount);
    });
  }

  getFeePrimitive(): {
    amount: string;
    currency: FeeCurrency;
  }[] {
    // If there is no fee currency, just return with empty fee amount.
    if (!this._fee) {
      return [];
    }

    if ("type" in this._fee) {
      return [
        {
          amount: this.getFeeTypePrettyForFeeCurrency(
            this._fee.currency,
            this._fee.type
          ).toCoin().amount,
          currency: this._fee.currency,
        },
      ];
    }

    return this._fee.map((fee) => {
      return {
        amount: fee.toCoin().amount,
        currency: fee.currency,
      };
    });
  }

  protected canOsmosisTxFeesAndReady(): boolean {
    if (this.chainInfo.hasFeature("osmosis-txfees")) {
      const queries = this.queriesStore.get(this.chainId);
      if (!queries.osmosis) {
        console.log(
          "Chain has osmosis-txfees feature. But no osmosis queries provided."
        );
        return false;
      }

      const queryBaseDenom = queries.osmosis.queryTxFeesBaseDenom;

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

  readonly getFeeTypePrettyForFeeCurrency = computedFn(
    (feeCurrency: FeeCurrency, feeType: FeeType) => {
      const gas = this.gasConfig.gas;
      const amount = this.getGasPriceForFeeCurrency(feeCurrency, feeType).mul(
        new Dec(gas)
      );

      return new CoinPretty(feeCurrency, amount.roundUp()).maxDecimals(
        feeCurrency.coinDecimals
      );
    }
  );

  readonly getGasPriceForFeeCurrency = computedFn(
    (feeCurrency: FeeCurrency, feeType: FeeType): Dec => {
      if (this.canOsmosisTxFeesAndReady()) {
        const queryOsmosis = this.queriesStore.get(this.chainId).osmosis;
        if (queryOsmosis) {
          const baseDenom = queryOsmosis.queryTxFeesBaseDenom.baseDenom;
          if (
            feeCurrency.coinMinimalDenom !== baseDenom &&
            queryOsmosis.queryTxFeesFeeTokens.isTxFeeToken(
              feeCurrency.coinMinimalDenom
            )
          ) {
            const baseFeeCurrency = this.chainInfo.feeCurrencies.find(
              (cur) => cur.coinMinimalDenom === baseDenom
            );
            if (baseFeeCurrency) {
              const baseGasPriceStep =
                baseFeeCurrency.gasPriceStep ?? DefaultGasPriceStep;

              const baseGasPrice = new Dec(
                baseGasPriceStep[feeType].toString()
              );
              const spotPriceDec =
                queryOsmosis.queryTxFeesSpotPriceByDenom.getQueryDenom(
                  feeCurrency.coinMinimalDenom
                ).spotPriceDec;
              if (spotPriceDec.gt(new Dec(0))) {
                // If you calculate only the spot price, slippage cannot be considered
                // However, rather than performing the actual calculation here,
                // the slippage problem is avoided by simply giving an additional value of 1%.
                return baseGasPrice.quo(spotPriceDec).mul(new Dec(1.01));
              } else {
                return new Dec(0);
              }
            }
          }
        }
      }

      // TODO: Handle terra classic fee

      const gasPriceStep = feeCurrency.gasPriceStep ?? DefaultGasPriceStep;
      let gasPrice = new Dec(0);
      switch (feeType) {
        case "low": {
          gasPrice = new Dec(gasPriceStep.low);
          break;
        }
        case "average": {
          gasPrice = new Dec(gasPriceStep.average);
          break;
        }
        case "high": {
          gasPrice = new Dec(gasPriceStep.high);
          break;
        }
        default: {
          throw new Error(`Unknown fee type: ${feeType}`);
        }
      }

      return gasPrice;
    }
  );

  @computed
  get uiProperties(): UIProperties {
    if (this.disableBalanceCheck) {
      return {};
    }

    const fee = this.getFeePrimitive();
    if (!fee) {
      return {};
    }

    if (this.canOsmosisTxFeesAndReady()) {
      const queryOsmosis = this.queriesStore.get(this.chainId).osmosis;
      if (queryOsmosis && this.getFeePrimitive().length > 0) {
        const baseDenom = queryOsmosis.queryTxFeesBaseDenom.baseDenom;
        const feeCurrency = this.getFeePrimitive()[0].currency;
        if (
          feeCurrency.coinMinimalDenom !== baseDenom &&
          queryOsmosis.queryTxFeesFeeTokens.isTxFeeToken(
            feeCurrency.coinMinimalDenom
          )
        ) {
          const spotPrice =
            queryOsmosis.queryTxFeesSpotPriceByDenom.getQueryDenom(
              feeCurrency.coinMinimalDenom
            );

          const error = (() => {
            if (spotPrice.error) {
              return new Error("Failed to fetch spot price");
            }
          })();
          const loadingState = (() => {
            if (!spotPrice.response) {
              return "loading-block";
            }

            if (spotPrice.isFetching) {
              return "loading";
            }
          })();

          // Return only needed.
          // There is proceeding logic to validate the balance.
          if (error || loadingState) {
            return {
              error,
              loadingState,
            };
          }
        }
      }
    }

    // TODO: 여기서 terra classic 관련 무슨 처리를 해야하는데 나중에 하자...

    const amount = this.amountConfig.amount;

    const needs = fee.slice();
    if (this.additionAmountToNeedFee) {
      for (let i = 0; i < needs.length; i++) {
        const need = needs[i];
        for (const amt of amount) {
          if (
            need.currency.coinMinimalDenom === amt.currency.coinMinimalDenom
          ) {
            needs[i] = {
              ...need,
              amount: new Int(need.amount)
                .add(new Int(amt.toCoin().amount))
                .toString(),
            };
          }
        }
      }
    }

    for (let i = 0; i < needs.length; i++) {
      const need = needs[i];

      if (new Int(need.amount).lte(new Int(0))) {
        continue;
      }

      const bal = this.queriesStore
        .get(this.chainId)
        .queryBalances.getQueryBech32Address(this.senderConfig.value)
        .balances.find(
          (bal) =>
            bal.currency.coinMinimalDenom === need.currency.coinMinimalDenom
        );

      if (!bal) {
        return {
          warning: new Error(
            `Can't parse the balance for ${need.currency.coinMinimalDenom}`
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

      if (new Int(bal.balance.toCoin().amount).lt(new Int(need.amount))) {
        return {
          error: new InsufficientFeeError("Insufficient fee"),
          loadingState: bal.isFetching ? "loading" : undefined,
        };
      }
    }

    return {};
  }
}

export const useFeeConfig = (
  chainGetter: ChainGetter,
  queriesStore: QueriesStore,
  chainId: string,
  senderConfig: ISenderConfig,
  amountConfig: IBaseAmountConfig,
  gasConfig: IGasConfig,
  opts: {
    additionAmountToNeedFee?: boolean;
    computeTerraClassicTax?: boolean;
  } = {}
) => {
  const [config] = useState(
    () =>
      new FeeConfig(
        chainGetter,
        queriesStore,
        chainId,
        senderConfig,
        amountConfig,
        gasConfig,
        opts.additionAmountToNeedFee ?? true,
        opts.computeTerraClassicTax ?? false
      )
  );
  config.setChain(chainId);
  config.setAdditionAmountToNeedFee(opts.additionAmountToNeedFee ?? true);
  config.setComputeTerraClassicTax(opts.computeTerraClassicTax ?? false);

  return config;
};
