import { Coin } from "@everett-protocol/cosmosjs/common/coin";
import { Int } from "@everett-protocol/cosmosjs/common/int";
import { Dec } from "@everett-protocol/cosmosjs/common/decimal";
import {
  Currency,
  getCurrencyFromDenom,
  getCurrencyFromMinimalDenom
} from "../currency";
import { DecUtils } from "../dec-utils";

export class CoinUtils {
  static amountOf(coins: Coin[], denom: string): Int {
    const coin = coins.find(coin => {
      return coin.denom === denom;
    });

    if (!coin) {
      return new Int(0);
    } else {
      return coin.amount;
    }
  }

  static exclude(coins: Coin[], demons: string[]): Coin[] {
    return coins.filter(coin => {
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
      const find = accumulator.find(c => c.denom === coin.denom);
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

  static getCoinFromDecimals(decAmountStr: string, denom: string): Coin {
    const currency = getCurrencyFromDenom(denom);
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
    coin: Coin
  ): { amount: string; denom: string } {
    const currency = getCurrencyFromMinimalDenom(coin.denom);
    if (!currency) {
      throw new Error("Invalid currency");
    }

    let precision = new Dec(1);
    for (let i = 0; i < currency.coinDecimals; i++) {
      precision = precision.mul(new Dec(10));
    }

    const decAmount = new Dec(coin.amount).quoTruncate(precision);
    return {
      amount: decAmount.toString(currency.coinDecimals),
      denom: currency.coinDenom
    };
  }

  static shrinkDecimals(
    amount: Int,
    baseDecimals: number,
    minDecimals: number,
    maxDecimals: number
  ): string {
    if (amount.equals(new Int(0))) {
      return "0";
    }

    const dec = new Dec(amount, baseDecimals);

    const integer = dec.truncate();
    const fraction = dec.sub(new Dec(integer));

    const decimals = Math.max(
      maxDecimals - integer.toString().length + 1,
      minDecimals
    );

    const fractionStr = fraction.toString(decimals).replace("0.", "");

    // Get dot from locale
    const dot = (1.1).toLocaleString()[1];

    return (
      parseInt(integer.toString()).toLocaleString() +
      (fractionStr.length > 0 ? dot : "") +
      fractionStr
    );
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
