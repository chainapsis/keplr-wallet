import { CoinPretty } from "@keplr-wallet/unit";
import { useEffect, useRef } from "react";
import { ViewToken } from "../../main";
import { validateIsUsdcFromNoble } from "../utils";
import { useStore } from "../../../stores";
import { NOBLE_CHAIN_ID } from "../../../config.ui";

export function useEarnBottomTag(balances: ViewToken[]) {
  const topUsdcFound = useRef("");
  const usdnAsset = useRef<CoinPretty | null>(null);

  const { priceStore } = useStore();

  useEffect(() => {
    topUsdcFound.current = "";
    usdnAsset.current = null;
  }, [balances]);

  function getBottomTagInfoProps(
    { token, chainInfo }: ViewToken,
    key: string
  ): {
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

    if (usdnAsset.current === null) {
      usdnAsset.current =
        balances.find(
          ({ token, chainInfo }) =>
            chainInfo.chainId === NOBLE_CHAIN_ID &&
            token.currency.coinMinimalDenom === "uusdn"
        )?.token ?? null;
    }

    const isUsdcOnTop =
      isUsdcFromNoble &&
      (!topUsdcFound.current || topUsdcFound.current === key);

    if (isUsdcOnTop) {
      topUsdcFound.current = key;
      if (token.toDec().isZero()) {
        return {};
      }
    }

    if (!usdnAsset.current) {
      return {
        bottomTagType: "nudgeEarn",
      };
    }

    const earnedAssetPrice = priceStore
      .calculatePrice(usdnAsset.current)
      ?.toString();

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
