import { useMemo } from "react";
import { useStore } from "../stores";
import { PricePretty } from "@keplr-wallet/unit";
import { ChainIdHelper } from "@keplr-wallet/cosmos";

export function useSpendablePrice() {
  const { hugeQueriesStore, uiConfigStore, keyRingStore } = useStore();

  const disabledViewAssetTokenMap =
    uiConfigStore.manageViewAssetTokenConfig.getViewAssetTokenMapByVaultId(
      keyRingStore.selectedKeyInfo?.id ?? ""
    );

  const spendableTotalPrice = useMemo(() => {
    let result: PricePretty | undefined;
    for (const bal of hugeQueriesStore.allKnownBalances) {
      const disabledCoinSet = disabledViewAssetTokenMap.get(
        ChainIdHelper.parse(bal.chainInfo.chainId).identifier
      );

      if (
        bal.price &&
        !disabledCoinSet?.has(bal.token.currency.coinMinimalDenom)
      ) {
        if (!result) {
          result = bal.price;
        } else {
          result = result.add(bal.price);
        }
      }
    }
    return result;
  }, [hugeQueriesStore.allKnownBalances, disabledViewAssetTokenMap]);

  return {
    spendableTotalPrice,
  };
}
