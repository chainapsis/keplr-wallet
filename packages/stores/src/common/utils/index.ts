import { Currency } from "@keplr-wallet/types";
import { CoinPrimitive } from "../types";
import { CoinPretty, Dec, Int } from "@keplr-wallet/unit";
import { IModularChainInfoImpl } from "../../chain/types";

export class StoreUtils {
  public static toCoinPretties(
    chainInfo: IModularChainInfoImpl,
    balances: CoinPrimitive[]
  ): CoinPretty[] {
    const result: CoinPretty[] = [];
    for (const bal of balances) {
      const currency = chainInfo.findCurrency(bal.denom);
      if (currency) {
        const amount = new Dec(bal.amount);
        if (amount.truncate().gt(new Int(0))) {
          result.push(new CoinPretty(currency, amount));
        }
      }
    }

    return result;
  }

  /**
   * @deprecated
   * @param currenciesMap
   * @param bals
   */
  public static getBalancesFromCurrencies(
    currenciesMap: {
      [denom: string]: Currency;
    },
    bals: CoinPrimitive[]
  ): CoinPretty[] {
    const result: CoinPretty[] = [];
    for (const bal of bals) {
      const currency = currenciesMap[bal.denom];
      if (currency) {
        const amount = new Dec(bal.amount);
        if (amount.truncate().gt(new Int(0))) {
          result.push(new CoinPretty(currency, amount));
        }
      }
    }

    return result;
  }

  public static getBalanceFromCurrency(
    currency: Currency,
    bals: CoinPrimitive[]
  ): CoinPretty {
    const result = StoreUtils.getBalancesFromCurrencies(
      {
        [currency.coinMinimalDenom]: currency,
      },
      bals
    );

    if (result.length === 1) {
      return result[0];
    }

    return new CoinPretty(currency, new Int(0)).ready(false);
  }
}
