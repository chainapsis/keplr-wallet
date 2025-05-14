import { observer } from "mobx-react-lite";
import React, {
  FunctionComponent,
  useCallback,
  useMemo,
  useState,
} from "react";
import { BackButton } from "../../../layouts/header/components";
import { HeaderLayout } from "../../../layouts/header";
import styled from "styled-components";
import { Stack } from "../../../components/stack";
import { SearchTextInput } from "../../../components/input";
import { useStore } from "../../../stores";
import { TokenItem } from "../../main/components";
import { CoinPretty, Dec } from "@keplr-wallet/unit";
import { useFocusOnMount } from "../../../hooks/use-focus-on-mount";
import { useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router";
import { useIntl } from "react-intl";
import { HugeQueriesStore } from "../../../stores/huge-queries";
import { ViewToken } from "../../main";
import { autorun, computed, IReactionDisposer, makeObservable } from "mobx";
import { ObservableQueryIbcSwap } from "@keplr-wallet/stores-internal";
import { ChainInfo, Currency } from "@keplr-wallet/types";
import { IChainInfoImpl } from "@keplr-wallet/stores";
import { FixedSizeList } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import { useSearch } from "../../../hooks/use-search";
import { getTokenSearchResultClickAnalyticsProperties } from "../../../analytics-amplitude";
import { useGroupedTokensMap } from "../../../hooks/use-grouped-tokens-map";
import { GroupedTokenItem } from "../../main/components/token/grouped";
import { YAxis } from "../../../components/axis";
import { DenomHelper } from "@keplr-wallet/common";
import { SwapNotAvailableModal } from "../components/swap-not-available-modal";
import { MsgItemSkeleton } from "../../main/token-detail/msg-items/skeleton";

// 계산이 복잡해서 memoize을 적용해야하는데
// mobx와 useMemo()는 같이 사용이 어려워서
// 그냥 일단 computed를 쓰기 위해서 따로 뺌
class IBCSwapDestinationState {
  constructor(
    protected readonly hugeQueriesStore: HugeQueriesStore,
    protected readonly queryIBCSwap: ObservableQueryIbcSwap
  ) {
    makeObservable(this);
  }

  // ibc swap destination인 currency 중에서 현재 가지고 있는 자산은 기존처럼 보여준다.
  // 현재 가지고 있지 않은 자산도 유저가 선택할 수 있도록 UI 상 후순위로 둔채로 balance 등을 보여주지 않은채 선택은 할 수 있도록 보여준다.
  @computed
  get tokens(): {
    tokens: ReadonlyArray<ViewToken>;
    remaining: {
      currency: Currency;
      chainInfo: IChainInfoImpl;
    }[];
    isLoading: boolean;
  } {
    const zeroDec = new Dec(0);

    const destinationMap = this.queryIBCSwap.swapDestinationCurrenciesMap;

    // Swap destination은 ibc currency는 보여주지 않는다.
    let tokens = this.hugeQueriesStore.getAllBalances({
      allowIBCToken: false,
      enableFilterDisabledAssetToken: false,
    });
    let remaining: {
      currency: Currency;
      chainInfo: IChainInfoImpl;
    }[] = [];

    tokens = tokens
      .filter((token) => {
        return token.token.toDec().gt(zeroDec);
      })
      .filter((token) => {
        if (!("currencies" in token.chainInfo)) {
          return false;
        }

        const map = destinationMap.get(token.chainInfo.chainIdentifier);
        if (map) {
          return (
            map.currencies.find(
              (cur) =>
                cur.coinMinimalDenom === token.token.currency.coinMinimalDenom
            ) != null
          );
        }

        return false;
      });

    // tokens에 존재했는지 체크 용으로 사용
    // key: {chain_identifier}/{coinMinimalDenom}
    const tokensKeyMap = new Map<string, boolean>();

    for (const token of tokens) {
      if ("currencies" in token.chainInfo) {
        tokensKeyMap.set(
          `${token.chainInfo.chainIdentifier}/${token.token.currency.coinMinimalDenom}`,
          true
        );
      }
    }

    for (const [chainIdentifier, map] of destinationMap) {
      for (const currency of map.currencies) {
        if (
          !tokensKeyMap.has(`${chainIdentifier}/${currency.coinMinimalDenom}`)
        ) {
          remaining.push({
            currency,
            chainInfo: map.chainInfo,
          });
        }
      }
    }

    remaining = remaining.sort((a, b) => {
      if (a.currency.coinDenom < b.currency.coinDenom) {
        return -1;
      } else if (a.currency.coinDenom > b.currency.coinDenom) {
        return 1;
      } else {
        return 0;
      }
    });

    return {
      tokens,
      remaining,
      isLoading: this.queryIBCSwap.isLoadingSwapDestinationCurrenciesMap,
    };
  }
}

const Styles = {
  Container: styled(Stack)`
    height: 100%;
    padding: 0.75rem;
  `,
};

const searchFields = [
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

const remainingSearchFields = [
  {
    key: "currency.coinDenom",
    function: (item: { currency: Currency; chainInfo: IChainInfoImpl }) => {
      return item.currency.coinDenom;
    },
  },
  "chainInfo.chainName",
];

// /send/select-asset와 기본 로직은 거의 유사한데...
// 뷰 쪽이 생각보다 이질적이라서 그냥 분리 시킴...
// /send/select-asset 페이지와 세트로 관리하셈
export const IBCSwapDestinationSelectAssetPage: FunctionComponent = observer(
  () => {
    const {
      hugeQueriesStore,
      skipQueriesStore,
      analyticsAmplitudeStore,
      uiConfigStore,
      chainStore,
    } = useStore();
    const navigate = useNavigate();
    const intl = useIntl();
    const [searchParams] = useSearchParams();

    /*
    navigate(
      `/send/select-asset?isIBCTransfer=true&navigateTo=${encodeURIComponent(
        "/ibc-transfer?chainId={chainId}&coinMinimalDenom={coinMinimalDenom}"
      )}`
    );
    같은 형태로 써야함...
   */
    const paramNavigateTo = searchParams.get("navigateTo");
    const paramNavigateReplace = searchParams.get("navigateReplace");
    // {chain_identifier}/{coinMinimalDenom}
    const excludeKey = searchParams.get("excludeKey");

    const [search, setSearch] = useState("");

    const searchRef = useFocusOnMount<HTMLInputElement>();

    const [state] = useState(
      () =>
        new IBCSwapDestinationState(
          hugeQueriesStore,
          skipQueriesStore.queryIBCSwap
        )
    );

    const { tokens, remaining, isLoading } = state.tokens;

    const filterTokens = useCallback(
      (token: ViewToken) => {
        if (!("currencies" in token.chainInfo)) {
          return false;
        }

        const denomHelper = new DenomHelper(
          token.token.currency.coinMinimalDenom
        );
        if (denomHelper.type === "lp") {
          return false;
        }

        return (
          !excludeKey ||
          `${token.chainInfo.chainIdentifier}/${token.token.currency.coinMinimalDenom}` !==
            excludeKey
        );
      },
      [excludeKey]
    );

    const filterRemaining = useCallback(
      (r: { currency: Currency; chainInfo: IChainInfoImpl }) => {
        {
          const denomHelper = new DenomHelper(r.currency.coinMinimalDenom);
          if (denomHelper.type === "lp") {
            return false;
          }

          return (
            !excludeKey ||
            `${r.chainInfo.chainIdentifier}/${r.currency.coinMinimalDenom}` !==
              excludeKey
          );
        }
      },
      [excludeKey]
    );

    const filteredTokens = useMemo(() => {
      const filtered = tokens.filter(filterTokens);

      return filtered;
    }, [tokens, filterTokens]);

    const filteredRemaining = useMemo(() => {
      const filtered = remaining.filter(filterRemaining);

      return filtered;
    }, [remaining, filterRemaining]);

    const searchedTokens = useSearch(filteredTokens, search, searchFields);
    const searchedRemaining = useSearch(
      filteredRemaining,
      search,
      remainingSearchFields
    );

    const { searchedGroupedTokensMap } = useGroupedTokensMap(search);
    const filteredGroupedTokensMap = useMemo(() => {
      return new Map(
        Array.from(searchedGroupedTokensMap.entries())
          .map<[string, ViewToken[]]>(([groupKey, tokens]) => {
            const filteredTokens = tokens.filter(filterTokens);

            return [groupKey, filteredTokens];
          })
          .filter(([, tokens]) => tokens.length > 0)
      );
    }, [searchedGroupedTokensMap, filterTokens]);

    const filteredRemainingGroupedTokensMap = useMemo(() => {
      return new Map(
        Array.from(filteredGroupedTokensMap.entries())
          .map<[string, ViewToken[]]>(([groupKey, tokens]) => {
            const filteredRemainings = tokens.filter((token) => {
              return filterRemaining({
                currency: token.token.currency,
                chainInfo: token.chainInfo as IChainInfoImpl<ChainInfo>,
              });
            });

            return [groupKey, filteredRemainings];
          })
          .filter(([, tokens]) => tokens.length > 0)
      );
    }, [filteredGroupedTokensMap, filterRemaining]);

    const [selectedCoinMinimalDenom, setSelectedCoinMinimalDenom] =
      useState<string>();
    const [unsupportedCoinMinimalDenoms, setUnsupportedCoinMinimalDenoms] =
      useState<Set<string>>(new Set());
    const [isSwapNotAvailableModalOpen, setIsSwapNotAvailableModalOpen] =
      useState(false);

    // Unified click handler merging logic from both branches
    const handleTokenClick = useCallback(
      async (viewToken: ViewToken, index?: number) => {
        if (search.trim().length > 0 && index != null) {
          analyticsAmplitudeStore.logEvent(
            "click_token_item_search_results_select_asset_ibc_swap",
            getTokenSearchResultClickAnalyticsProperties(
              viewToken,
              search,
              [...searchedTokens, ...searchedRemaining],
              index
            )
          );
        }

        let timer: NodeJS.Timeout | undefined;
        let disposal: IReactionDisposer | undefined;
        await Promise.race([
          new Promise((resolve) => {
            timer = setTimeout(resolve, 3000);
          }),
          new Promise((resolve) => {
            // Try to find currency – if found immediately navigate, otherwise wait until timeout.
            disposal = autorun(() => {
              const currency = chainStore
                .getChain(viewToken.chainInfo.chainId)
                .findCurrency(viewToken.token.currency.coinMinimalDenom);

              setSelectedCoinMinimalDenom(
                viewToken.token.currency.coinMinimalDenom
              );

              if (currency) {
                if (paramNavigateTo) {
                  navigate(
                    paramNavigateTo
                      .replace("{chainId}", viewToken.chainInfo.chainId)
                      .replace(
                        "{coinMinimalDenom}",
                        viewToken.token.currency.coinMinimalDenom
                      ),
                    {
                      replace: paramNavigateReplace === "true",
                    }
                  );
                } else {
                  console.error("Empty navigateTo param");
                }
                resolve(null);
              }
            });
          }),
        ]);

        setSelectedCoinMinimalDenom(undefined);
        const newUnsupportedCoinMinimalDenoms = new Set(
          unsupportedCoinMinimalDenoms
        );
        newUnsupportedCoinMinimalDenoms.add(
          viewToken.token.currency.coinMinimalDenom
        );
        setUnsupportedCoinMinimalDenoms(newUnsupportedCoinMinimalDenoms);
        setIsSwapNotAvailableModalOpen(true);

        if (timer) {
          clearTimeout(timer);
        }
        if (disposal) {
          disposal();
        }
      },
      [
        search,
        analyticsAmplitudeStore,
        searchedTokens,
        searchedRemaining,
        unsupportedCoinMinimalDenoms,
        chainStore,
        paramNavigateTo,
        paramNavigateReplace,
        navigate,
      ]
    );

    return (
      <HeaderLayout
        title={intl.formatMessage({ id: "page.send.select-asset.title" })}
        left={<BackButton />}
        contentContainerStyle={{ height: "100vh" }}
      >
        <Styles.Container gutter="0.5rem">
          <SearchTextInput
            ref={searchRef}
            placeholder={intl.formatMessage({
              id: "page.send.select-asset.search-placeholder",
            })}
            value={search}
            onChange={(e) => {
              e.preventDefault();

              setSearch(e.target.value);
            }}
          />
          {isLoading ? (
            <Stack gutter="0.5rem">
              <MsgItemSkeleton />
              <MsgItemSkeleton />
            </Stack>
          ) : uiConfigStore.assetViewMode === "grouped" ? (
            <YAxis gap="0.5rem">
              {Array.from(filteredGroupedTokensMap.entries()).map(
                ([groupKey, tokens]) => (
                  <GroupedTokenItem
                    key={groupKey}
                    tokens={tokens}
                    alwaysOpen={true}
                    onTokenClick={(viewToken) => handleTokenClick(viewToken)}
                  />
                )
              )}
              {Array.from(filteredRemainingGroupedTokensMap.entries()).map(
                ([groupKey, tokens]) => (
                  <GroupedTokenItem
                    key={groupKey}
                    tokens={tokens}
                    alwaysOpen={true}
                    onTokenClick={(viewToken) => handleTokenClick(viewToken)}
                  />
                )
              )}
            </YAxis>
          ) : (
            <AutoSizer>
              {({ height, width }: { height: number; width: number }) => (
                <FixedSizeList
                  itemData={{
                    searchedTokens,
                    searchedRemaining,
                    selectedCoinMinimalDenom,
                    unsupportedCoinMinimalDenoms,
                    onClick: handleTokenClick,
                  }}
                  width={width}
                  height={height}
                  itemCount={searchedTokens.length + searchedRemaining.length}
                  itemSize={76}
                >
                  {TokenListItem}
                </FixedSizeList>
              )}
            </AutoSizer>
          )}
        </Styles.Container>
        <SwapNotAvailableModal
          isOpen={isSwapNotAvailableModalOpen}
          close={() => setIsSwapNotAvailableModalOpen(false)}
        />
      </HeaderLayout>
    );
  }
);

const TOKEN_LIST_ITEM_GUTTER = 8;

const TokenListItem = ({
  data,
  index,
  style,
}: {
  data: {
    searchedTokens: ViewToken[];
    searchedRemaining: {
      currency: Currency;
      chainInfo: IChainInfoImpl;
    }[];
    selectedCoinMinimalDenom?: string;
    unsupportedCoinMinimalDenoms: Set<string>;
    onClick: (viewToken: ViewToken, index: number) => void;
  };
  index: number;
  style: any;
}) => {
  const isFilteredTokens = index < data.searchedTokens.length;
  const item = isFilteredTokens
    ? data.searchedTokens[index]
    : data.searchedRemaining[index - data.searchedTokens.length];

  const isFindingCurrency =
    data.selectedCoinMinimalDenom ===
    ("currency" in item
      ? item.currency.coinMinimalDenom
      : item.token.currency.coinMinimalDenom);

  const viewToken =
    "currency" in item
      ? {
          chainInfo: item.chainInfo,
          token: new CoinPretty(item.currency, new Dec(0)),
          isFetching: isFindingCurrency,
          error: undefined,
        }
      : item;

  const isUnsupportedToken = data.unsupportedCoinMinimalDenoms.has(
    "currency" in item
      ? item.currency.coinMinimalDenom
      : item.token.currency.coinMinimalDenom
  );

  return (
    <div
      style={{
        ...style,
        paddingTop: index === 0 ? 0 : TOKEN_LIST_ITEM_GUTTER,
        height:
          index === 0 ? style.height - TOKEN_LIST_ITEM_GUTTER : style.height,
        top: index === 0 ? style.top : style.top - TOKEN_LIST_ITEM_GUTTER,
        opacity: isUnsupportedToken ? 0.7 : 1,
      }}
    >
      <TokenItem
        viewToken={viewToken}
        hideBalance={isFilteredTokens ? false : true}
        onClick={() => !isUnsupportedToken && data.onClick(viewToken, index)}
        noTokenTag
        disabled={isUnsupportedToken}
      />
    </div>
  );
};
