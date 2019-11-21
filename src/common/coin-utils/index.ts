import { Coin } from "@everett-protocol/cosmosjs/common/coin";
import { Int } from "@everett-protocol/cosmosjs/common/int";
import { Dec } from "@everett-protocol/cosmosjs/common/decimal";

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

    return (
      integer.toString() + (fractionStr.length > 0 ? "." : "") + fractionStr
    );
  }
}
