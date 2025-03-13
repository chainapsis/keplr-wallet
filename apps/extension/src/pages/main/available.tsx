import React, { FunctionComponent, useMemo } from "react";
import { CollapsibleList } from "../../components/collapsible-list";
import {
  LookingForChains,
  MainEmptyView,
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
import { Body2, Subtitle1, Subtitle3 } from "../../components/typography";
import { XAxis, YAxis } from "../../components/axis";
import { Checkbox } from "../../components/checkbox";
import { Caption2 } from "../../components/typography";
import { ColorPalette } from "../../styles";
import { FormattedMessage, useIntl } from "react-intl";
import styled, { css, useTheme } from "styled-components";
import { DenomHelper } from "@keplr-wallet/common";
import { TokenDetailModal } from "./token-detail";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChainInfo, ModularChainInfo } from "@keplr-wallet/types";
import { useGetSearchChains } from "../../hooks/use-get-search-chains";
import { useEarnBottomTag } from "../earn/components/use-earn-bottom-tag";
import { AdjustmentIcon } from "../../components/icon/adjustment";

const zeroDec = new Dec(0);

const StyledCircle = styled.svg`
  width: 7px;
  height: 6px;
  // TextButton에서 적용되는 스타일을 무시하기 위해서 추가
  fill: none !important;
  stroke: none !important;
`;

const CircleIndicator: FunctionComponent = () => {
  return (
    <StyledCircle xmlns="http://www.w3.org/2000/svg" viewBox="0 0 7 6">
      <circle cx="3.5" cy="3" r="3" fill="#2C4BE2" />
    </StyledCircle>
  );
};

//NOTE - iconButton에 있는 makeTextAndSvgColor 사용 할 경우 path를 오버라이드를 할 수 없기 때문에
// 별도로 만들어서 사용함.
const makeTextAndSvgColor = (color: string) => {
  return css`
    color: ${color};
    svg {
      fill: ${color};
      stroke: ${color};
      path {
        fill: ${color};
      }
    }
  `;
};

const ManageViewAssetTokenPageButton = styled(TextButton)`
  ${Styles.Button} {
    color: ${(props) =>
      props.theme.mode === "light"
        ? ColorPalette["blue-400"]
        : ColorPalette["white"]};
    ${(props) =>
      makeTextAndSvgColor(
        props.theme.mode === "light"
          ? ColorPalette["blue-400"]
          : ColorPalette["white"]
      )}

    :hover {
      color: ${(props) =>
        props.theme.mode === "light"
          ? ColorPalette["blue-300"]
          : ColorPalette["gray-200"]};
      ${(props) =>
        makeTextAndSvgColor(
          props.theme.mode === "light"
            ? ColorPalette["blue-300"]
            : ColorPalette["gray-200"]
        )}
    }
  }
`;

export const AvailableTabView: FunctionComponent<{
  search: string;
  isNotReady?: boolean;

  // 초기 유저에게 뜨는 alternative에서 get started 버튼을 누르면 copy address modal을 띄워야된다...
  // 근데 컴포넌트가 분리되어있는데 이거 하려고 context api 쓰긴 귀찮아서 그냥 prop으로 대충 처리한다.
  onClickGetStarted: () => void;
  onMoreTokensClosed: () => void;
}> = observer(
  ({ search, isNotReady, onClickGetStarted, onMoreTokensClosed }) => {
    const { hugeQueriesStore, chainStore, accountStore, uiConfigStore } =
      useStore();
    const intl = useIntl();
    const theme = useTheme();
    const navigate = useNavigate();

    const { trimSearch, searchedChainInfos } = useGetSearchChains({
      search,
      searchOption: "all",
      filterOption: "chainNameAndToken",
      minSearchLength: 3,
      clearResultsOnEmptyQuery: true,
    });

    const allBalances = hugeQueriesStore.getAllBalances({
      allowIBCToken: true,
    });
    const allBalancesNonZero = useMemo(() => {
      return allBalances.filter((token) => {
        return token.token.toDec().gt(zeroDec);
      });
    }, [allBalances]);

    const isFirstTime = allBalancesNonZero.length === 0;

    const _allBalancesSearchFiltered = useMemo(() => {
      return allBalances.filter((token) => {
        return (
          token.chainInfo.chainName.toLowerCase().includes(trimSearch) ||
          token.token.currency.coinDenom.toLowerCase().includes(trimSearch)
        );
      });
    }, [allBalances, trimSearch]);

    const hasLowBalanceTokens =
      hugeQueriesStore.filterLowBalanceTokens(allBalances).filteredTokens
        .length > 0;
    const lowBalanceFilteredAllBalancesSearchFiltered =
      hugeQueriesStore.filterLowBalanceTokens(
        _allBalancesSearchFiltered
      ).filteredTokens;

    const lowBalanceTokens =
      hugeQueriesStore.filterLowBalanceTokens(allBalances).lowBalanceTokens;

    const allBalancesSearchFiltered =
      uiConfigStore.isHideLowBalance && hasLowBalanceTokens
        ? lowBalanceFilteredAllBalancesSearchFiltered
        : _allBalancesSearchFiltered;

    const lookingForChains = useMemo(() => {
      let disabledChainInfos: (ChainInfo | ModularChainInfo)[] =
        searchedChainInfos.filter(
          (chainInfo) => !chainStore.isEnabledChain(chainInfo.chainId)
        );

      const disabledStarknetChainInfos = chainStore.modularChainInfos.filter(
        (modularChainInfo) =>
          "starknet" in modularChainInfo &&
          !chainStore.isEnabledChain(modularChainInfo.chainId) &&
          trimSearch.length >= 3 &&
          (modularChainInfo.chainId.toLowerCase().includes(trimSearch) ||
            modularChainInfo.chainName.toLowerCase().includes(trimSearch) ||
            trimSearch === "eth")
      );

      disabledChainInfos = [
        ...new Set([...disabledChainInfos, ...disabledStarknetChainInfos]),
      ].sort((a, b) => a.chainName.localeCompare(b.chainName));

      return disabledChainInfos.reduce(
        (acc, chainInfo) => {
          let embedded: boolean | undefined = false;
          let stored: boolean = true;

          const isStarknet = "starknet" in chainInfo;

          try {
            if (isStarknet) {
              embedded = true;
            } else {
              const chainInfoInStore = chainStore.getChain(chainInfo.chainId);

              if (!chainInfoInStore) {
                stored = false;
              } else {
                if (chainInfoInStore.hideInUI) {
                  return acc;
                }

                stored = true;
                embedded = chainInfoInStore.embedded?.embedded;
              }
            }
          } catch (e) {
            // got an error while getting chain info
            embedded = undefined;
            stored = false;
          }

          const chainItem = {
            embedded: !!embedded,
            stored,
            chainInfo,
          };

          acc.push(chainItem);

          return acc;
        },
        [] as {
          embedded: boolean;
          stored: boolean;
          chainInfo: ChainInfo | ModularChainInfo;
        }[]
      );
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
      chainStore,
      chainStore.modularChainInfosInUI,
      searchedChainInfos,
      trimSearch,
    ]);

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

    const isShowNotFound =
      allBalancesSearchFiltered.length === 0 &&
      trimSearch.length > 0 &&
      lookingForChains.length === 0;

    const isShowCheckMangeAssetViewGuide =
      isShowNotFound &&
      uiConfigStore.manageViewAssetTokenConfig.isDisabledTokenSearched(
        trimSearch
      );

    const isShowSearchedLowBalanceTokenGuide =
      uiConfigStore.isHideLowBalance &&
      lowBalanceTokens.some((token) => {
        return (
          (token.chainInfo.chainName.toLowerCase().includes(trimSearch) ||
            token.token.currency.coinDenom
              .toLowerCase()
              .includes(trimSearch)) &&
          trimSearch.length
        );
      });

    const [searchParams, setSearchParams] = useSearchParams();

    const tokenDetailInfo: {
      chainId: string | null;
      coinMinimalDenom: string | null;
      isTokenDetailModalOpen: boolean | null;
    } = (() => {
      return {
        chainId: searchParams.get("tokenChainId"),
        coinMinimalDenom: searchParams.get("tokenCoinMinimalDenom"),
        // modal의 close transition을 유지하기 위해서는 위의 두 field가 존재하는지 만으로 판단하면 안된다...
        // close transition이 끝난후에 위의 두 값을 지워줘야한다.
        // close가 될 것인지는 밑의 값으로 판단한다.
        isTokenDetailModalOpen:
          searchParams.get("isTokenDetailModalOpen") === "true",
      };
    })();

    const { getBottomTagInfoProps } = useEarnBottomTag(
      allBalancesSearchFiltered
    );

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
                      onCollapse={(isCollapsed) => {
                        if (isCollapsed) {
                          onMoreTokensClosed();
                        }
                      }}
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
                      items={balance.map((viewToken) => {
                        const key = `${viewToken.chainInfo.chainId}-${viewToken.token.currency.coinMinimalDenom}`;
                        return (
                          <TokenItem
                            key={key}
                            viewToken={viewToken}
                            {...getBottomTagInfoProps(viewToken, key)}
                            onClick={() => {
                              setSearchParams((prev) => {
                                prev.set(
                                  "tokenChainId",
                                  viewToken.chainInfo.chainId
                                );
                                prev.set(
                                  "tokenCoinMinimalDenom",
                                  viewToken.token.currency.coinMinimalDenom
                                );
                                prev.set("isTokenDetailModalOpen", "true");

                                return prev;
                              });
                            }}
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

                              const account = accountStore.getAccount(
                                viewToken.chainInfo.chainId
                              );
                              const isEVMOnlyChain = chainStore.isEvmOnlyChain(
                                viewToken.chainInfo.chainId
                              );

                              return isEVMOnlyChain
                                ? account.ethereumHexAddress
                                : account.bech32Address;
                            })()}
                            showPrice24HChange={
                              uiConfigStore.show24HChangesInMagePage
                            }
                          />
                        );
                      })}
                    />
                  );
                }
              )}
            </Stack>
            {lookingForChains.length > 0 && (
              <React.Fragment>
                {allBalancesSearchFiltered.length > 0 && (
                  <Gutter size="1rem" direction="vertical" />
                )}
                <LookingForChains lookingForChains={lookingForChains} />
              </React.Fragment>
            )}

            <Box padding="0.75rem">
              <YAxis alignX="center">
                <ManageViewAssetTokenPageButton
                  text={intl.formatMessage({
                    id: "page.main.available.manage-asset-list-button",
                  })}
                  size="small"
                  right={
                    <XAxis alignY="center">
                      <AdjustmentIcon
                        width="1.125rem"
                        height="1.125rem"
                        color={
                          theme.mode === "light"
                            ? ColorPalette["blue-400"]
                            : ColorPalette["white"]
                        }
                      />
                      {numFoundToken > 0 ? (
                        <React.Fragment>
                          <Gutter size="0.375rem" />

                          <CircleIndicator />
                        </React.Fragment>
                      ) : null}
                    </XAxis>
                  }
                  onClick={() => navigate("/manage-view-asset-token-list")}
                />
              </YAxis>
            </Box>

            {(isShowCheckMangeAssetViewGuide ||
              isShowSearchedLowBalanceTokenGuide) && (
              <Box marginY="2rem">
                <EmptyView
                  altSvg={
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="70"
                      height="70"
                      viewBox="0 0 70 70"
                      fill="none"
                    >
                      <path
                        d="M55.9 10H15.1C13.7485 10 12.448 10.5355 11.5045 11.5045C10.5355 12.448 10 13.7485 10 15.1V45.7C10 47.0515 10.5355 48.352 11.5045 49.2955C12.448 50.2645 13.7485 50.8 15.1 50.8H25.3L35.5 61L45.7 50.8H55.9C57.2515 50.8 58.552 50.2645 59.4955 49.2955C60.439 48.3265 61 47.0515 61 45.7V15.1C61 13.7485 60.4645 12.448 59.4955 11.5045C58.552 10.5355 57.2515 10 55.9 10ZM15.1 45.7V15.1H55.9V45.7H43.5835L35.5 53.7835L27.4165 45.7M30.5275 20.302C31.9045 19.384 33.715 18.925 35.9845 18.925C38.3815 18.925 40.294 19.4605 41.671 20.506C43.048 21.577 43.7365 23.005 43.7365 24.79C43.7365 25.912 43.354 26.9065 42.6145 27.85C41.875 28.768 40.906 29.482 39.733 30.0175C39.07 30.4 38.6365 30.7825 38.407 31.216C38.1775 31.675 38.05 32.236 38.05 32.95H32.95C32.95 31.675 33.205 30.808 33.6895 30.196C34.225 29.584 35.092 28.87 36.418 28.054C37.081 27.697 37.6165 27.238 38.05 26.677C38.407 26.1415 38.611 25.504 38.611 24.79C38.611 24.025 38.3815 23.464 37.9225 23.0305C37.4635 22.5715 36.775 22.3675 35.9845 22.3675C35.296 22.3675 34.735 22.546 34.225 22.903C33.817 23.26 33.562 23.7955 33.562 24.5095H28.5385C28.411 22.75 29.125 21.22 30.5275 20.302ZM32.95 40.6V35.5H38.05V40.6H32.95Z"
                        fill="#424247"
                      />
                    </svg>
                  }
                >
                  <Stack alignX="center" gutter="0.1rem">
                    <Subtitle1>
                      <FormattedMessage id="page.main.available.search-show-check-manage-asset-view-guide-title" />
                    </Subtitle1>
                    <Body2 style={{ textAlign: "center", lineHeight: "1.4" }}>
                      <FormattedMessage id="page.main.available.search-show-check-manage-asset-view-guide-paragraph" />
                    </Body2>
                  </Stack>
                </EmptyView>
              </Box>
            )}

            {isShowNotFound &&
            !isShowCheckMangeAssetViewGuide &&
            !isShowSearchedLowBalanceTokenGuide ? (
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
          </React.Fragment>
        )}

        <Modal
          isOpen={
            tokenDetailInfo.chainId != null &&
            tokenDetailInfo.chainId.length > 0 &&
            tokenDetailInfo.coinMinimalDenom != null &&
            tokenDetailInfo.coinMinimalDenom.length > 0 &&
            tokenDetailInfo.isTokenDetailModalOpen === true
          }
          align="right"
          close={() => {
            setSearchParams((prev) => {
              prev.delete("isTokenDetailModalOpen");

              return prev;
            });
          }}
          onCloseTransitionEnd={() => {
            setSearchParams((prev) => {
              prev.delete("tokenChainId");
              prev.delete("tokenCoinMinimalDenom");

              return prev;
            });
          }}
          forceNotOverflowAuto={true}
        >
          {tokenDetailInfo.chainId != null &&
          tokenDetailInfo.chainId.length > 0 &&
          tokenDetailInfo.coinMinimalDenom != null &&
          tokenDetailInfo.coinMinimalDenom.length > 0 ? (
            <TokenDetailModal
              close={() => {
                setSearchParams((prev) => {
                  prev.delete("isTokenDetailModalOpen");

                  return prev;
                });
              }}
              chainId={tokenDetailInfo.chainId}
              coinMinimalDenom={tokenDetailInfo.coinMinimalDenom}
            />
          ) : null}
        </Modal>
      </React.Fragment>
    );
  }
);
