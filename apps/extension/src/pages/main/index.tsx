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
  IBCTransferView,
  BuyCryptoModal,
  UpdateNoteModal,
  UpdateNotePageData,
  SpendableCard,
} from "./components";
import { Stack } from "../../components/stack";
import { CoinPretty, Dec, PricePretty } from "@keplr-wallet/unit";
import { EyeIcon, EyeSlashIcon, RightArrowIcon } from "../../components/icon";
import { Box } from "../../components/box";
import { Modal } from "../../components/modal";
import { Gutter } from "../../components/gutter";
import { Body2, Subtitle4 } from "../../components/typography";
import { ColorPalette, SidePanelMaxWidth } from "../../styles";
import { SpendableAssetView } from "./spendable";
import { animated, useSpringValue, easings } from "@react-spring/web";
import { defaultSpringConfig } from "../../styles/spring";
import { IChainInfoImpl, QueryError } from "@keplr-wallet/stores";
import { Skeleton } from "../../components/skeleton";
import { useIntl } from "react-intl";
import { useGlobalSimpleBar } from "../../hooks/global-simplebar";
import styled, { useTheme } from "styled-components";
import { IbcHistoryView } from "./components/ibc-history-view";
import { XAxis } from "../../components/axis";
import { MainHeaderLayout } from "./layouts/header";
import { amountToAmbiguousAverage, isRunningInSidePanel } from "../../utils";
import { InExtensionMessageRequester } from "@keplr-wallet/router-extension";
import {
  ChainInfoWithCoreTypes,
  LogAnalyticsEventMsg,
} from "@keplr-wallet/background";
import { BACKGROUND_PORT } from "@keplr-wallet/router";
import { useBuySupportServiceInfos } from "../../hooks/use-buy-support-service-infos";
import { BottomTabsHeightRem } from "../../bottom-tabs";
import { DenomHelper } from "@keplr-wallet/common";
import { ModularChainInfo } from "@keplr-wallet/types";
import { INITIA_CHAIN_ID, NEUTRON_CHAIN_ID } from "../../config.ui";
import { MainH1 } from "../../components/typography/main-h1";
import { LockIcon } from "../../components/icon/lock";
import { DepositModal } from "./components/deposit-modal";
import { RewardsCard } from "./components/rewards-card";
import { UIConfigStore } from "../../stores/ui-config";
import { COMMON_HOVER_OPACITY } from "../../styles/constant";
import { EmptyStateButtonRow } from "./components/empty-state-button-row";
import { useNavigate } from "react-router";
import { useTotalPrices } from "../../hooks/use-total-prices";

export interface ViewToken {
  token: CoinPretty;
  chainInfo: IChainInfoImpl | ModularChainInfo;
  isFetching: boolean;
  error: QueryError<any> | undefined;
}

export const useIsNotReady = () => {
  const { chainStore, queriesStore } = useStore();

  const query = queriesStore.get(chainStore.chainInfos[0].chainId).cosmos
    .queryRPCStatus;

  return query.response == null && query.error == null;
};

export const MainPage: FunctionComponent<{
  setIsNotReady: (isNotReady: boolean) => void;
}> = observer(({ setIsNotReady }) => {
  const {
    hugeQueriesStore,
    uiConfigStore,
    keyRingStore,
    priceStore,
    mainHeaderAnimationStore,
  } = useStore();

  const isNotReady = useIsNotReady();
  const navigate = useNavigate();

  const setIsNotReadyRef = useRef(setIsNotReady);
  setIsNotReadyRef.current = setIsNotReady;
  useLayoutEffect(() => {
    setIsNotReadyRef.current(isNotReady);
  }, [isNotReady]);

  const availableTotalPriceEmbedOnlyUSD = useMemo(() => {
    let result: PricePretty | undefined;
    for (const bal of hugeQueriesStore.allKnownBalances) {
      // TODO: 이거 starknet에서도 embedded를 확인할 수 있도록 수정해야함.
      if (!("currencies" in bal.chainInfo)) {
        continue;
      }
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

  const {
    spendableTotalPrice,
    stakedTotalPrice,
    stakedTotalPriceEmbedOnlyUSD,
    totalPrice,
  } = useTotalPrices();

  const stakedPercentage = useMemo(() => {
    if (!totalPrice || !stakedTotalPrice) {
      return 0;
    }
    const totalDec = totalPrice.toDec();
    if (totalDec.isZero()) {
      return 0;
    }
    const stakedDec = stakedTotalPrice.toDec();
    return parseFloat(stakedDec.quo(totalDec).mul(new Dec(100)).toString());
  }, [totalPrice, stakedTotalPrice]);

  const showRewardsCard = useMemo(() => {
    return (
      hugeQueriesStore.stakables.some((token) =>
        token.token.toDec().gt(new Dec(0))
      ) && stakedTotalPrice?.toDec().gt(new Dec(0))
    );
  }, [hugeQueriesStore.stakables, stakedTotalPrice]);

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

  const buySupportServiceInfos = useBuySupportServiceInfos();

  const globalSimpleBar = useGlobalSimpleBar();

  const totalPriceSectionRef = useRef<HTMLDivElement | null>(null);
  const [isTotalPriceVisible, setIsTotalPriceVisible] = useState(true);

  useEffect(() => {
    mainHeaderAnimationStore.setMainPageTotalPriceVisible(isTotalPriceVisible);
  }, [isTotalPriceVisible, mainHeaderAnimationStore]);

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
  const forcePreventScrollRefreshButtonVisible = useRef(false);
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
            if (!forcePreventScrollRefreshButtonVisible.current) {
              setIsRefreshButtonVisible(true);
            }
          }

          lastScrollTop = scrollTop;
          lastScrollTime = Date.now();
        }
      };
      scrollElement.addEventListener("scroll", listener);

      const interval = setInterval(() => {
        if (lastScrollTop <= 10) {
          if (Date.now() - lastScrollTime >= 5000) {
            if (!forcePreventScrollRefreshButtonVisible.current) {
              setIsRefreshButtonVisible(true);
            } else {
              lastScrollTime = Date.now();
            }
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

  useEffect(() => {
    const scrollElement =
      globalSimpleBar.ref.current?.getScrollElement() ?? null;
    const target = totalPriceSectionRef.current;

    if (!target) {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry) {
          setIsTotalPriceVisible(entry.isIntersecting);
        }
      },
      {
        //globalSimpleBar영역이 전체 페이지이기 때문에 상단 header 높이만큼 rootMargin에서 빼줘야함
        root: scrollElement,
        threshold: 0.01,
        rootMargin: "-60px 0px 0px 0px",
      }
    );
    observer.observe(target);
    return () => {
      observer.disconnect();
    };
  }, [globalSimpleBar]);

  return (
    <MainHeaderLayout
      isNotReady={isNotReady}
      isShowTotalPrice={!isTotalPriceVisible}
    >
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

      <Box padding="1.25rem">
        <Box
          ref={totalPriceSectionRef}
          style={{
            width: "fit-content",
          }}
          onHoverStateChange={(isHover) => {
            if (!isNotReady) {
              animatedPrivacyModeHover.start(isHover ? 1 : 0);
            } else {
              animatedPrivacyModeHover.set(0);
            }
          }}
          onClick={(e) => {
            e.preventDefault();
            uiConfigStore.toggleIsPrivacyMode();
          }}
          cursor="pointer"
        >
          <XAxis alignY="center">
            <Skeleton isNotReady={isNotReady} dummyMinWidth="6rem">
              <MainH1>
                {uiConfigStore.hideStringIfPrivacyMode(
                  totalPrice?.toString() || "-",
                  4
                )}
              </MainH1>
            </Skeleton>

            <animated.div
              style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                height: "1px",
                overflowX: "clip",
                width: animatedPrivacyModeHover.to((v) => `${v * 1.5}rem`),
              }}
            >
              <PrivacyModeButtonStyles.PrivacyModeButton
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
              >
                {uiConfigStore.isPrivacyMode ? (
                  <EyeSlashIcon width="1rem" height="1rem" />
                ) : (
                  <EyeIcon width="1rem" height="1rem" />
                )}
              </PrivacyModeButtonStyles.PrivacyModeButton>
            </animated.div>
          </XAxis>
        </Box>

        <Gutter size="0.75rem" />
        {stakedTotalPrice && stakedTotalPrice.toDec().gt(new Dec(0)) && (
          <StakedBalanceTitle
            isNotReady={isNotReady}
            uiConfigStore={uiConfigStore}
            stakedTotalPrice={stakedTotalPrice}
            stakedPercentage={stakedPercentage}
            preventHeaderAnimation={!isTotalPriceVisible}
          />
        )}
      </Box>

      <Box paddingX="0.75rem" paddingBottom="1.5rem">
        <Stack gutter="1.5rem">
          {showRewardsCard ? (
            <XAxis>
              <SpendableCard
                spendableTotalPrice={spendableTotalPrice}
                isNotReady={isNotReady}
                onClickDeposit={() => {
                  setIsOpenDepositModal(true);
                }}
                onClickSwapBtn={() => {
                  if (!isTotalPriceVisible) {
                    navigate(`/ibc-swap`);
                    return;
                  }
                  mainHeaderAnimationStore.triggerShowForMainHeaderPrice();
                  navigate(`/ibc-swap`);
                }}
              />
              <Gutter size="0.75rem" />
              <RewardsCard isNotReady={isNotReady} />
            </XAxis>
          ) : (
            <XAxis>
              <EmptyStateButtonRow
                onClickDeposit={() => {
                  setIsOpenDepositModal(true);
                }}
              />
            </XAxis>
          )}
          <IbcHistoryView isNotReady={isNotReady} />
          {/*
            IbcHistoryView 자체가 list를 그리기 때문에 여기서 gutter를 처리하기는 힘들다.
            그러므로 IbcHistoryView에서 gutter를 처리하도록 한다.
          */}
          <Gutter size="0" />

          {/*
            SpendableAssetView, StakedTabView가 컴포넌트로 빠지면서 밑의 얘들의 각각의 item들에는 stack이 안먹힌다는 걸 주의
            각 컴포넌트에서 알아서 gutter를 처리해야한다.
           */}
          <SpendableAssetView
            isNotReady={isNotReady}
            onClickGetStarted={() => {
              setIsOpenDepositModal(true);
            }}
            onClickBuy={() => {
              setIsOpenBuy(true);
            }}
            onMoreTokensClosed={() => {
              // token list가 접히면서 scroll height가 작아지게 된다.
              // scroll height가 작아지는 것은 위로 스크롤 하는 것과 같은 효과를 내기 때문에
              // 아래와같은 처리가 없으면 token list를 접으면 refesh 버튼이 무조건 나타나게 된다.
              // 이게 약간 어색해보이므로 token list를 접을때 1.5초 동안 refresh 버튼 기능을 없애버린다.
              forcePreventScrollRefreshButtonVisible.current = true;
              setTimeout(() => {
                forcePreventScrollRefreshButtonVisible.current = false;
              }, 1500);
            }}
            hideNumInTitle={uiConfigStore.isPrivacyMode}
          />

          {uiConfigStore.isDeveloper && !isNotReady ? (
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

export const PrivacyModeButtonStyles = {
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

const visibleTranslateY = -40;
const invisibleTranslateY = 100;
const RefreshButton: FunctionComponent<{
  visible: boolean;

  onSetIsLoading: (isLoading: boolean) => void;
}> = observer(({ visible, onSetIsLoading }) => {
  const {
    chainStore,
    queriesStore,
    starknetQueriesStore,
    bitcoinQueriesStore,
    accountStore,
    priceStore,
  } = useStore();

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
      for (const modularChainInfo of chainStore.modularChainInfosInUI) {
        const isNeutron = modularChainInfo.chainId === NEUTRON_CHAIN_ID;

        if (isNeutron) {
          const account = accountStore.getAccount(modularChainInfo.chainId);
          const queries = queriesStore.get(modularChainInfo.chainId);
          const queryNeutronRewardInner =
            queries.cosmwasm.queryNeutronStakingRewards.getRewardFor(
              account.bech32Address
            );
          promises.push(queryNeutronRewardInner.waitFreshResponse());
        } else if ("cosmos" in modularChainInfo) {
          const chainInfo = chainStore.getChain(modularChainInfo.chainId);
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
            const queryBalance =
              queries.queryBalances.getQueryEthereumHexAddress(
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
        } else if ("starknet" in modularChainInfo) {
          const account = accountStore.getAccount(modularChainInfo.chainId);

          if (account.starknetHexAddress) {
            const queries = starknetQueriesStore.get(modularChainInfo.chainId);

            for (const currency of chainStore
              .getModularChainInfoImpl(modularChainInfo.chainId)
              .getCurrencies("starknet")) {
              const query = queries.queryStarknetERC20Balance.getBalance(
                modularChainInfo.chainId,
                chainStore,
                account.starknetHexAddress,
                currency.coinMinimalDenom
              );

              if (query) {
                // XXX: 얘는 구조상 waitFreshResponse()가 안되서 일단 쿼리가 끝인지 아닌지는 무시한다.
                query.fetch();
              }
            }

            // refresh starknet staking info
            const stakingInfo = queries.stakingInfoManager.getStakingInfo(
              account.starknetHexAddress
            );
            promises.push(stakingInfo.waitFreshResponse());
          }
        } else if ("bitcoin" in modularChainInfo) {
          const account = accountStore.getAccount(modularChainInfo.chainId);
          const currency = modularChainInfo.bitcoin.currencies[0];

          if (account.bitcoinAddress) {
            const queries = bitcoinQueriesStore.get(modularChainInfo.chainId);
            const queryBalance = queries.queryBitcoinBalance.getBalance(
              modularChainInfo.chainId,
              chainStore,
              account.bitcoinAddress.bech32Address,
              currency.coinMinimalDenom
            );

            if (queryBalance) {
              queryBalance.fetch();
            }
          }
        }
      }

      for (const chainInfo of chainStore.chainInfosInUI) {
        const account = accountStore.getAccount(chainInfo.chainId);
        const isInitia = chainInfo.chainId === INITIA_CHAIN_ID;

        if (account.bech32Address === "") {
          continue;
        }
        const queries = queriesStore.get(chainInfo.chainId);
        const queryUnbonding = isInitia
          ? queries.cosmos.queryInitiaUnbondingDelegations.getQueryBech32Address(
              account.bech32Address
            )
          : queries.cosmos.queryUnbondingDelegations.getQueryBech32Address(
              account.bech32Address
            );
        const queryDelegation = isInitia
          ? queries.cosmos.queryInitiaDelegations.getQueryBech32Address(
              account.bech32Address
            )
          : queries.cosmos.queryDelegations.getQueryBech32Address(
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

  const rotate = useSpringValue(0, {
    config: {
      duration: 1250,
      easing: easings.linear,
    },
  });
  // 밑에서 onRest callback에서 isLoading을 써야하기 때문에 이러한 처리가 필요함.
  const isLoadingRef = useRef(isLoading);
  isLoadingRef.current = isLoading;
  const prevIsLoading = useRef(isLoading);
  useEffect(() => {
    // 이 코드의 목적은 rotate animation을 실행하는데
    // isLoading이 false가 되었을때 마지막 rotate까지는 끝내도록 하기 위해서 따로 작성된 것임.
    if (prevIsLoading.current !== isLoading && isLoading) {
      // prev 값과 비교하지 않으면 최초 mount 시점에서 0~360으로 바로 회전하게 된다.
      if (isLoading) {
        const onRest = () => {
          if (isLoadingRef.current) {
            rotate.start(360, {
              from: 0,
              onRest,
            });
          }
        };

        rotate.start(360, {
          from: 0,
          onRest,
        });
      }
    }

    prevIsLoading.current = isLoading;
  }, [rotate, isLoading]);

  return (
    <animated.div
      onClick={(e) => {
        e.preventDefault();

        refresh();
      }}
      style={{
        pointerEvents: translateY.to((v) =>
          // visible이 false일때는 pointer-events를 none으로 해서 클릭을 막는다.
          // visibleTranslateY / 2는 대충 정한 값임. 이 값보다 작으면 pointer-events를 none으로 해서 클릭을 막는다.
          v >= visibleTranslateY / 2 ? "none" : "auto"
        ),

        position: "fixed",
        marginBottom: BottomTabsHeightRem,
        bottom: 0,
        zIndex: 10,

        width: "100%",
        maxWidth: SidePanelMaxWidth,
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
        <animated.svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="none"
          stroke="none"
          viewBox="0 0 16 16"
          style={{
            transform: rotate.to((v) => `rotate(${v}deg)`),
          }}
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
        </animated.svg>
      </animated.div>
    </animated.div>
  );
});

const StyledBox = styled(Box)`
  cursor: pointer;
  transition: opacity 0.1s ease-in-out;

  &:hover {
    opacity: ${COMMON_HOVER_OPACITY};
  }
`;
function StakedBalanceTitle({
  isNotReady,
  uiConfigStore,
  stakedTotalPrice,
  stakedPercentage,
  preventHeaderAnimation,
}: {
  isNotReady: boolean;
  uiConfigStore: UIConfigStore;
  stakedTotalPrice: PricePretty | undefined;
  stakedPercentage: number;
  preventHeaderAnimation: boolean;
}) {
  const intl = useIntl();
  const navigate = useNavigate();
  const { mainHeaderAnimationStore } = useStore();

  return (
    <Skeleton isNotReady={isNotReady}>
      <StyledBox
        paddingY="0.125rem"
        cursor="pointer"
        onClick={() => {
          if (!preventHeaderAnimation) {
            mainHeaderAnimationStore.triggerShowForMainHeaderPrice();
          }
          navigate("/stake");
        }}
      >
        <XAxis gap="0.25rem" alignY="center">
          <Body2 style={{ color: ColorPalette["gray-300"] }}>
            {intl.formatMessage({
              id: "page.main.balance.staked-balance-title-1",
            })}
          </Body2>
          <LockIcon
            width="1rem"
            height="1rem"
            color={ColorPalette["gray-300"]}
          />
          <Body2 style={{ color: ColorPalette["gray-300"] }}>
            {`${uiConfigStore.hideStringIfPrivacyMode(
              stakedTotalPrice?.toString() || "-",
              4
            )} ${uiConfigStore.hideStringIfPrivacyMode(
              `(${stakedPercentage.toFixed(1)}%)`,
              0
            )} ${intl.formatMessage({
              id: "page.main.balance.staked-balance-title-2",
            })}`}
          </Body2>
          <RightArrowIcon
            width="1rem"
            height="1rem"
            color={ColorPalette["gray-300"]}
          />
        </XAxis>
      </StyledBox>
    </Skeleton>
  );
}
