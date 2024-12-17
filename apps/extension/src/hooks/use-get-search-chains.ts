import { useEffect, useState, useMemo } from "react";
import { useStore } from "../stores";
import { ChainInfo, ModularChainInfo } from "@keplr-wallet/types";
import { autorun } from "mobx";

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
  const { queriesStore } = useStore();

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
        setSearchedChainInfos(queryChains.response.data.chains);
      } else {
        setSearchedChainInfos((prev) => (prev.length > 0 ? [] : prev));
      }
    });

    return () => {
      if (disposer) {
        disposer();
      }
    };
  }, [clearResultsOnEmptyQuery, initialChainInfos, queryChains]);

  return {
    trimSearch,
    searchedChainInfos,
  };
};
