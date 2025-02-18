import { CoinPretty } from "@keplr-wallet/unit";
import { useRef } from "react";
import { ViewToken } from "../..";
import { validateIsUsdcFromNoble } from "../../../earn/utils";
import { useStore } from "../../../../stores";

export function useEarnBottomTag(balances: ViewToken[]) {
  const topUsdcFound = useRef("");
  const usdnAsset = useRef<CoinPretty | null>(null);

  const { priceStore } = useStore();

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

    if (!isUsdcFromNoble) {
      return {};
    }

    usdnAsset.current =
      usdnAsset.current ??
      balances.find(({ token }) => token.currency.coinMinimalDenom === "uusdn")
        ?.token ??
      null;

    if (!usdnAsset.current) {
      return {
        bottomTagType: "nudgeEarn",
      };
    }

    if (!topUsdcFound.current || topUsdcFound.current === key) {
      topUsdcFound.current = key;

      return {
        bottomTagType: "showEarnSavings",
        earnedAssetPrice: priceStore
          .calculatePrice(usdnAsset.current)
          ?.toString(),
      };
    }

    return {};
  }

  return {
    getBottomTagInfoProps,
  };
}
