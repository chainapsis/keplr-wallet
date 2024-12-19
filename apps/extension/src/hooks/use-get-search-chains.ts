import { useEffect, useState, useMemo } from "react";
import { useStore } from "../stores";
import { ChainInfo, ModularChainInfo } from "@keplr-wallet/types";
import { autorun } from "mobx";
import { ChainIdHelper } from "@keplr-wallet/cosmos";

type SearchOption = "all" | "cosmos" | "evm";
type FilterOption = "all" | "chain" | "token" | "chainNameAndToken";

interface UseGetSearchChainsBaseParams {
  search: string;
  searchOption?: SearchOption;
  filterOption?: FilterOption;
  minSearchLength?: number;
}

interface WithInitialChainInfos {
  initialChainInfos: (ChainInfo | ModularChainInfo)[];
  clearResultsOnEmptyQuery?: never;
}

interface WithClearResultsOnEmptyQuery {
  clearResultsOnEmptyQuery: boolean;
  initialChainInfos?: never;
}

type GetSearchChainsParams =
  | (UseGetSearchChainsBaseParams & WithInitialChainInfos)
  | (UseGetSearchChainsBaseParams & WithClearResultsOnEmptyQuery)
  | (UseGetSearchChainsBaseParams & {
      initialChainInfos?: never;
      clearResultsOnEmptyQuery?: never;
    });

/**
 * Returns the searched chain infos and the normalized search term.
 * @returns {Object} { trimSearch: string, searchedChainInfos: ChainInfo[] }
 * @property {string} trimSearch The lowercase trimmed search string.
 * @property {ChainInfo[]} searchedChainInfos The filtered chain information.
 */
export const useGetSearchChains = ({
  search,
  searchOption = "all",
  filterOption = "all",
  initialChainInfos,
  minSearchLength = 0,
  clearResultsOnEmptyQuery,
}: GetSearchChainsParams): {
  trimSearch: string;
  searchedChainInfos: (ChainInfo | ModularChainInfo)[];
} => {
  const { queriesStore, chainStore } = useStore();

  const trimSearch = search.trim().toLowerCase();

  const params = useMemo(() => {
    const p = new URLSearchParams();
    p.set("searchOption", searchOption);
    p.set("filterOption", filterOption);
    p.set("searchText", trimSearch);
    return p;
  }, [searchOption, filterOption, trimSearch]);

  const queryChains =
    trimSearch.length >= minSearchLength
      ? queriesStore.simpleQuery.queryGet<{
          chains: ChainInfo[];
        }>(
          "https://7v6zjsr36fqrqcaeuqbhyrq46a0qndzt.lambda-url.us-west-2.on.aws",
          `/chains?${params.toString()}`
        )
      : null;

  const [searchedChainInfos, setSearchedChainInfos] = useState<
    (ChainInfo | ModularChainInfo)[]
  >([]);

  const disabledChainInfosSearched = useMemo(() => {
    return chainStore.chainInfosInListUI
      .filter(
        (modularChainInfo) =>
          !chainStore.isEnabledChain(modularChainInfo.chainId)
      )
      .filter((chainInfo) => {
        const chainId = chainInfo.chainId.toLowerCase();
        const chainName = chainInfo.chainName.toLowerCase();
        const mainCurrencyDenom =
          chainInfo.currencies[0].coinDenom.toLowerCase();
        const stakeCurrencyDenom =
          chainInfo.stakeCurrency?.coinDenom.toLowerCase();
        const tokenDenom = chainStore.isEvmOnlyChain(chainInfo.chainId)
          ? mainCurrencyDenom
          : stakeCurrencyDenom || mainCurrencyDenom;

        // search text가 eth 또는 eth~ethereum일 경우 evm 체인은 모두 보여준다.
        if (trimSearch.startsWith("eth")) {
          const isEVM = !("bech32Config" in chainInfo);

          if (isEVM) {
            return true;
          }
        }

        switch (filterOption) {
          case "all":
            return (
              chainName.includes(trimSearch) ||
              chainId.includes(trimSearch) ||
              tokenDenom.includes(trimSearch)
            );
          case "chain":
            return (
              chainName.includes(trimSearch) || chainId.includes(trimSearch)
            );
          case "token":
            return tokenDenom.includes(trimSearch);
          case "chainNameAndToken":
            return (
              chainName.includes(trimSearch) || tokenDenom.includes(trimSearch)
            );
          default:
            return false;
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainStore.chainInfosInListUI, filterOption, trimSearch]);

  useEffect(() => {
    const disposer = autorun(() => {
      if (!queryChains) {
        if (initialChainInfos) {
          setSearchedChainInfos(initialChainInfos);
        } else if (clearResultsOnEmptyQuery) {
          setSearchedChainInfos((prev) => (prev.length > 0 ? [] : prev));
        }
        return;
      }
      if (queryChains.isFetching) return;
      if (queryChains.response?.data) {
        const dupCheck = new Set<string>();
        for (const chain of queryChains.response.data.chains) {
          dupCheck.add(ChainIdHelper.parse(chain.chainId).identifier);
        }

        const chains = queryChains.response.data.chains;
        for (const disabledChainInfo of disabledChainInfosSearched) {
          if (
            !dupCheck.has(
              ChainIdHelper.parse(disabledChainInfo.chainId).identifier
            )
          ) {
            chains.push(disabledChainInfo.embedded);
          }
        }

        setSearchedChainInfos(
          chains.sort((a, b) => a.chainName.localeCompare(b.chainName))
        );
      } else {
        setSearchedChainInfos((prev) => (prev.length > 0 ? [] : prev));
      }
    });

    return () => {
      if (disposer) {
        disposer();
      }
    };
  }, [
    clearResultsOnEmptyQuery,
    initialChainInfos,
    queryChains,
    disabledChainInfosSearched,
  ]);

  return {
    trimSearch,
    searchedChainInfos,
  };
};
