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
  RefreshButton,
} from "./components";
import { Stack } from "../../components/stack";
import { CoinPretty, Dec, PricePretty } from "@keplr-wallet/unit";
import { EyeIcon, EyeSlashIcon, RightArrowIcon } from "../../components/icon";
import { Box } from "../../components/box";
import { Modal } from "../../components/modal";
import { Gutter } from "../../components/gutter";
import { Body2 } from "../../components/typography";
import { ColorPalette } from "../../styles";
import { SpendableAssetView } from "./spendable";
import { animated, useSpringValue } from "@react-spring/web";
import { defaultSpringConfig } from "../../styles/spring";
import { IChainInfoImpl, QueryError } from "@keplr-wallet/stores";
import { Skeleton } from "../../components/skeleton";
import { useIntl } from "react-intl";
import { usePageSimpleBar } from "../../hooks/page-simplebar";
import styled from "styled-components";
import { IbcHistoryView } from "./components/ibc-history-view";
import { XAxis } from "../../components/axis";
import { MainHeaderLayout } from "./layouts/header";
import { amountToAmbiguousAverage } from "../../utils";
import { InExtensionMessageRequester } from "@keplr-wallet/router-extension";
import {
  ChainInfoWithCoreTypes,
  LogAnalyticsEventMsg,
} from "@keplr-wallet/background";
import { BACKGROUND_PORT } from "@keplr-wallet/router";
import { useBuySupportServiceInfos } from "../../hooks/use-buy-support-service-infos";
import { ModularChainInfo } from "@keplr-wallet/types";
import { MainH1 } from "../../components/typography/main-h1";
import { LockIcon } from "../../components/icon/lock";
import { DepositModal } from "./components/deposit-modal";
import { RewardsCard } from "./components/rewards-card";
import { UIConfigStore } from "../../stores/ui-config";
import { COMMON_HOVER_OPACITY } from "../../styles/constant";
import { EmptyStateButtonRow } from "./components/empty-state-button-row";
import { useNavigate } from "react-router";
import { useTotalPrices } from "../../hooks/use-total-prices";
import SimpleBarCore from "simplebar-core";

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

const TotalPriceVisibilityHandler: FunctionComponent<{
  totalPriceSectionRef: React.RefObject<HTMLDivElement | null>;
  setIsTotalPriceVisible: (visible: boolean) => void;
}> = ({ totalPriceSectionRef, setIsTotalPriceVisible }) => {
  const pageSimpleBar = usePageSimpleBar();

  const [simpleBarRefState, setSimpleBarRefState] =
    useState<SimpleBarCore | null>(null);
  useEffect(() => {
    return pageSimpleBar.refChangeHandler(setSimpleBarRefState);
  }, [pageSimpleBar]);

  useEffect(() => {
    const scrollElement = simpleBarRefState?.getScrollElement() ?? null;
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
        root: scrollElement,
        threshold: 0.01,
        rootMargin: "0px 0px 0px 0px",
      }
    );
    observer.observe(target);
    return () => {
      observer.disconnect();
    };
  }, [simpleBarRefState, setIsTotalPriceVisible, totalPriceSectionRef]);

  return null;
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
    return stakedTotalPrice?.toDec().gt(new Dec(0));
  }, [stakedTotalPrice]);

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

      // 한번 모달이 나타난 다음에는 껏다켜도 모달이 나타나지 않도록한다.
      // popup, side panel에서 window의 close 이벤트의 동작 방식이 달라서
      // 각각 처리하기 귀찮고 다른 변수도 있을 수 있기 때문에 로직에서 확실히 처리.
      uiConfigStore.changelogConfig.forceClearNext();
    }
  }, [uiConfigStore.changelogConfig.showingInfo.length]);

  const forcePreventScrollRefreshButtonVisible = useRef(false);

  return (
    <MainHeaderLayout
      isNotReady={isNotReady}
      isShowTotalPrice={!isTotalPriceVisible}
    >
      <TotalPriceVisibilityHandler
        totalPriceSectionRef={totalPriceSectionRef}
        setIsTotalPriceVisible={setIsTotalPriceVisible}
      />
      <RefreshButton
        forcePreventScrollRefreshButtonVisible={
          forcePreventScrollRefreshButtonVisible
        }
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
                  subtitle: scene.subtitle,
                  image:
                    scene.image && scene.aspectRatio
                      ? {
                          default: scene.image.default,
                          light: scene.image.light,
                          aspectRatio: scene.aspectRatio,
                        }
                      : undefined,
                  paragraph: scene.paragraph,
                  links: scene.links,
                  closeText: scene.closeText,
                  closeLink: scene.closeLink,
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
