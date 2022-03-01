import { Coin } from "./coin";
import { Int } from "./int";
import { Dec } from "./decimal";
import { DecUtils } from "./dec-utils";
import { Currency } from "@keplr-wallet/types";

export class CoinUtils {
  static createCoinsFromPrimitives(
    coinPrimitives: {
      denom: string;
      amount: string;
    }[]
  ): Coin[] {
    return coinPrimitives.map((primitive) => {
      return new Coin(primitive.denom, primitive.amount);
    });
  }

  static amountOf(coins: Coin[], denom: string): Int {
    const coin = coins.find((coin) => {
      return coin.denom === denom;
    });

    if (!coin) {
      return new Int(0);
    } else {
      return coin.amount;
    }
  }

  static exclude(coins: Coin[], demons: string[]): Coin[] {
    return coins.filter((coin) => {
      return demons.indexOf(coin.denom) === 0;
    });
  }

  static concat(...coins: Coin[]): Coin[] {
    if (coins.length === 0) {
      return [];
    }

    const arr = coins.slice();
    const reducer = (accumulator: Coin[], coin: Coin) => {
      // Find the duplicated denom.
      const find = accumulator.find((c) => c.denom === coin.denom);
      // If duplicated coin exists, add the amount to duplicated one.
      if (find) {
        const newCoin = new Coin(find.denom, find.amount.add(coin.amount));
        accumulator.push(newCoin);
      } else {
        const newCoin = new Coin(coin.denom, coin.amount);
        accumulator.push(newCoin);
      }

      return accumulator;
    };

    return arr.reduce(reducer, []);
  }

  static getCoinFromDecimals(
    currencies: Currency[],
    decAmountStr: string,
    denom: string
  ): Coin {
    const currency = currencies.find((currency) => {
      return currency.coinDenom === denom;
    });
    if (!currency) {
      throw new Error("Invalid currency");
    }

    let precision = new Dec(1);
    for (let i = 0; i < currency.coinDecimals; i++) {
      precision = precision.mul(new Dec(10));
    }

    let decAmount = new Dec(decAmountStr);
    decAmount = decAmount.mul(precision);

    if (!new Dec(decAmount.truncate()).equals(decAmount)) {
      throw new Error("Can't divide anymore");
    }

    return new Coin(currency.coinMinimalDenom, decAmount.truncate());
  }

  static parseDecAndDenomFromCoin(
    currencies: Currency[],
    coin: Coin
  ): { amount: string; denom: string } {
    let currency = currencies.find((currency) => {
      return currency.coinMinimalDenom === coin.denom;
    });
    if (!currency) {
      // If the currency is unknown, just use the raw currency.
      currency = {
        coinDecimals: 0,
        coinDenom: coin.denom,
        coinMinimalDenom: coin.denom,
      };
    }

    let precision = new Dec(1);
    for (let i = 0; i < currency.coinDecimals; i++) {
      precision = precision.mul(new Dec(10));
    }

    const decAmount = new Dec(coin.amount).quoTruncate(precision);
    return {
      amount: decAmount.toString(currency.coinDecimals),
      denom: currency.coinDenom,
    };
  }

  static shrinkDecimals(
    dec: Dec,
    minDecimals: number,
    maxDecimals: number,
    locale: boolean = false
  ): string {
    if (dec.equals(new Dec(0))) {
      return "0";
    }

    const isNeg = dec.isNegative();

    const integer = dec.abs().truncate();
    const fraction = dec.abs().sub(new Dec(integer));

    const decimals = Math.max(
      maxDecimals - integer.toString().length + 1,
      minDecimals
    );

    const fractionStr =
      decimals === 0 ? "" : fraction.toString(decimals).replace("0.", "");

    const integerStr = locale
      ? CoinUtils.integerStringToUSLocaleString(integer.toString())
      : integer.toString();

    return (
      (isNeg ? "-" : "") +
      integerStr +
      (fractionStr.length > 0 ? "." : "") +
      fractionStr
    );
  }

  /**
   * Change the non-locale integer string to locale string.
   * Only support en-US format.
   * This method uses the BigInt if the environment supports the BigInt.
   * @param numberStr
   */
  static integerStringToUSLocaleString(numberStr: string): string {
    if (numberStr.indexOf(".") >= 0) {
      throw new Error(`${numberStr} is not integer`);
    }

    if (typeof BigInt !== "undefined") {
      return BigInt(numberStr).toLocaleString("en-US");
    }

    const integer = numberStr;

    const chunks: string[] = [];
    for (let i = integer.length; i > 0; i -= 3) {
      chunks.push(integer.slice(Math.max(0, i - 3), i));
    }

    return chunks.reverse().join(",");
  }

  static coinToTrimmedString(
    coin: Coin,
    currency: Currency,
    separator: string = " "
  ): string {
    const dec = new Dec(coin.amount).quoTruncate(
      DecUtils.getPrecisionDec(currency.coinDecimals)
    );

    return `${DecUtils.trim(dec)}${separator}${currency.coinDenom}`;
  }
}
