import React, {
  FunctionComponent,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import {
  Buttons,
  ClaimAll,
  CopyAddress,
  IBCTransferView,
  BuyCryptoModal,
  StakeWithKeplrDashboardButton,
  UpdateNoteModal,
  UpdateNotePageData,
} from "./components";
import { Stack } from "../../components/stack";
import { CoinPretty, PricePretty } from "@keplr-wallet/unit";
import {
  ArrowTopRightOnSquareIcon,
  EyeIcon,
  EyeSlashIcon,
} from "../../components/icon";
import { Box } from "../../components/box";
import { Modal } from "../../components/modal";
import { DualChart } from "./components/chart";
import { Gutter } from "../../components/gutter";
import { H1, Subtitle3, Subtitle4 } from "../../components/typography";
import { ColorPalette } from "../../styles";
import { AvailableTabView } from "./available";
import { StakedTabView } from "./staked";
import { SearchTextInput } from "../../components/input";
import { animated, useSpringValue } from "@react-spring/web";
import { defaultSpringConfig } from "../../styles/spring";
import { IChainInfoImpl, QueryError } from "@keplr-wallet/stores";
import { Skeleton } from "../../components/skeleton";
import { FormattedMessage, useIntl } from "react-intl";
import { useGlobarSimpleBar } from "../../hooks/global-simplebar";
import styled, { css, keyframes, useTheme } from "styled-components";
import { IbcHistoryView } from "./components/ibc-history-view";
import { LayeredHorizontalRadioGroup } from "../../components/radio-group";
import { XAxis, YAxis } from "../../components/axis";
import { DepositModal } from "./components/deposit-modal";
import { MainHeaderLayout } from "./layouts/header";
import { amountToAmbiguousAverage, isRunningInSidePanel } from "../../utils";
import { InExtensionMessageRequester } from "@keplr-wallet/router-extension";
import {
  ChainInfoWithCoreTypes,
  LogAnalyticsEventMsg,
} from "@keplr-wallet/background";
import { BACKGROUND_PORT } from "@keplr-wallet/router";
import { useBuy } from "../../hooks/use-buy";
import { BottomTabsHeightRem } from "../../bottom-tabs";
import { DenomHelper } from "@keplr-wallet/common";

export interface ViewToken {
  token: CoinPretty;
  chainInfo: IChainInfoImpl;
  isFetching: boolean;
  error: QueryError<any> | undefined;
}

export const useIsNotReady = () => {
  const { chainStore, queriesStore } = useStore();

  const query = queriesStore.get(chainStore.chainInfos[0].chainId).cosmos
    .queryRPCStatus;

  return query.response == null && query.error == null;
};

type TabStatus = "available" | "staked";

export const MainPage: FunctionComponent<{
  setIsNotReady: (isNotReady: boolean) => void;
}> = observer(({ setIsNotReady }) => {
  const {
    analyticsStore,
    hugeQueriesStore,
    uiConfigStore,
    keyRingStore,
    priceStore,
  } = useStore();

  const isNotReady = useIsNotReady();
  const intl = useIntl();
  const theme = useTheme();

  const setIsNotReadyRef = useRef(setIsNotReady);
  setIsNotReadyRef.current = setIsNotReady;
  useLayoutEffect(() => {
    setIsNotReadyRef.current(isNotReady);
  }, [isNotReady]);

  const [tabStatus, setTabStatus] = React.useState<TabStatus>("available");

  const availableTotalPrice = useMemo(() => {
    let result: PricePretty | undefined;
    for (const bal of hugeQueriesStore.allKnownBalances) {
      if (bal.price) {
        if (!result) {
          result = bal.price;
        } else {
          result = result.add(bal.price);
        }
      }
    }
    return result;
  }, [hugeQueriesStore.allKnownBalances]);
  const availableTotalPriceEmbedOnlyUSD = useMemo(() => {
    let result: PricePretty | undefined;
    for (const bal of hugeQueriesStore.allKnownBalances) {
      if (!(bal.chainInfo.embedded as ChainInfoWithCoreTypes).embedded) {
        continue;
      }
      if (bal.price) {
        const price = priceStore.calculatePrice(bal.token, "usd");
        if (price) {
          if (!result) {
            result = price;
          } else {
            result = result.add(price);
          }
        }
      }
    }
    return result;
  }, [hugeQueriesStore.allKnownBalances, priceStore]);
  const availableChartWeight = (() => {
    if (!isNotReady && uiConfigStore.isPrivacyMode) {
      if (tabStatus === "available") {
        return 1;
      }
      return 0;
    }

    return availableTotalPrice && !isNotReady
      ? Number.parseFloat(availableTotalPrice.toDec().toString())
      : 0;
  })();
  const stakedTotalPrice = useMemo(() => {
    let result: PricePretty | undefined;
    for (const bal of hugeQueriesStore.delegations) {
      if (bal.price) {
        if (!result) {
          result = bal.price;
        } else {
          result = result.add(bal.price);
        }
      }
    }
    for (const bal of hugeQueriesStore.unbondings) {
      if (bal.viewToken.price) {
        if (!result) {
          result = bal.viewToken.price;
        } else {
          result = result.add(bal.viewToken.price);
        }
      }
    }
    return result;
  }, [hugeQueriesStore.delegations, hugeQueriesStore.unbondings]);
  const stakedTotalPriceEmbedOnlyUSD = useMemo(() => {
    let result: PricePretty | undefined;
    for (const bal of hugeQueriesStore.delegations) {
      if (!(bal.chainInfo.embedded as ChainInfoWithCoreTypes).embedded) {
        continue;
      }
      if (bal.price) {
        const price = priceStore.calculatePrice(bal.token, "usd");
        if (price) {
          if (!result) {
            result = price;
          } else {
            result = result.add(price);
          }
        }
      }
    }
    for (const bal of hugeQueriesStore.unbondings) {
      if (
        !(bal.viewToken.chainInfo.embedded as ChainInfoWithCoreTypes).embedded
      ) {
        continue;
      }
      if (bal.viewToken.price) {
        const price = priceStore.calculatePrice(bal.viewToken.token, "usd");
        if (price) {
          if (!result) {
            result = price;
          } else {
            result = result.add(price);
          }
        }
      }
    }
    return result;
  }, [hugeQueriesStore.delegations, hugeQueriesStore.unbondings, priceStore]);
  const stakedChartWeight = (() => {
    if (!isNotReady && uiConfigStore.isPrivacyMode) {
      if (tabStatus === "staked") {
        return 1;
      }
      return 0;
    }

    return stakedTotalPrice && !isNotReady
      ? Number.parseFloat(stakedTotalPrice.toDec().toString())
      : 0;
  })();

  const lastTotalAvailableAmbiguousAvg = useRef(-1);
  const lastTotalStakedAmbiguousAvg = useRef(-1);
  useEffect(() => {
    if (!isNotReady) {
      const totalAvailableAmbiguousAvg = availableTotalPriceEmbedOnlyUSD
        ? amountToAmbiguousAverage(availableTotalPriceEmbedOnlyUSD)
        : 0;
      const totalStakedAmbiguousAvg = stakedTotalPriceEmbedOnlyUSD
        ? amountToAmbiguousAverage(stakedTotalPriceEmbedOnlyUSD)
        : 0;
      if (
        lastTotalAvailableAmbiguousAvg.current !== totalAvailableAmbiguousAvg ||
        lastTotalStakedAmbiguousAvg.current !== totalStakedAmbiguousAvg
      ) {
        new InExtensionMessageRequester().sendMessage(
          BACKGROUND_PORT,
          new LogAnalyticsEventMsg("user_properties", {
            totalAvailableFiatAvg: totalAvailableAmbiguousAvg,
            totalStakedFiatAvg: totalStakedAmbiguousAvg,
            id: keyRingStore.selectedKeyInfo?.id,
            keyType: keyRingStore.selectedKeyInfo?.insensitive[
              "keyRingType"
            ] as string | undefined,
          })
        );
      }
      lastTotalAvailableAmbiguousAvg.current = totalAvailableAmbiguousAvg;
      lastTotalStakedAmbiguousAvg.current = totalStakedAmbiguousAvg;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    availableTotalPriceEmbedOnlyUSD,
    isNotReady,
    stakedTotalPriceEmbedOnlyUSD,
  ]);

  const [isOpenDepositModal, setIsOpenDepositModal] = React.useState(false);
  const [isOpenBuy, setIsOpenBuy] = React.useState(false);

  const buySupportServiceInfos = useBuy();

  const searchRef = useRef<HTMLInputElement | null>(null);
  const [search, setSearch] = useState("");
  const [isEnteredSearch, setIsEnteredSearch] = useState(false);
  useEffect(() => {
    // Give focus whenever available tab is selected.
    if (!isNotReady && tabStatus === "available") {
      // And clear search text.
      setSearch("");

      if (searchRef.current) {
        searchRef.current.focus({
          preventScroll: true,
        });
      }
    }
  }, [tabStatus, isNotReady]);
  useEffect(() => {
    // Log if a search term is entered at least once.
    if (isEnteredSearch) {
      analyticsStore.logEvent("input_searchAssetOrChain", {
        pageName: "main",
      });
    }
  }, [analyticsStore, isEnteredSearch]);
  useEffect(() => {
    // Log a search term with delay.
    const handler = setTimeout(() => {
      if (isEnteredSearch && search) {
        analyticsStore.logEvent("input_searchAssetOrChain", {
          inputValue: search,
          pageName: "main",
        });
      }
    }, 1000);

    return () => {
      clearTimeout(handler);
    };
  }, [analyticsStore, search, isEnteredSearch]);

  const searchScrollAnim = useSpringValue(0, {
    config: defaultSpringConfig,
  });
  const globalSimpleBar = useGlobarSimpleBar();

  const animatedPrivacyModeHover = useSpringValue(0, {
    config: defaultSpringConfig,
  });

  const [isChangelogModalOpen, setIsChangelogModalOpen] = useState(false);
  useEffect(() => {
    if (uiConfigStore.changelogConfig.showingInfo.length > 0) {
      setIsChangelogModalOpen(true);
    }
  }, [uiConfigStore.changelogConfig.showingInfo.length]);

  const [isRefreshButtonVisible, setIsRefreshButtonVisible] = useState(false);
  const [isRefreshButtonLoading, setIsRefreshButtonLoading] = useState(false);
  useEffect(() => {
    if (!isRunningInSidePanel()) {
      return;
    }

    const scrollElement = globalSimpleBar.ref.current?.getScrollElement();
    if (scrollElement) {
      // 최상단에선 안 보임
      // 그러나 최상단에서 움직임 없이 5초 지나면 보임
      // 스크롤 다운 하면 사라짐
      // 스크롤 업 하면 보임
      let lastScrollTop = 0;
      let lastScrollTime = Date.now();
      const listener = (e: Event) => {
        if (e.target) {
          const { scrollTop } = e.target as HTMLDivElement;

          const gap = scrollTop - lastScrollTop;
          if (gap > 0) {
            setIsRefreshButtonVisible(false);
          } else if (gap < 0) {
            setIsRefreshButtonVisible(true);
          }

          lastScrollTop = scrollTop;
          lastScrollTime = Date.now();
        }
      };
      scrollElement.addEventListener("scroll", listener);

      const interval = setInterval(() => {
        if (lastScrollTop <= 10) {
          if (Date.now() - lastScrollTime >= 5000) {
            setIsRefreshButtonVisible(true);
          }
        }
      }, 1000);

      return () => {
        scrollElement.removeEventListener("scroll", listener);
        clearInterval(interval);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <MainHeaderLayout isNotReady={isNotReady}>
      {/* side panel에서만 보여준다. 보여주는 로직은 isRefreshButtonVisible를 다루는 useEffect를 참고. refresh button이 로딩중이면 모조건 보여준다. */}
      <RefreshButton
        visible={
          !isNotReady &&
          isRunningInSidePanel() &&
          (isRefreshButtonVisible || isRefreshButtonLoading)
        }
        onSetIsLoading={(isLoading) => {
          setIsRefreshButtonLoading(isLoading);
        }}
      />
      <Box paddingX="0.75rem" paddingBottom="1.5rem">
        <Stack gutter="0.75rem">
          <YAxis alignX="center">
            <LayeredHorizontalRadioGroup
              items={[
                {
                  key: "available",
                  text: intl.formatMessage({
                    id: "page.main.components.string-toggle.available-tab",
                  }),
                },
                {
                  key: "staked",
                  text: intl.formatMessage({
                    id: "page.main.components.string-toggle.staked-tab",
                  }),
                },
              ]}
              selectedKey={tabStatus}
              onSelect={(key) => {
                analyticsStore.logEvent("click_main_tab", {
                  tabName: key,
                });

                setTabStatus(key as TabStatus);
              }}
              itemMinWidth="5.75rem"
              isNotReady={isNotReady}
            />
          </YAxis>
          <CopyAddress
            onClick={() => {
              analyticsStore.logEvent("click_copyAddress");
              setIsOpenDepositModal(true);
            }}
            isNotReady={isNotReady}
          />
          <Box position="relative">
            <DualChart
              first={{
                weight: availableChartWeight,
              }}
              second={{
                weight: stakedChartWeight,
              }}
              highlight={tabStatus === "available" ? "first" : "second"}
              isNotReady={isNotReady}
            />
            <Box
              position="absolute"
              style={{
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,

                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Gutter size="2rem" />
              <Box
                alignX={isNotReady ? "center" : undefined}
                onHoverStateChange={(isHover) => {
                  if (!isNotReady) {
                    animatedPrivacyModeHover.start(isHover ? 1 : 0);
                  } else {
                    animatedPrivacyModeHover.set(0);
                  }
                }}
              >
                <Skeleton isNotReady={isNotReady}>
                  <YAxis alignX="center">
                    <XAxis alignY="center">
                      <Subtitle3
                        style={{
                          color: ColorPalette["gray-300"],
                        }}
                      >
                        {tabStatus === "available"
                          ? intl.formatMessage({
                              id: "page.main.chart.available",
                            })
                          : intl.formatMessage({
                              id: "page.main.chart.staked",
                            })}
                      </Subtitle3>
                      <animated.div
                        style={{
                          position: "relative",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          height: "1px",
                          overflowX: "clip",
                          width: animatedPrivacyModeHover.to(
                            (v) => `${v * 1.25}rem`
                          ),
                        }}
                      >
                        <Styles.PrivacyModeButton
                          as={animated.div}
                          style={{
                            position: "absolute",
                            right: 0,
                            cursor: "pointer",
                            opacity: animatedPrivacyModeHover.to((v) =>
                              Math.max(0, (v - 0.3) * (10 / 3))
                            ),
                            marginTop: "2px",
                          }}
                          onClick={(e) => {
                            e.preventDefault();

                            uiConfigStore.toggleIsPrivacyMode();
                          }}
                        >
                          {uiConfigStore.isPrivacyMode ? (
                            <EyeSlashIcon width="1rem" height="1rem" />
                          ) : (
                            <EyeIcon width="1rem" height="1rem" />
                          )}
                        </Styles.PrivacyModeButton>
                      </animated.div>
                    </XAxis>
                  </YAxis>
                </Skeleton>
                <Gutter size="0.5rem" />
                <Skeleton isNotReady={isNotReady} dummyMinWidth="8.125rem">
                  <H1
                    style={{
                      color:
                        theme.mode === "light"
                          ? ColorPalette["gray-700"]
                          : ColorPalette["gray-10"],
                      textAlign: "center",
                    }}
                  >
                    {uiConfigStore.hideStringIfPrivacyMode(
                      tabStatus === "available"
                        ? availableTotalPrice?.toString() || "-"
                        : stakedTotalPrice?.toString() || "-",
                      4
                    )}
                  </H1>
                </Skeleton>
              </Box>
            </Box>
          </Box>
          {tabStatus === "available" ? (
            <Buttons
              onClickDeposit={() => {
                setIsOpenDepositModal(true);
                analyticsStore.logEvent("click_deposit");
              }}
              onClickBuy={() => setIsOpenBuy(true)}
              isNotReady={isNotReady}
            />
          ) : null}

          {tabStatus === "staked" && !isNotReady ? (
            <StakeWithKeplrDashboardButton
              type="button"
              onClick={(e) => {
                e.preventDefault();
                analyticsStore.logEvent("click_keplrDashboard", {
                  tabName: tabStatus,
                });

                browser.tabs.create({
                  url: "https://wallet.keplr.app/?modal=staking",
                });
              }}
            >
              <FormattedMessage id="page.main.chart.stake-with-keplr-dashboard-button" />
              <Box color={ColorPalette["gray-300"]} marginLeft="0.5rem">
                <ArrowTopRightOnSquareIcon width="1rem" height="1rem" />
              </Box>
            </StakeWithKeplrDashboardButton>
          ) : null}

          <ClaimAll isNotReady={isNotReady} />

          <IbcHistoryView isNotReady={isNotReady} />
          {/*
            IbcHistoryView 자체가 list를 그리기 때문에 여기서 gutter를 처리하기는 힘들다.
            그러므로 IbcHistoryView에서 gutter를 처리하도록 한다.
          */}
          <Gutter size="0" />

          {tabStatus === "available" && !isNotReady ? (
            <StakeWithKeplrDashboardButton
              type="button"
              onClick={(e) => {
                e.preventDefault();
                analyticsStore.logEvent("click_keplrDashboard", {
                  tabName: tabStatus,
                });

                browser.tabs.create({
                  url: "https://wallet.keplr.app/",
                });
              }}
            >
              <FormattedMessage id="page.main.chart.manage-portfolio-in-keplr-dashboard" />
              <Box color={ColorPalette["gray-300"]} marginLeft="0.5rem">
                <ArrowTopRightOnSquareIcon width="1rem" height="1rem" />
              </Box>
            </StakeWithKeplrDashboardButton>
          ) : null}
          {!isNotReady ? (
            <Stack gutter="0.75rem">
              {tabStatus === "available" ? (
                <SearchTextInput
                  ref={searchRef}
                  value={search}
                  onChange={(e) => {
                    e.preventDefault();

                    setSearch(e.target.value);

                    if (e.target.value.trim().length > 0) {
                      if (!isEnteredSearch) {
                        setIsEnteredSearch(true);
                      }

                      const simpleBarScrollRef =
                        globalSimpleBar.ref.current?.getScrollElement();
                      if (
                        simpleBarScrollRef &&
                        simpleBarScrollRef.scrollTop < 218
                      ) {
                        searchScrollAnim.start(218, {
                          from: simpleBarScrollRef.scrollTop,
                          onChange: (anim: any) => {
                            // XXX: 이거 실제 파라미터랑 타입스크립트 인터페이스가 다르다...???
                            const v = anim.value != null ? anim.value : anim;
                            if (typeof v === "number") {
                              simpleBarScrollRef.scrollTop = v;
                            }
                          },
                        });
                      }
                    }
                  }}
                  placeholder={intl.formatMessage({
                    id: "page.main.search-placeholder",
                  })}
                />
              ) : null}
            </Stack>
          ) : null}

          {/*
            AvailableTabView, StakedTabView가 컴포넌트로 빠지면서 밑의 얘들의 각각의 item들에는 stack이 안먹힌다는 걸 주의
            각 컴포넌트에서 알아서 gutter를 처리해야한다.
           */}
          {tabStatus === "available" ? (
            <AvailableTabView
              search={search}
              isNotReady={isNotReady}
              onClickGetStarted={() => {
                setIsOpenDepositModal(true);
              }}
            />
          ) : (
            <StakedTabView />
          )}

          {tabStatus === "available" &&
          uiConfigStore.isDeveloper &&
          !isNotReady ? (
            <IBCTransferView />
          ) : null}
        </Stack>
      </Box>

      <Modal
        isOpen={isOpenDepositModal}
        align="bottom"
        close={() => setIsOpenDepositModal(false)}
        /* Simplebar를 사용하면 트랜지션이 덜덜 떨리는 문제가 있다... */
        forceNotUseSimplebar={true}
      >
        <DepositModal close={() => setIsOpenDepositModal(false)} />
      </Modal>

      <Modal
        isOpen={isOpenBuy}
        align="bottom"
        close={() => setIsOpenBuy(false)}
      >
        <BuyCryptoModal
          close={() => setIsOpenBuy(false)}
          buySupportServiceInfos={buySupportServiceInfos}
        />
      </Modal>

      <Modal
        isOpen={isChangelogModalOpen}
        close={() => {
          // 꼭 모달 안에서 close 버튼을 눌러야만 닫을 수 있다.
          // setIsChangelogModalOpen(false);
        }}
        onCloseTransitionEnd={() => {
          uiConfigStore.changelogConfig.clearLastInfo();
        }}
        align="center"
      >
        <UpdateNoteModal
          close={() => {
            setIsChangelogModalOpen(false);
          }}
          updateNotePageData={(() => {
            const res: UpdateNotePageData[] = [];
            for (const info of uiConfigStore.changelogConfig.showingInfo) {
              for (const scene of info.scenes) {
                res.push({
                  title: scene.title,
                  image:
                    scene.image && scene.aspectRatio
                      ? {
                          default: scene.image.default,
                          light: scene.image.light,
                          aspectRatio: scene.aspectRatio,
                        }
                      : undefined,
                  paragraph: scene.paragraph,
                  isSidePanelBeta: info.isSidePanelBeta,
                });
              }
            }

            return res;
          })()}
        />
      </Modal>
    </MainHeaderLayout>
  );
});

const Styles = {
  // hover style을 쉽게 넣으려고 그냥 styled-component로 만들었다.
  PrivacyModeButton: styled.div`
    color: ${(props) =>
      props.theme.mode === "light"
        ? ColorPalette["gray-300"]
        : ColorPalette["gray-400"]};

    &:hover {
      color: ${(props) =>
        props.theme.mode === "light"
          ? ColorPalette["gray-200"]
          : ColorPalette["gray-300"]};
    }
  `,
};

const Rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const RotateIcon = styled.svg<{
  isLoading: boolean;
}>`
  ${({ isLoading }) => {
    if (isLoading) {
      return css`
        animation: ${Rotate} 1.25s linear infinite;
        animation-play-state: ${isLoading ? "running" : "paused"};
      `;
    }
  }}
`;

const visibleTranslateY = -40;
const invisibleTranslateY = 100;
const RefreshButton: FunctionComponent<{
  visible: boolean;

  onSetIsLoading: (isLoading: boolean) => void;
}> = observer(({ visible, onSetIsLoading }) => {
  const { chainStore, queriesStore, accountStore, priceStore } = useStore();

  const theme = useTheme();

  const translateY = useSpringValue(
    visible ? visibleTranslateY : invisibleTranslateY,
    {
      config: defaultSpringConfig,
    }
  );
  useEffect(() => {
    translateY.start(visible ? visibleTranslateY : invisibleTranslateY);
  }, [translateY, visible]);

  const onSetIsLoadingRef = useRef(onSetIsLoading);
  onSetIsLoadingRef.current = onSetIsLoading;

  const [isLoading, _setIsLoading] = useState(false);
  const setIsLoading = (isLoading: boolean) => {
    _setIsLoading(isLoading);
    onSetIsLoadingRef.current(isLoading);
  };

  const refresh = async () => {
    if (isLoading) {
      return;
    }

    setIsLoading(true);

    try {
      const promises: Promise<unknown>[] = [];

      promises.push(priceStore.waitFreshResponse());
      for (const chainInfo of chainStore.chainInfosInUI) {
        const account = accountStore.getAccount(chainInfo.chainId);

        if (
          !chainStore.isEvmChain(chainInfo.chainId) &&
          account.bech32Address !== ""
        ) {
          const queries = queriesStore.get(chainInfo.chainId);
          const queryBalance = queries.queryBalances.getQueryBech32Address(
            account.bech32Address
          );
          const queryRewards =
            queries.cosmos.queryRewards.getQueryBech32Address(
              account.bech32Address
            );
          // XXX: 얘는 구조상 waitFreshResponse()가 안되서 일단 쿼리가 끝인지 아닌지는 무시한다.
          queryBalance.fetch();

          promises.push(queryRewards.waitFreshResponse());
        }

        if (
          chainStore.isEvmChain(chainInfo.chainId) &&
          account.ethereumHexAddress
        ) {
          const queries = queriesStore.get(chainInfo.chainId);
          const queryBalance = queries.queryBalances.getQueryEthereumHexAddress(
            account.ethereumHexAddress
          );
          // XXX: 얘는 구조상 waitFreshResponse()가 안되서 일단 쿼리가 끝인지 아닌지는 무시한다.
          queryBalance.fetch();

          for (const currency of chainInfo.currencies) {
            const query = queriesStore
              .get(chainInfo.chainId)
              .queryBalances.getQueryEthereumHexAddress(
                account.ethereumHexAddress
              );

            const denomHelper = new DenomHelper(currency.coinMinimalDenom);
            if (denomHelper.type === "erc20") {
              // XXX: 얘는 구조상 waitFreshResponse()가 안되서 일단 쿼리가 끝인지 아닌지는 무시한다.
              query.fetch();
            }
          }
        }
      }

      for (const chainInfo of chainStore.chainInfosInUI) {
        const account = accountStore.getAccount(chainInfo.chainId);

        if (account.bech32Address === "") {
          continue;
        }
        const queries = queriesStore.get(chainInfo.chainId);
        const queryUnbonding =
          queries.cosmos.queryUnbondingDelegations.getQueryBech32Address(
            account.bech32Address
          );
        const queryDelegation =
          queries.cosmos.queryDelegations.getQueryBech32Address(
            account.bech32Address
          );

        promises.push(queryUnbonding.waitFreshResponse());
        promises.push(queryDelegation.waitFreshResponse());
      }

      await Promise.all([
        Promise.all(promises),
        new Promise((resolve) => setTimeout(resolve, 2000)),
      ]);
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      onClick={(e) => {
        e.preventDefault();

        refresh();
      }}
      style={{
        position: "fixed",
        marginBottom: BottomTabsHeightRem,
        bottom: 0,
        zIndex: 10,

        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",

        cursor: isLoading ? "progress" : "pointer",
      }}
    >
      <animated.div
        style={{
          padding: "0.75rem 1rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",

          borderRadius: "999999px",
          background:
            theme.mode === "light"
              ? ColorPalette["white"]
              : ColorPalette["gray-500"],
          boxShadow:
            theme.mode === "light"
              ? "0px 4px 12px 0px rgba(0, 0, 0, 0.12)"
              : "0px 0px 24px 0px rgba(0, 0, 0, 0.25)",

          translateY: translateY.to((v) => `${v}%`),
        }}
      >
        <Subtitle4
          color={
            theme.mode === "light"
              ? ColorPalette["gray-600"]
              : ColorPalette["gray-50"]
          }
        >
          Refresh
        </Subtitle4>
        <Gutter size="0.25rem" />
        <RotateIcon
          isLoading={isLoading}
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="none"
          stroke="none"
          viewBox="0 0 16 16"
        >
          <path
            stroke={
              theme.mode === "light"
                ? ColorPalette["gray-600"]
                : ColorPalette["gray-50"]
            }
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.33"
            d="M11.182 6.232h3.328v0M2.49 13.095V9.768m0 0h3.328m-3.329 0l2.12 2.122a5.5 5.5 0 009.202-2.466M3.188 6.577a5.5 5.5 0 019.202-2.467l2.121 2.121m0-3.327V6.23"
          />
        </RotateIcon>
      </animated.div>
    </div>
  );
});
