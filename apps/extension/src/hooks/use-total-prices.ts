import { useMemo } from "react";
import { useSpendablePrice } from "./use-spendable-total-price";
import { useStakedTotalPrice } from "./use-staked-total-price";

export function useTotalPrices() {
  const { spendableTotalPrice } = useSpendablePrice();
  const { stakedTotalPrice, stakedTotalPriceEmbedOnlyUSD } =
    useStakedTotalPrice();

  const totalPrice = useMemo(() => {
    if (!spendableTotalPrice) {
      return spendableTotalPrice;
    }

    if (!stakedTotalPrice) {
      return stakedTotalPrice;
    }

    return spendableTotalPrice.add(stakedTotalPrice);
  }, [spendableTotalPrice, stakedTotalPrice]);

  return {
    spendableTotalPrice,
    stakedTotalPrice,
    stakedTotalPriceEmbedOnlyUSD,
    totalPrice,
  };
}
