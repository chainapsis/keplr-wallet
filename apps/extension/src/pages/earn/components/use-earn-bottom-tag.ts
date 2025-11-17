import { useMemo } from "react";
import { ViewToken } from "../../main";
import { validateIsUsdcFromNoble } from "../utils";
import { useStore } from "../../../stores";
import { NOBLE_CHAIN_ID } from "../../../config.ui";

export function useEarnBottomTag(balances: ViewToken[]) {
  const { priceStore, accountStore, queriesStore, chainStore } = useStore();

  const topUsdcToken = useMemo(() => {
    return (
      balances.find((viewToken) =>
        validateIsUsdcFromNoble(
          viewToken.token.currency,
          viewToken.chainInfo.chainId
        )
      ) ?? null
    );
  }, [balances]);

  const nobleAccount = accountStore.getAccount(NOBLE_CHAIN_ID);
  const queries = queriesStore.get(NOBLE_CHAIN_ID);
  const chainInfo = chainStore.getModularChain(NOBLE_CHAIN_ID);
  if (!("cosmos" in chainInfo)) {
    throw new Error("cosmos module is not supported on this chain");
  }

  const usdnAsset = (() => {
    if (!nobleAccount?.bech32Address) {
      return undefined;
    }

    const queryBalances = queries.queryBalances.getQueryBech32Address(
      nobleAccount.bech32Address
    );

    const usdnCurrency = chainInfo.cosmos.currencies.find(
      (currency) => currency.coinMinimalDenom === "uusdn"
    );

    if (!usdnCurrency) {
      return undefined;
    }

    return queryBalances.getBalance(usdnCurrency)?.balance;
  })();

  function getBottomTagInfoProps({ token, chainInfo }: ViewToken): {
    bottomTagType?: "nudgeEarn" | "showEarnSavings";
    earnedAssetPrice?: string;
  } {
    const isUsdcFromNoble = validateIsUsdcFromNoble(
      token.currency,
      chainInfo.chainId
    );

    const isUsdn =
      chainInfo.chainId === NOBLE_CHAIN_ID &&
      token.currency.coinMinimalDenom === "uusdn";

    if (!isUsdcFromNoble && !isUsdn) {
      return {};
    }

    const isUsdcOnTop =
      token.currency.coinMinimalDenom ===
        topUsdcToken?.token.currency.coinMinimalDenom &&
      chainInfo.chainId === topUsdcToken?.chainInfo.chainId;

    if (isUsdcOnTop) {
      if (token.toDec().isZero()) {
        return {};
      }
    }

    if (!usdnAsset) {
      return {
        bottomTagType: "nudgeEarn",
      };
    }

    const earnedAssetPrice = priceStore.calculatePrice(usdnAsset)?.toString();

    if (isUsdcOnTop || isUsdn) {
      return {
        bottomTagType: "showEarnSavings",
        earnedAssetPrice,
      };
    }

    return {};
  }

  return {
    getBottomTagInfoProps,
  };
}
