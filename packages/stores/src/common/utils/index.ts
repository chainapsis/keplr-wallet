import { Currency } from "@keplr/types";
import { CoinPrimitive } from "../types";
import { CoinPretty, Int } from "@keplr/unit";

export class StoreUtils {
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
        let amount = bal.amount;
        // Some querying result have the dec amount. But, it is usually negligible.
        if (amount.includes(".")) {
          amount = amount.slice(0, amount.indexOf("."));
        }

        result.push(new CoinPretty(currency, new Int(amount)));
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
