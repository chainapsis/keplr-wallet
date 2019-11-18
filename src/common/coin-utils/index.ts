import { Coin } from "@everett-protocol/cosmosjs/common/coin";
import { Int } from "@everett-protocol/cosmosjs/common/int";

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

  static shrinkDecimals(
    amount: Int,
    baseDecimals: number,
    minDecimals: number,
    maxDecimals: number
  ): string {
    const decimalPoint = new Int(
      "1" +
        Array.from(new Array(baseDecimals))
          .map(() => "0")
          .join("")
    );

    const integerPart = amount.div(decimalPoint);
    const integerPartStr = integerPart.toString();
    let fractionalPart = amount.mod(decimalPoint);
    let fractionalPartStr = fractionalPart.toString();
    fractionalPartStr =
      Array.from(new Array(baseDecimals - fractionalPartStr.length))
        .map(() => "0")
        .join("") + fractionalPartStr;

    if (fractionalPartStr.length > maxDecimals) {
      fractionalPartStr = fractionalPartStr.substring(
        0,
        fractionalPartStr.length - (fractionalPartStr.length - maxDecimals)
      );
      fractionalPart = new Int(fractionalPartStr);
    }

    if (integerPartStr.length > 1) {
      let deletionLen = integerPartStr.length - 1;
      if (deletionLen > fractionalPartStr.length - minDecimals) {
        deletionLen = fractionalPartStr.length - minDecimals;
      }
      fractionalPartStr = fractionalPartStr.substring(
        0,
        fractionalPartStr.length - deletionLen
      );
      fractionalPart = new Int(fractionalPartStr);
    }

    if (fractionalPart.equals(new Int(0)) && integerPart.equals(new Int(0))) {
      return "0";
    }

    if (fractionalPartStr.length > 0) {
      return integerPartStr + "." + fractionalPartStr;
    } else {
      return integerPartStr;
    }
  }
}
