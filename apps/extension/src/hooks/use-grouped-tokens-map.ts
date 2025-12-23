import { useMemo } from "react";
import { useStore } from "../stores";
import { performSearch, performSearchWithScore } from "./use-search";
import { CoinPretty } from "@keplr-wallet/unit";
import { sortByPrice, sortTokenGroups } from "../utils/token-sort";
import { ViewToken } from "../pages/main";

export function useGroupedTokensMap(search: string) {
  const { hugeQueriesStore, uiConfigStore } = useStore();
  const groupedTokensMap: typeof hugeQueriesStore.groupedTokensMap =
    useMemo(() => {
      if (uiConfigStore.assetViewMode === "grouped") {
        const filteredMap: typeof hugeQueriesStore.groupedTokensMap = new Map();
        const originalMap = hugeQueriesStore.groupedTokensMap;

        originalMap.forEach((tokens, groupKey) => {
          if (tokens.length > 0) {
            if (uiConfigStore.isHideLowBalance) {
              const { lowBalanceTokens } =
                hugeQueriesStore.filterLowBalanceTokens(tokens);

              if (lowBalanceTokens.length === tokens.length) {
                return;
              }

              const map = new Map<string, boolean>();
              for (const token of lowBalanceTokens) {
                map.set(
                  `${token.chainInfo.chainId}/${token.token.currency.coinMinimalDenom}`,
                  true
                );
              }

              const nonLowBalanceTokens = tokens.filter(
                (token) =>
                  !map.get(
                    `${token.chainInfo.chainId}/${token.token.currency.coinMinimalDenom}`
                  )
              );

              filteredMap.set(groupKey, nonLowBalanceTokens);
            } else {
              filteredMap.set(groupKey, tokens);
            }
          }
        });

        const isAllLowBalanceTokens = filteredMap.size === 0;
        if (isAllLowBalanceTokens) {
          return originalMap;
        }

        return filteredMap;
      }

      return new Map();

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
      uiConfigStore.assetViewMode,
      uiConfigStore.isHideLowBalance,
      hugeQueriesStore.groupedTokensMap,
      hugeQueriesStore.filterLowBalanceTokens,
    ]);

  const searchedGroupedTokensMap = useMemo(() => {
    const searchedWithScores = performSearchWithScore(
      Array.from(groupedTokensMap.entries()),
      search,
      groupedTokensSearchFields
    );

    const entriesWithScores = [];

    for (const {
      item: [groupKey, tokens],
      score,
    } of searchedWithScores) {
      const searchResults = performSearch(
        tokens,
        search,
        tokenSearchFields,
        sortByPrice
      );
      if (searchResults.length > 0) {
        entriesWithScores.push({ groupKey, tokens: searchResults, score });
      }
    }

    entriesWithScores.sort((a, b) => {
      if (a.score !== b.score) {
        return b.score - a.score;
      }
      return sortTokenGroups(a.tokens, b.tokens);
    });

    return new Map(
      entriesWithScores.map(({ groupKey, tokens }) => [groupKey, tokens])
    );
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
        return CoinPretty.makeCoinDenomPretty(
          currency.originCurrency?.coinDenom || ""
        );
      }
      return CoinPretty.makeCoinDenomPretty(currency.coinDenom);
    },
  },
  "chainInfo.chainName",
];

const groupedTokensSearchFields = [
  {
    key: "originCurrency.coinDenom[]",
    function: (entries: [groupKey: string, tokens: ViewToken[]]) => {
      return entries[1].map((token) => {
        const currency = token.token.currency;
        if ("originCurrency" in currency) {
          return CoinPretty.makeCoinDenomPretty(
            currency.originCurrency?.coinDenom || ""
          );
        }
        return CoinPretty.makeCoinDenomPretty(currency.coinDenom);
      });
    },
  },
  {
    key: "chainInfo.chainName[]",
    function: (entries: [string, { chainInfo: { chainName: string } }[]]) => {
      return entries[1].map((token) => {
        return token.chainInfo.chainName;
      });
    },
  },
];
