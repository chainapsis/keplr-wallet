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
}
