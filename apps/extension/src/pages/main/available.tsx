import React, {
  FunctionComponent,
  useMemo,
  useState,
  useRef,
  useEffect,
  Dispatch,
  SetStateAction,
} from "react";
import {
  BottomTagType,
  LookingForChains,
  MainEmptyView,
  TokenItem,
  TokenTitleView,
} from "./components";
import { GroupedTokenItem } from "./components/token/grouped";
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
import {
  Body2,
  Subtitle1,
  Subtitle3,
  Subtitle4,
} from "../../components/typography";
import { XAxis, YAxis } from "../../components/axis";
import { ColorPalette } from "../../styles";
import { FormattedMessage, useIntl } from "react-intl";
import styled, { css, useTheme } from "styled-components";
import { TokenDetailModal } from "./token-detail";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChainInfo, ModularChainInfo } from "@keplr-wallet/types";
import { useGetSearchChains } from "../../hooks/use-get-search-chains";
import { useEarnBottomTag } from "../earn/components/use-earn-bottom-tag";
import { AdjustmentIcon } from "../../components/icon/adjustment";
import { ViewOptionsContextMenu } from "./components/context-menu";
import { useCopyAddress } from "../../hooks/use-copy-address";
import { useSearch } from "../../hooks/use-search";
import { SceneTransition } from "../../components/transition/scene";
import { SceneTransitionRef } from "../../components/transition/scene/internal";
import { VerticalCollapseTransition } from "../../components/transition/vertical-collapse";
import { ArrowDownIcon, ArrowUpIcon } from "../../components/icon";
import { Styles as AvailableCollapsibleListStyles } from "../../components/collapsible-list";
import { useGroupedTokensMap } from "../../hooks/use-grouped-tokens-map";
import { useBalanceAnalytics } from "./hooks/use-balance-analytics";
import { KeyRingCosmosService } from "@keplr-wallet/background";

type TokenViewData = {
  title: string;
  balance: ViewToken[];
  lenAlwaysShown: number;
  tooltip?: string | React.ReactElement;
};

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

const chainSearchFields = [
  "chainInfo.chainName",
  {
    key: "ethereum-and-bitcoin",
    function: (item: { chainInfo: ChainInfo | ModularChainInfo }) => {
      if (
        "starknet" in item.chainInfo ||
        item.chainInfo.chainName.toLowerCase().includes("ethereum")
      ) {
        return "eth";
      }
      if (
        "bitcoin" in item.chainInfo ||
        item.chainInfo.chainName.toLowerCase().includes("bitcoin")
      ) {
        return "btc";
      }
      return "";
    },
  },
];

const AvailableCollapsibleList: FunctionComponent<{
  items: React.ReactNode[];
  lenAlwaysShown: number;
  onCollapse?: (isCollapsed: boolean) => void;
  notRenderHiddenItems?: boolean;
}> = ({ items, lenAlwaysShown, onCollapse, notRenderHiddenItems }) => {
  const intl = useIntl();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [notRenderHiddenItemsIsClosing, setNotRenderHiddenItemsIsClosing] =
    useState(false);

  if (!lenAlwaysShown || lenAlwaysShown < 0) {
    lenAlwaysShown = items.length;
  }

  const alwaysShown = items.slice(0, lenAlwaysShown);
  const hidden = items.slice(lenAlwaysShown);

  return (
    <Stack>
      <Stack gutter="0.5rem">{alwaysShown}</Stack>

      <VerticalCollapseTransition
        collapsed={isCollapsed}
        onTransitionEnd={() => {
          if (isCollapsed) {
            setNotRenderHiddenItemsIsClosing(false);
          }
        }}
      >
        {!notRenderHiddenItems ||
        notRenderHiddenItemsIsClosing ||
        !isCollapsed ? (
          <React.Fragment>
            <Gutter size="0.5rem" />
            <Stack gutter="0.5rem">{hidden}</Stack>
          </React.Fragment>
        ) : null}
      </VerticalCollapseTransition>

      {hidden.length > 0 ? (
        <AvailableCollapsibleListStyles.MoreViewContainer
          onClick={(e: React.MouseEvent) => {
            e.preventDefault();

            setIsCollapsed(!isCollapsed);
            if (onCollapse) {
              onCollapse(!isCollapsed);
            }
            if (!isCollapsed) {
              setNotRenderHiddenItemsIsClosing(true);
            }
          }}
        >
          <Gutter size="0.75rem" />
          <XAxis alignY="center">
            <Body2>
              {isCollapsed
                ? intl.formatMessage(
                    {
                      id: "components.collapsible-list.view-more-tokens",
                    },
                    { remain: hidden.length }
                  )
                : intl.formatMessage({
                    id: "components.collapsible-list.collapse",
                  })}
            </Body2>

            <Gutter size="0.25rem" />

            {isCollapsed ? (
              <ArrowDownIcon width="1rem" height="1rem" />
            ) : (
              <ArrowUpIcon width="1rem" height="1rem" />
            )}
          </XAxis>
        </AvailableCollapsibleListStyles.MoreViewContainer>
      ) : null}
    </Stack>
  );
};

const TokenItemWithCopyAddress: FunctionComponent<{
  viewToken: ViewToken;
  bottomTagType?: BottomTagType;
  earnedAssetPrice?: string;
  onClick: () => void;
  showPrice24HChange: boolean;
}> = observer(
  ({
    viewToken,
    bottomTagType,
    earnedAssetPrice,
    onClick,
    showPrice24HChange,
  }) => {
    const copyAddress = useCopyAddress(viewToken);

    return (
      <TokenItem
        key={`${viewToken.chainInfo.chainId}-${viewToken.token.currency.coinMinimalDenom}`}
        bottomTagType={bottomTagType}
        earnedAssetPrice={earnedAssetPrice}
        viewToken={viewToken}
        onClick={onClick}
        copyAddress={copyAddress}
        showPrice24HChange={showPrice24HChange}
      />
    );
  }
);

export const AvailableTabView: FunctionComponent<{
  search: string;
  isNotReady?: boolean;

  // 초기 유저에게 뜨는 alternative에서 get started 버튼을 누르면 copy address modal을 띄워야된다...
  // 근데 컴포넌트가 분리되어있는데 이거 하려고 context api 쓰긴 귀찮아서 그냥 prop으로 대충 처리한다.
  onClickGetStarted: () => void;
  onMoreTokensClosed: () => void;
}> = observer(
  ({ search, isNotReady, onClickGetStarted, onMoreTokensClosed }) => {
    const { chainStore, uiConfigStore, keyRingStore } = useStore();
    const intl = useIntl();
    const theme = useTheme();
    const navigate = useNavigate();
    const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
    const [showFiatValueVisible, setShowFiatValueVisible] = useState(
      uiConfigStore.assetViewMode === "grouped"
    );
    const sceneTransitionRef = useRef<SceneTransitionRef>(null);

    const { trimSearch, searchedChainInfos } = useGetSearchChains({
      search,
      searchOption: "all",
      filterOption: "chainNameAndToken",
      minSearchLength: 3,
      clearResultsOnEmptyQuery: true,
    });

    const lookingForChains = useMemo(() => {
      let disabledChainInfos: (ChainInfo | ModularChainInfo)[] =
        searchedChainInfos.filter(
          (chainInfo) => !chainStore.isEnabledChain(chainInfo.chainId)
        );

      const disabledModularChainInfos =
        chainStore.groupedModularChainInfos.filter(
          (modularChainInfo) =>
            ("starknet" in modularChainInfo || "bitcoin" in modularChainInfo) &&
            !chainStore.isEnabledChain(modularChainInfo.chainId)
        );

      disabledChainInfos = [
        ...new Set([...disabledChainInfos, ...disabledModularChainInfos]),
      ].sort((a, b) => a.chainName.localeCompare(b.chainName));

      return disabledChainInfos.reduce(
        (acc, chainInfo) => {
          let embedded: boolean | undefined = false;
          let stored: boolean = true;

          const isModular = "starknet" in chainInfo || "bitcoin" in chainInfo;

          try {
            if (isModular) {
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
    }, [chainStore, chainStore.modularChainInfosInUI, searchedChainInfos]);

    const searchedLookingForChains = useSearch(
      trimSearch.length >= 2 ? lookingForChains : [],
      trimSearch,
      chainSearchFields
    ).filter(({ chainInfo }) => {
      if (keyRingStore.selectedKeyInfo?.type === "ledger") {
        const cosmosChainInfo = (() => {
          if ("cosmos" in chainInfo) {
            return chainInfo.cosmos;
          }
          if ("currencies" in chainInfo && "feeCurrencies" in chainInfo) {
            return chainInfo;
          }
        })();
        if (cosmosChainInfo) {
          // cosmos 계열이면서 ledger일때
          // background에서 ledger를 지원하지 않는 체인은 다 지워줘야한다.
          try {
            if (cosmosChainInfo.features?.includes("force-enable-evm-ledger")) {
              return true;
            }

            KeyRingCosmosService.throwErrorIfEthermintWithLedgerButNotSupported(
              cosmosChainInfo.chainId
            );
            return true;
          } catch {
            return false;
          }
        }
      }

      return true;
    });

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

    const {
      allBalancesSearchFiltered,
      lowBalanceTokens,
      isFirstTime,
      TokenViewData,
    } = useAllBalances(trimSearch);

    useBalanceAnalytics(allBalancesSearchFiltered, trimSearch);

    const isShowNotFound =
      allBalancesSearchFiltered.length === 0 &&
      trimSearch.length > 0 &&
      searchedLookingForChains.length === 0;

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

    const scenes = useMemo(
      () => [
        {
          name: "flat-view",
          element: () => (
            <TokensFlatViewScene
              trimSearch={trimSearch}
              onMoreTokensClosed={onMoreTokensClosed}
              setSearchParams={setSearchParams}
            />
          ),
        },
        {
          name: "grouped-view",
          element: () => (
            <TokensGroupedViewScene
              trimSearch={trimSearch}
              onMoreTokensClosed={onMoreTokensClosed}
            />
          ),
        },
      ],
      [trimSearch]
    );

    const initialSceneProps = useMemo(
      () => ({
        name:
          uiConfigStore.assetViewMode === "grouped"
            ? "grouped-view"
            : "flat-view",
      }),
      []
    );

    useEffect(() => {
      if (
        uiConfigStore.assetViewMode === "grouped" &&
        sceneTransitionRef.current?.currentScene !== "grouped-view"
      ) {
        sceneTransitionRef.current?.replace("grouped-view");
      } else if (
        uiConfigStore.assetViewMode === "flat" &&
        sceneTransitionRef.current?.currentScene !== "flat-view"
      ) {
        sceneTransitionRef.current?.replace("flat-view");
      }
    }, [uiConfigStore.assetViewMode]);

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
              <Box paddingX="0.375rem" paddingY="0.25rem">
                <XAxis alignY="center" gap="0.25rem">
                  <Subtitle4>{TokenViewData.balance.length}</Subtitle4>
                  <TokenTitleView
                    title={intl.formatMessage({
                      id: "page.main.available.available-balance-title",
                    })}
                    tooltip={intl.formatMessage({
                      id: "page.main.available.available-balance-tooltip",
                    })}
                    right={
                      <ViewOptionsContextMenu
                        isOpen={isContextMenuOpen}
                        setIsOpen={setIsContextMenuOpen}
                        showFiatValueVisible={showFiatValueVisible}
                        setShowFiatValueVisible={setShowFiatValueVisible}
                      />
                    }
                  />
                </XAxis>
              </Box>

              <SceneTransition
                ref={sceneTransitionRef}
                scenes={scenes}
                initialSceneProps={initialSceneProps}
                transitionMode="opacity"
              />
            </Stack>
            {searchedLookingForChains.length > 0 && (
              <React.Fragment>
                {allBalancesSearchFiltered.length > 0 && (
                  <Gutter size="1rem" direction="vertical" />
                )}
                <LookingForChains
                  lookingForChains={searchedLookingForChains}
                  search={search}
                />
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
                      <FormattedMessage
                        id="page.main.available.search-show-check-manage-asset-view-guide-paragraph"
                        values={{
                          br: <br />,
                        }}
                      />
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

const TokensFlatViewScene = observer(
  ({
    trimSearch,
    onMoreTokensClosed,
    setSearchParams,
  }: {
    trimSearch: string;
    onMoreTokensClosed: () => void;
    setSearchParams: Dispatch<SetStateAction<URLSearchParams>>;
  }) => {
    const { uiConfigStore, analyticsAmplitudeStore } = useStore();

    const { TokenViewData } = useAllBalances(trimSearch);

    const { getBottomTagInfoProps } = useEarnBottomTag(TokenViewData.balance);

    return (
      <React.Fragment>
        {TokenViewData.balance.length === 0 ? null : (
          <AvailableCollapsibleList
            notRenderHiddenItems={true}
            onCollapse={(isCollapsed) => {
              if (isCollapsed) {
                onMoreTokensClosed();
              }
            }}
            lenAlwaysShown={TokenViewData.lenAlwaysShown}
            items={TokenViewData.balance.map((viewToken, index) => {
              return (
                <TokenItemWithCopyAddress
                  key={`${viewToken.chainInfo.chainId}-${viewToken.token.currency.coinMinimalDenom}`}
                  {...getBottomTagInfoProps(viewToken)}
                  viewToken={viewToken}
                  onClick={() => {
                    setSearchParams((prev) => {
                      prev.set("tokenChainId", viewToken.chainInfo.chainId);
                      prev.set(
                        "tokenCoinMinimalDenom",
                        viewToken.token.currency.coinMinimalDenom
                      );
                      prev.set("isTokenDetailModalOpen", "true");

                      return prev;
                    });
                  }}
                  showPrice24HChange={uiConfigStore.show24HChangesInMagePage}
                />
              );
            })}
          />
        )}
      </React.Fragment>
    );
  }
);

const TokensGroupedViewScene = observer(
  ({
    trimSearch,
    onMoreTokensClosed,
  }: {
    trimSearch: string;
    onMoreTokensClosed: () => void;
  }) => {
    const { uiConfigStore } = useStore();
    const { searchedGroupedTokensMap } = useGroupedTokensMap(trimSearch);
    const { getBottomTagInfoProps } = useEarnBottomTag(
      Array.from(searchedGroupedTokensMap.values()).flat()
    );

    return (
      <React.Fragment>
        {searchedGroupedTokensMap.size === 0 ? null : (
          <AvailableCollapsibleList
            notRenderHiddenItems={true}
            onCollapse={(isCollapsed) => {
              if (isCollapsed) {
                onMoreTokensClosed();
              }
            }}
            lenAlwaysShown={10}
            items={Array.from(searchedGroupedTokensMap.entries()).map(
              ([groupKey, tokens]) => {
                let bottomTagType: BottomTagType | undefined;
                let earnedAssetPrice: string | undefined;
                for (const token of tokens) {
                  const {
                    bottomTagType: newBottomTagType,
                    earnedAssetPrice: newEarnedAssetPrice,
                  } = getBottomTagInfoProps(token);
                  if (newBottomTagType && newEarnedAssetPrice) {
                    bottomTagType = newBottomTagType;
                    earnedAssetPrice = newEarnedAssetPrice;
                  }
                }
                return (
                  <GroupedTokenItem
                    key={groupKey}
                    tokens={tokens}
                    bottomTagType={bottomTagType}
                    earnedAssetPrice={earnedAssetPrice}
                    showPrice24HChange={uiConfigStore.show24HChangesInMagePage}
                  />
                );
              }
            )}
          />
        )}
      </React.Fragment>
    );
  }
);

const useAllBalances = (trimSearch: string) => {
  const { hugeQueriesStore, uiConfigStore } = useStore();
  const allBalances = hugeQueriesStore.getAllBalances({
    allowIBCToken: true,
  });

  const intl = useIntl();
  const allBalancesNonZero = useMemo(() => {
    return allBalances.filter((token) => {
      return token.token.toDec().gt(zeroDec);
    });
  }, [allBalances]);

  const isFirstTime = allBalancesNonZero.length === 0;

  const _allBalancesSearchFiltered = useSearch(
    [...allBalances],
    trimSearch,
    tokenSearchFields
  );

  const hasLowBalanceTokens =
    hugeQueriesStore.filterLowBalanceTokens(allBalances).filteredTokens.length >
    0;
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

  const TokenViewData: TokenViewData = useMemo(
    () => ({
      title: intl.formatMessage({
        id: "page.main.available.available-balance-title",
      }),
      balance: allBalancesSearchFiltered,
      lenAlwaysShown: 10,
      tooltip: intl.formatMessage({
        id: "page.main.available.available-balance-tooltip",
      }),
    }),
    [intl, allBalancesSearchFiltered]
  );

  return {
    TokenViewData,
    isFirstTime,
    allBalancesSearchFiltered,
    lowBalanceTokens,
  };
};
