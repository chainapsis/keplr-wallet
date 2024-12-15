import { useEffect, useState, useMemo } from "react";
import { useStore } from "../stores";
import { ChainInfo } from "@keplr-wallet/types";

type SearchOption = "all" | "cosmos" | "evm";
type FilterOption = "all" | "chain" | "token" | "chainNameAndToken";

/**
 * Returns the searched chain infos and the normalized search term.
 * @returns {Object} { trimSearch: string, searchedChainInfos: ChainInfo[] }
 * @property {string} trimSearch The lowercase trimmed search string.
 * @property {ChainInfo[]} searchedChainInfos The filtered chain information.
 */
export const useGetChains = ({
  search,
  searchOption = "all",
  filterOption = "all",
  minSearchLength = 0,
  clearResultsOnEmptySearch = false,
}: {
  search: string;
  searchOption?: SearchOption;
  filterOption?: FilterOption;
  minSearchLength?: number;
  clearResultsOnEmptySearch?: boolean;
}): {
  trimSearch: string;
  searchedChainInfos: ChainInfo[];
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

  const queryChains = useMemo(() => {
    if (trimSearch.length < minSearchLength) {
      return null;
    }
    return queriesStore.simpleQuery.queryGet<{
      chains: ChainInfo[];
    }>(
      "https://7v6zjsr36fqrqcaeuqbhyrq46a0qndzt.lambda-url.us-west-2.on.aws",
      `/chains?${params.toString()}`
    );
  }, [queriesStore.simpleQuery, params, trimSearch, minSearchLength]);

  const [searchedChainInfos, setSearchedChainInfos] = useState<ChainInfo[]>([]);

  useEffect(() => {
    if (!queryChains) {
      if (clearResultsOnEmptySearch) {
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
  }, [
    clearResultsOnEmptySearch,
    queryChains,
    queryChains?.isFetching,
    queryChains?.response?.data,
  ]);

  return {
    trimSearch,
    searchedChainInfos,
  };
};
