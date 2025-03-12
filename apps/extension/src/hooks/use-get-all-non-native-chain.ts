import { useEffect, useState, useMemo } from "react";
import { useStore } from "../stores";
import { ChainInfo } from "@keplr-wallet/types";
import { autorun } from "mobx";
import { ChainIdHelper } from "@keplr-wallet/cosmos";
import { KeyRingCosmosService } from "@keplr-wallet/background";

interface UseGetAllChainParams {
  pageSize?: number;
  initialPage?: number;
  search?: string;
  fallbackEthereumLedgerApp?: boolean;
  fallbackStarknetLedgerApp?: boolean;
  keyType?: string;
}

interface UseGetAllChainResult {
  chains: ChainInfo[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  setPage: (page: number) => void;
  isLoading: boolean;
  error: Error | null;
  infiniteScrollTriggerRef: React.Dispatch<
    React.SetStateAction<Element | null>
  >;
}

/**
 * 모든 체인 정보를 가져오고 페이지네이션과 검색 기능을 제공하는 훅
 * @param params 페이지 크기, 초기 페이지 번호, 검색어,  제외할 체인 identifier 리스트를 받습니다
 * @returns 체인 목록과 페이지네이션 관련 정보를 반환합니다
 */
export const useGetAllNonNativeChain = ({
  pageSize = 20,
  initialPage = 1,
  search = "",
  fallbackEthereumLedgerApp,
  fallbackStarknetLedgerApp,
  keyType,
}: UseGetAllChainParams = {}): UseGetAllChainResult => {
  const { queriesStore, chainStore } = useStore();
  const modularChainInfosInListUI = chainStore.modularChainInfosInListUI;
  const excludeChainIdentifiers = useMemo(
    () =>
      modularChainInfosInListUI.map(
        (chain) => ChainIdHelper.parse(chain.chainId).identifier
      ),
    [modularChainInfosInListUI]
  );

  //구조가 이상하지만 chains 최초 데이터 저장
  // ledgerFilteredChains는 type과 fallbackEthereumLedgerApp값등이 변경될때만 필터링하게 적용하고
  // filteredChains는 search가 변경될때만 검색하게 적용하도록 하기위해서 3개의 상태로 분리함
  const [chains, setChains] = useState<ChainInfo[]>([]);
  const [ledgerFilteredChains, setLedgerFilteredChains] = useState<ChainInfo[]>(
    []
  );
  const [filteredChains, setFilteredChains] = useState<ChainInfo[]>([]);

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [ref, setRef] = useState<Element | null>(null);

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

  //ledger의 경우 필터링을 해야함
  useEffect(() => {
    if (fallbackEthereumLedgerApp && keyType === "ledger") {
      const filteredChains = chains.filter((modularChainInfo) => {
        const isEthermintLike =
          modularChainInfo.bip44.coinType === 60 ||
          !!modularChainInfo.features?.includes("eth-address-gen") ||
          !!modularChainInfo.features?.includes("eth-key-sign");

        const isLedgerSupported = (() => {
          try {
            KeyRingCosmosService.throwErrorIfEthermintWithLedgerButNotSupported(
              modularChainInfo.chainId
            );
            return true;
          } catch {
            return false;
          }
        })();

        if (isEthermintLike && isLedgerSupported) {
          return true;
        }

        return false;
      });

      setLedgerFilteredChains(filteredChains);
      return;
    }

    if (fallbackStarknetLedgerApp && keyType === "ledger") {
      setLedgerFilteredChains([]);
      return;
    }

    setLedgerFilteredChains(chains);
  }, [chains, fallbackEthereumLedgerApp, fallbackStarknetLedgerApp, keyType]);

  useEffect(() => {
    if (!search.trim()) {
      setFilteredChains(ledgerFilteredChains);
      return;
    }

    const searchTerm = search.toLowerCase().trim();
    const filtered = ledgerFilteredChains.filter((chain) => {
      const chainName = chain.chainName.toLowerCase();
      return chainName.includes(searchTerm);
    });

    setFilteredChains(filtered);
    setCurrentPage(1);
  }, [ledgerFilteredChains, search]);

  // 무한 스크롤 처리
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !isLoading) {
          setCurrentPage((prev) => prev + 1);
        }
      },
      {
        threshold: 0.01,
      }
    );

    const triggerElement = ref;
    if (triggerElement) {
      observer.observe(triggerElement);
    }

    return () => {
      if (triggerElement) {
        observer.unobserve(triggerElement);
      }
    };
  }, [isLoading, ref]);

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
    infiniteScrollTriggerRef: setRef,
  };
};
