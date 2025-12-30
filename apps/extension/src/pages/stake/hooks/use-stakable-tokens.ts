import { useMemo } from "react";
import { useStore } from "../../../stores";
import { useKcrStakingUrls } from "./use-kcr-staking-urls";
import { Dec } from "@keplr-wallet/unit";
import { ViewToken } from "../../main";

const zeroDec = new Dec(0);

export const useStakableTokens = () => {
  const { chainStore, hugeQueriesStore, priceStore } = useStore();
  const { getKcrStakingUrl, hasKcrStakingUrl } = useKcrStakingUrls();

  const stakableTokens = useMemo(() => {
    return hugeQueriesStore.stakables
      .filter((token) => {
        if (!token.token.toDec().gt(zeroDec)) {
          return false;
        }
        if ("starknet" in token.chainInfo) {
          return true;
        }
        if ("bitcoin" in token.chainInfo) {
          return false;
        }
        const chainInfo = chainStore.getChain(token.chainInfo.chainId);
        const hasNativeUrl =
          !!chainInfo.embedded.embedded &&
          !!chainInfo.embedded.walletUrlForStaking;
        return hasNativeUrl || hasKcrStakingUrl(token.chainInfo.chainId);
      })
      .sort((a, b) => {
        const aPrice = priceStore.calculatePrice(a.token)?.toDec() ?? zeroDec;
        const bPrice = priceStore.calculatePrice(b.token)?.toDec() ?? zeroDec;

        if (aPrice.equals(bPrice)) {
          return 0;
        }
        return aPrice.gt(bPrice) ? -1 : 1;
      });
  }, [chainStore, hugeQueriesStore.stakables, priceStore, hasKcrStakingUrl]);

  const getStakingUrl = (viewToken: ViewToken): string | undefined => {
    if ("starknet" in viewToken.chainInfo) {
      return "https://dashboard.endur.fi/stake";
    }
    const chainInfo = chainStore.getChain(viewToken.chainInfo.chainId);
    return (
      chainInfo.embedded.walletUrlForStaking ||
      getKcrStakingUrl(viewToken.chainInfo.chainId)
    );
  };

  return {
    stakableTokens,
    getStakingUrl,
  };
};
