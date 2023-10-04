import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useMemo, useState } from "react";
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
import { computed, makeObservable } from "mobx";
import { ObservableQueryIbcSwap } from "../../../stores/skip/ibc-swap";
import { Currency } from "@keplr-wallet/types";
import { IChainInfoImpl } from "@keplr-wallet/stores";

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
    tokens: ViewToken[];
    remaining: {
      currency: Currency;
      chainInfo: IChainInfoImpl;
    }[];
  } {
    const zeroDec = new Dec(0);

    const destinationMap = this.queryIBCSwap.swapDestinationCurrenciesMap;

    // Swap destination은 ibc currency는 보여주지 않는다.
    let tokens = this.hugeQueriesStore.getAllBalances(false);
    let remaining: {
      currency: Currency;
      chainInfo: IChainInfoImpl;
    }[] = [];

    tokens = tokens
      .filter((token) => {
        return token.token.toDec().gt(zeroDec);
      })
      .filter((token) => {
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
      tokensKeyMap.set(
        `${token.chainInfo.chainIdentifier}/${token.token.currency.coinMinimalDenom}`,
        true
      );
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
    };
  }
}

const Styles = {
  Container: styled(Stack)`
    padding: 0.75rem;
  `,
};

// /send/select-asset와 기본 로직은 거의 유사한데...
// 뷰 쪽이 생각보다 이질적이라서 그냥 분리 시킴...
// /send/select-asset 페이지와 세트로 관리하셈
export const IBCSwapDestinationSelectAssetPage: FunctionComponent = observer(
  () => {
    const { hugeQueriesStore, skipQueriesStore } = useStore();
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

    const { tokens, remaining } = state.tokens;

    const filteredTokens = useMemo(() => {
      const filtered = tokens.filter((token) => {
        return (
          !excludeKey ||
          `${token.chainInfo.chainIdentifier}/${token.token.currency.coinMinimalDenom}` !==
            excludeKey
        );
      });

      const trimSearch = search.trim();

      if (!trimSearch) {
        return filtered;
      }

      return filtered.filter((token) => {
        return (
          token.chainInfo.chainName
            .toLowerCase()
            .includes(trimSearch.toLowerCase()) ||
          token.token.currency.coinDenom
            .toLowerCase()
            .includes(trimSearch.toLowerCase())
        );
      });
    }, [excludeKey, search, tokens]);

    const filteredRemaining = useMemo(() => {
      const filtered = remaining.filter((r) => {
        return (
          !excludeKey ||
          `${r.chainInfo.chainIdentifier}/${r.currency.coinMinimalDenom}` !==
            excludeKey
        );
      });

      const trimSearch = search.trim();

      if (!trimSearch) {
        return filtered;
      }

      return filtered.filter((r) => {
        return (
          r.chainInfo.chainName
            .toLowerCase()
            .includes(trimSearch.toLowerCase()) ||
          r.currency.coinDenom.toLowerCase().includes(trimSearch.toLowerCase())
        );
      });
    }, [excludeKey, remaining, search]);

    return (
      <HeaderLayout
        title={intl.formatMessage({ id: "page.send.select-asset.title" })}
        left={<BackButton />}
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
          {filteredTokens.map((viewToken) => {
            return (
              <TokenItem
                viewToken={viewToken}
                key={`${viewToken.chainInfo.chainId}-${viewToken.token.currency.coinMinimalDenom}`}
                onClick={() => {
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
                }}
              />
            );
          })}
          {filteredRemaining.map((item) => {
            return (
              <TokenItem
                viewToken={{
                  chainInfo: item.chainInfo,
                  token: new CoinPretty(item.currency, new Dec(0)),
                  isFetching: false,
                  error: undefined,
                }}
                hideBalance={true}
                key={`${item.chainInfo.chainId}-${item.currency.coinMinimalDenom}`}
                onClick={() => {
                  if (paramNavigateTo) {
                    navigate(
                      paramNavigateTo
                        .replace("{chainId}", item.chainInfo.chainId)
                        .replace(
                          "{coinMinimalDenom}",
                          item.currency.coinMinimalDenom
                        ),
                      {
                        replace: paramNavigateReplace === "true",
                      }
                    );
                  } else {
                    console.error("Empty navigateTo param");
                  }
                }}
              />
            );
          })}
        </Styles.Container>
      </HeaderLayout>
    );
  }
);
