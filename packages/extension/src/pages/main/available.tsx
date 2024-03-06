import React, { FunctionComponent, useMemo, useState } from "react";
import { CollapsibleList } from "../../components/collapsible-list";
import {
  LookingForChains,
  MainEmptyView,
  TokenFoundModal,
  TokenItem,
  TokenTitleView,
} from "./components";
import { CoinPretty, Dec } from "@keplr-wallet/unit";
import { ViewToken } from "./index";
import { observer } from "mobx-react-lite";
import { Stack } from "../../components/stack";
import { Button } from "../../components/button";
import { useStore } from "../../stores";
import { Styles, TextButton } from "../../components/button-text";
import { Box } from "../../components/box";
import { Modal } from "../../components/modal";
import { ChainIdHelper } from "@keplr-wallet/cosmos";
import { Gutter } from "../../components/gutter";
import { EmptyView } from "../../components/empty-view";
import { Subtitle3 } from "../../components/typography";
import { YAxis } from "../../components/axis";
import { Checkbox } from "../../components/checkbox";
import { Caption2 } from "../../components/typography";
import { ColorPalette } from "../../styles";
import { FormattedMessage, useIntl } from "react-intl";
import styled, { useTheme } from "styled-components";
import { DenomHelper } from "@keplr-wallet/common";
import { TokenDetailModal } from "./token-detail";

const zeroDec = new Dec(0);

const NewTokenFoundButton = styled(TextButton)`
  ${Styles.Button} {
    color: ${(props) =>
      props.theme.mode === "light"
        ? ColorPalette["blue-400"]
        : ColorPalette["gray-50"]};

    :hover {
      color: ${(props) =>
        props.theme.mode === "light"
          ? ColorPalette["blue-500"]
          : ColorPalette["gray-200"]};
    }
  }
`;

export const AvailableTabView: FunctionComponent<{
  search: string;
  isNotReady?: boolean;

  // 초기 유저에게 뜨는 alternative에서 get started 버튼을 누르면 copy address modal을 띄워야된다...
  // 근데 컴포넌트가 분리되어있는데 이거 하려고 context api 쓰긴 귀찮아서 그냥 prop으로 대충 처리한다.
  onClickGetStarted: () => void;
}> = observer(({ search, isNotReady, onClickGetStarted }) => {
  const { hugeQueriesStore, chainStore, accountStore, uiConfigStore } =
    useStore();
  const intl = useIntl();
  const theme = useTheme();

  const allBalances = hugeQueriesStore.getAllBalances(true);
  const allBalancesNonZero = useMemo(() => {
    return allBalances.filter((token) => {
      return token.token.toDec().gt(zeroDec);
    });
  }, [allBalances]);

  const isFirstTime = allBalancesNonZero.length === 0;
  const trimSearch = search.trim();
  const _allBalancesSearchFiltered = useMemo(() => {
    return allBalances.filter((token) => {
      return (
        token.chainInfo.chainName
          .toLowerCase()
          .includes(trimSearch.toLowerCase()) ||
        token.token.currency.coinDenom
          .toLowerCase()
          .includes(trimSearch.toLowerCase())
      );
    });
  }, [allBalances, trimSearch]);

  const hasLowBalanceTokens =
    hugeQueriesStore.filterLowBalanceTokens(allBalances).length > 0;
  const lowBalanceFilteredAllBalancesSearchFiltered =
    hugeQueriesStore.filterLowBalanceTokens(_allBalancesSearchFiltered);
  const allBalancesSearchFiltered =
    uiConfigStore.isHideLowBalance && hasLowBalanceTokens
      ? lowBalanceFilteredAllBalancesSearchFiltered
      : _allBalancesSearchFiltered;

  const lookingForChains = (() => {
    return chainStore.chainInfos.filter((chainInfo) => {
      if (chainStore.isEnabledChain(chainInfo.chainId)) {
        return false;
      }

      const replacedSearchValue = trimSearch.replace(/ /g, "").toLowerCase();

      if (replacedSearchValue.length < 3) {
        return false;
      }

      const hasChainName =
        chainInfo.chainName.replace(/ /gi, "").toLowerCase() ===
        replacedSearchValue;
      const hasCurrency = chainInfo.currencies.some(
        (currency) =>
          currency.coinDenom.replace(/ /gi, "").toLowerCase() ===
          replacedSearchValue
      );

      const hasStakeCurrency =
        chainInfo.stakeCurrency &&
        chainInfo.stakeCurrency.coinDenom.replace(/ /gi, "").toLowerCase() ===
          replacedSearchValue;

      return hasChainName || hasCurrency || hasStakeCurrency;
    });
  })();

  const TokenViewData: {
    title: string;
    balance: ViewToken[];
    lenAlwaysShown: number;
    tooltip?: string | React.ReactElement;
  }[] = [
    {
      title: intl.formatMessage({
        id: "page.main.available.available-balance-title",
      }),
      balance: allBalancesSearchFiltered,
      lenAlwaysShown: 10,
      tooltip: intl.formatMessage({
        id: "page.main.available.available-balance-tooltip",
      }),
    },
  ];

  const numFoundToken = useMemo(() => {
    if (chainStore.tokenScans.length === 0) {
      return 0;
    }

    const set = new Set<string>();

    for (const tokenScan of chainStore.tokenScans) {
      for (const info of tokenScan.infos) {
        for (const asset of info.assets) {
          const key = `${ChainIdHelper.parse(tokenScan.chainId).identifier}/${
            asset.currency.coinMinimalDenom
          }`;
          set.add(key);
        }
      }
    }

    return Array.from(set).length;
  }, [chainStore.tokenScans]);

  const [isFoundTokenModalOpen, setIsFoundTokenModalOpen] = useState(false);

  const isShowNotFound =
    allBalancesSearchFiltered.length === 0 && trimSearch.length > 0;

  const [tokenDetailModal, setTokenDetailModal] = useState<
    { chainId: string; coinMinimalDenom: string } | undefined
  >(undefined);

  return (
    <React.Fragment>
      {isNotReady ? (
        <TokenItem
          viewToken={{
            token: new CoinPretty(
              chainStore.chainInfos[0].currencies[0],
              new Dec(0)
            ),
            chainInfo: chainStore.chainInfos[0],
            isFetching: false,
            error: undefined,
          }}
          isNotReady={isNotReady}
        />
      ) : (
        <React.Fragment>
          <Stack gutter="0.5rem">
            {TokenViewData.map(
              ({ title, balance, lenAlwaysShown, tooltip }) => {
                if (balance.length === 0) {
                  return null;
                }

                return (
                  <CollapsibleList
                    key={title}
                    hideNumInTitle={uiConfigStore.isPrivacyMode}
                    notRenderHiddenItems={true}
                    title={
                      <TokenTitleView
                        title={title}
                        tooltip={tooltip}
                        right={
                          hasLowBalanceTokens ? (
                            <React.Fragment>
                              <Caption2
                                style={{ cursor: "pointer" }}
                                onClick={() => {
                                  uiConfigStore.setHideLowBalance(
                                    !uiConfigStore.isHideLowBalance
                                  );
                                }}
                                color={ColorPalette["gray-300"]}
                              >
                                <FormattedMessage id="page.main.available.hide-low-balance" />
                              </Caption2>

                              <Gutter size="0.25rem" />

                              <Checkbox
                                size="extra-small"
                                checked={uiConfigStore.isHideLowBalance}
                                onChange={() => {
                                  uiConfigStore.setHideLowBalance(
                                    !uiConfigStore.isHideLowBalance
                                  );
                                }}
                              />
                            </React.Fragment>
                          ) : undefined
                        }
                      />
                    }
                    lenAlwaysShown={lenAlwaysShown}
                    items={balance.map((viewToken) => (
                      <TokenItem
                        viewToken={viewToken}
                        key={`${viewToken.chainInfo.chainId}-${viewToken.token.currency.coinMinimalDenom}`}
                        onClick={() =>
                          setTokenDetailModal({
                            chainId: viewToken.chainInfo.chainId,
                            coinMinimalDenom:
                              viewToken.token.currency.coinMinimalDenom,
                          })
                        }
                        copyAddress={(() => {
                          // For only native tokens, show copy address button
                          if (
                            new DenomHelper(
                              viewToken.token.currency.coinMinimalDenom
                            ).type !== "native" ||
                            viewToken.token.currency.coinMinimalDenom.startsWith(
                              "ibc/"
                            )
                          ) {
                            return undefined;
                          }

                          return accountStore.getAccount(
                            viewToken.chainInfo.chainId
                          ).bech32Address;
                        })()}
                      />
                    ))}
                  />
                );
              }
            )}
          </Stack>

          {lookingForChains.length > 0 ? (
            <React.Fragment>
              <Gutter size="0.5rem" direction="vertical" />
              <LookingForChains chainInfos={lookingForChains} />
            </React.Fragment>
          ) : null}

          {isShowNotFound ? (
            <Box marginY="2rem">
              <EmptyView>
                <Stack alignX="center" gutter="0.1rem">
                  <Subtitle3 style={{ fontWeight: 700 }}>
                    <FormattedMessage id="page.main.available.search-empty-view-title" />
                  </Subtitle3>
                  <Subtitle3>
                    <FormattedMessage id="page.main.available.search-empty-view-paragraph" />
                  </Subtitle3>
                </Stack>
              </EmptyView>
            </Box>
          ) : isFirstTime ? (
            <MainEmptyView
              image={
                <img
                  src={require(theme.mode === "light"
                    ? "../../public/assets/img/main-empty-balance-light.png"
                    : "../../public/assets/img/main-empty-balance.png")}
                  style={{
                    width: "6.25rem",
                    height: "6.25rem",
                  }}
                  alt="empty balance image"
                />
              }
              paragraph={intl.formatMessage({
                id: "page.main.available.empty-view-paragraph",
              })}
              title={intl.formatMessage({
                id: "page.main.available.empty-view-title",
              })}
              button={
                <Button
                  text={intl.formatMessage({
                    id: "page.main.available.get-started-button",
                  })}
                  color="primary"
                  size="small"
                  onClick={onClickGetStarted}
                />
              }
            />
          ) : null}

          {numFoundToken > 0 ? (
            <Box padding="0.75rem">
              <YAxis alignX="center">
                <NewTokenFoundButton
                  text={intl.formatMessage(
                    { id: "page.main.available.new-token-found" },
                    { numFoundToken }
                  )}
                  size="small"
                  onClick={() => setIsFoundTokenModalOpen(true)}
                />
              </YAxis>
            </Box>
          ) : null}
        </React.Fragment>
      )}

      <Modal
        isOpen={isFoundTokenModalOpen && numFoundToken > 0}
        align="bottom"
        close={() => setIsFoundTokenModalOpen(false)}
      >
        <TokenFoundModal close={() => setIsFoundTokenModalOpen(false)} />
      </Modal>

      <Modal
        isOpen={tokenDetailModal != null}
        align="bottom"
        close={() => setTokenDetailModal(undefined)}
        maxHeight="100vh"
        disableBackdrop={true}
      >
        {tokenDetailModal ? (
          <TokenDetailModal
            close={() => setTokenDetailModal(undefined)}
            chainId={tokenDetailModal.chainId}
            coinMinimalDenom={tokenDetailModal.coinMinimalDenom}
          />
        ) : null}
      </Modal>
    </React.Fragment>
  );
});
