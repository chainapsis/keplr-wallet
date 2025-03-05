import { Coin } from "@keplr-wallet/unit";

export interface NobleSwapPool {
  id: number;

  // Address of the Pool.
  address: string;

  // Algorithm of the pool.
  algorithm: string;

  // Pair asset denom in the pool.
  pair: string;

  // Details of the Underlying Pool with the specific custom attributes.
  details: {
    "@type": string;
    protocol_fee_percentage: string;
    rewards_fee: string;
    initial_a: string;
    future_a: string;
    initial_a_time: string;
    future_a_time: string;
    rate_multipliers: Coin[];
    total_shares: string;
    initial_rewards_time: string;
  };

  // Amount of liquidity in the Pool.
  liquidity: Coin[];

  // Amount of protocol fees currently collected.
  protocol_fees: Coin[];

  // Amount of rewards fees currently collected.
  reward_fees: Coin[];
}

export interface NobleSwapRate {
  // Denomination of the base currency.
  denom: string;

  // Denomination of the counter currency.
  vs: string;

  // Exchange rate between the base and counter currency.
  price: string;

  // Algorithm of the underlying Pool used for the calculation.
  algorithm: string;
}

export interface NobleSwapSimulateSwap {
  // The resulting amount of tokens after the swap.
  result: Coin;
  // Details of each individual swap involved in the process.
  swaps: {
    // ID of the pool used in the swap.
    pool_id: number;
    // The input coin for the swap.
    in: Coin;
    // The output coin after the swap.
    out: Coin;
    // Any fees incurred during the swap.
    fees: Coin[];
  }[];
}
