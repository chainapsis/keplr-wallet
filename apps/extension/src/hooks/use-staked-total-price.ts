import { useMemo } from "react";
import { useStore } from "../stores";
import { PricePretty } from "@keplr-wallet/unit";
import { ChainInfoWithCoreTypes } from "@keplr-wallet/background";

export function useStakedTotalPrice() {
  const { hugeQueriesStore, priceStore } = useStore();

  const stakedTotalPrice = useMemo(() => {
    let result: PricePretty | undefined;
    for (const bal of hugeQueriesStore.delegations) {
      if (bal.price) {
        if (!result) {
          result = bal.price;
        } else {
          result = result.add(bal.price);
        }
      }
    }
    for (const bal of hugeQueriesStore.unbondings) {
      if (bal.price) {
        if (!result) {
          result = bal.price;
        } else {
          result = result.add(bal.price);
        }
      }
    }
    return result;
  }, [hugeQueriesStore.delegations, hugeQueriesStore.unbondings]);

  const stakedTotalPriceEmbedOnlyUSD = useMemo(() => {
    let result: PricePretty | undefined;
    for (const bal of hugeQueriesStore.delegations) {
      if (!("currencies" in bal.chainInfo)) {
        continue;
      }
      if (!(bal.chainInfo.embedded as ChainInfoWithCoreTypes).embedded) {
        continue;
      }
      if (bal.price) {
        const price = priceStore.calculatePrice(bal.token, "usd");
        if (price) {
          if (!result) {
            result = price;
          } else {
            result = result.add(price);
          }
        }
      }
    }
    for (const bal of hugeQueriesStore.unbondings) {
      if (!("currencies" in bal.chainInfo)) {
        continue;
      }
      if (!(bal.chainInfo.embedded as ChainInfoWithCoreTypes).embedded) {
        continue;
      }
      if (bal.price) {
        const price = priceStore.calculatePrice(bal.token, "usd");
        if (price) {
          if (!result) {
            result = price;
          } else {
            result = result.add(price);
          }
        }
      }
    }
    return result;
  }, [hugeQueriesStore.delegations, hugeQueriesStore.unbondings, priceStore]);

  return {
    stakedTotalPrice,
    stakedTotalPriceEmbedOnlyUSD,
  };
}
