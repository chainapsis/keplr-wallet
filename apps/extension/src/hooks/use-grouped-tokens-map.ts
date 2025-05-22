import { useMemo } from "react";
import { useStore } from "../stores";
import { performSearch } from "./use-search";
import { ViewToken } from "../pages/main";

export function useGroupedTokensMap(search: string) {
  const { hugeQueriesStore, uiConfigStore } = useStore();
  const groupedTokensMap = useMemo(() => {
    if (uiConfigStore.assetViewMode === "grouped") {
      const filteredMap = new Map<string, ViewToken[]>();

      const originalMap = hugeQueriesStore.groupedTokensMap;

      originalMap.forEach((tokens, groupKey) => {
        if (tokens.length > 0) {
          if (uiConfigStore.isHideLowBalance) {
            const { lowBalanceTokens } =
              hugeQueriesStore.filterLowBalanceTokens(tokens);

            if (lowBalanceTokens.length === tokens.length) {
              return;
            }

            const nonLowBalanceTokens = tokens.filter(
              (token) =>
                !lowBalanceTokens.some(
                  (lowToken) =>
                    lowToken.chainInfo.chainId === token.chainInfo.chainId &&
                    lowToken.token.currency.coinMinimalDenom ===
                      token.token.currency.coinMinimalDenom
                )
            );

            filteredMap.set(groupKey, nonLowBalanceTokens);
          } else {
            filteredMap.set(groupKey, tokens);
          }
        }
      });

      return filteredMap;
    }

    return new Map<string, ViewToken[]>();
  }, [
    uiConfigStore.assetViewMode,
    uiConfigStore.isHideLowBalance,
    hugeQueriesStore.groupedTokensMap,
    hugeQueriesStore.filterLowBalanceTokens,
  ]);

  const searchedGroupedTokensMap = useMemo(() => {
    const sortedEntries = performSearch(
      Array.from(groupedTokensMap.entries()),
      search,
      groupedTokensSearchFields
    );

    const resultMap = new Map<string, ViewToken[]>();
    for (const [groupKey, tokens] of sortedEntries) {
      const searchResults = performSearch(tokens, search, tokenSearchFields);

      if (searchResults.length > 0) {
        resultMap.set(groupKey, searchResults);
      }
    }

    return resultMap;
  }, [groupedTokensMap, search]);

  return {
    searchedGroupedTokensMap,
  };
}

const tokenSearchFields = [
  {
    key: "originCurrency.coinDenom",
    function: (item: ViewToken) => {
      const currency = item.token.currency;
      if ("originCurrency" in currency) {
        return currency.originCurrency?.coinDenom || "";
      }
      return currency.coinDenom;
    },
  },
  "chainInfo.chainName",
];

const groupedTokensSearchFields = [
  {
    key: "originCurrency.coinDenom",
    function: (entries: [groupKey: string, tokens: ViewToken[]]) => {
      const currency = entries[1][0].token.currency;
      if ("originCurrency" in currency) {
        return currency.originCurrency?.coinDenom || "";
      }
      return currency.coinDenom;
    },
  },
  {
    key: "chainInfo.chainName",
    function: (entries: [groupKey: string, tokens: ViewToken[]]) => {
      return entries[1][0].chainInfo.chainName;
    },
  },
];
