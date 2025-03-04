import { useEffect, useState, useMemo, useRef } from "react";
import { useStore } from "../stores";
import { ChainInfo, ModularChainInfo } from "@keplr-wallet/types";
import { autorun } from "mobx";
import { ChainIdHelper } from "@keplr-wallet/cosmos";
import SimpleBarCore from "simplebar-core";

interface UseGetAllChainParams {
  pageSize?: number;
  initialPage?: number;
  search?: string;
  excludeChainIdentifiers?: string[];
}

interface UseGetAllChainResult {
  chains: (ChainInfo | ModularChainInfo)[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  setPage: (page: number) => void;
  isLoading: boolean;
  error: Error | null;
  simpleBarRef: React.MutableRefObject<SimpleBarCore | null>;
}

/**
 * 모든 체인 정보를 가져오고 페이지네이션과 검색 기능을 제공하는 훅
 * @param params 페이지 크기, 초기 페이지 번호, 검색어,  제외할 체인 identifier 리스트를 받습니다
 * @returns 체인 목록과 페이지네이션 관련 정보를 반환합니다
 */
export const useGetAllChain = ({
  pageSize = 20,
  initialPage = 1,
  search = "",
  excludeChainIdentifiers = [],
}: UseGetAllChainParams = {}): UseGetAllChainResult => {
  const { queriesStore } = useStore();
  const [chains, setChains] = useState<(ChainInfo | ModularChainInfo)[]>([]);
  const [filteredChains, setFilteredChains] = useState<
    (ChainInfo | ModularChainInfo)[]
  >([]);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const simpleBarRef = useRef<SimpleBarCore>(null);

  const queryChains = queriesStore.simpleQuery.queryGet<{
    chains: ChainInfo[];
  }>(
    "https://7v6zjsr36fqrqcaeuqbhyrq46a0qndzt.lambda-url.us-west-2.on.aws",
    `/chains`
  );

  // 체인 데이터 가져오기
  useEffect(() => {
    const disposer = autorun(() => {
      if (!queryChains) return;
      if (queryChains.isFetching) {
        setIsLoading(true);
        return;
      }

      if (queryChains.response?.data) {
        const allChains = queryChains.response.data.chains;
        const filteredChains = allChains.filter((chain) => {
          const chainIdentifier = ChainIdHelper.parse(chain.chainId).identifier;
          return !excludeChainIdentifiers.includes(chainIdentifier);
        });

        setChains(filteredChains);
        setIsLoading(false);
      } else {
        setError(
          queryChains.error?.message
            ? new Error(queryChains.error.message)
            : new Error("Failed to fetch chains")
        );
        setIsLoading(false);
      }
    });

    return () => {
      if (disposer) {
        disposer();
      }
    };
  }, [queryChains, excludeChainIdentifiers]);

  useEffect(() => {
    if (!search.trim()) {
      setFilteredChains(chains);
      return;
    }

    const searchTerm = search.toLowerCase().trim();
    const filtered = chains.filter((chain) => {
      const chainName = chain.chainName.toLowerCase();
      return chainName.includes(searchTerm);
    });

    setFilteredChains(filtered);
    setCurrentPage(1);
  }, [chains, search]);

  // 무한 스크롤 처리
  useEffect(() => {
    if (simpleBarRef.current) {
      const scrollElement = simpleBarRef.current.getScrollElement();
      if (scrollElement) {
        const onScroll = () => {
          const simpleBar = simpleBarRef.current?.getContentElement();
          const scrollEl = simpleBarRef.current?.getScrollElement();
          if (simpleBar && scrollEl) {
            const rect = simpleBar.getBoundingClientRect();
            const scrollRect = scrollEl.getBoundingClientRect();

            const remainingBottomY =
              rect.y + rect.height - scrollRect.y - scrollRect.height;

            if (remainingBottomY < scrollRect.height / 5) {
              setCurrentPage((prev) => prev + 1);
            }
          }
        };

        scrollElement.addEventListener("scroll", onScroll);

        return () => {
          scrollElement.removeEventListener("scroll", onScroll);
        };
      }
    }
  }, []);

  const currentPageChains = useMemo(() => {
    const startIndex = 0;
    const endIndex = currentPage * pageSize;
    return filteredChains.slice(startIndex, endIndex);
  }, [filteredChains, currentPage, pageSize]);

  return {
    chains: currentPageChains,
    totalCount: filteredChains.length,
    currentPage,
    totalPages: Math.ceil(filteredChains.length / pageSize),
    setPage: setCurrentPage,
    isLoading,
    error,
    simpleBarRef,
  };
};
