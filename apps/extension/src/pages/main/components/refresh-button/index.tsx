import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";
import { useSpringValue, animated, easings } from "@react-spring/web";
import { defaultSpringConfig } from "../../../../styles/spring";
import { useTheme } from "styled-components";
import { ColorPalette, SidePanelMaxWidth } from "../../../../styles";
import { Subtitle4 } from "../../../../components/typography";
import { Gutter } from "../../../../components/gutter";
import { BottomTabsHeightRem } from "../../../../bottom-tabs";
import { DenomHelper } from "@keplr-wallet/common";
import { INITIA_CHAIN_ID, NEUTRON_CHAIN_ID } from "../../../../config.ui";
import { usePageSimpleBar } from "../../../../hooks/page-simplebar";
import { isRunningInSidePanel } from "../../../../utils";
import { useIsNotReady } from "../../index";

const visibleTranslateY = -40;
const invisibleTranslateY = 100;

export const RefreshButton: FunctionComponent<{
  forcePreventScrollRefreshButtonVisible: React.MutableRefObject<boolean>;
}> = observer(({ forcePreventScrollRefreshButtonVisible }) => {
  const {
    chainStore,
    queriesStore,
    starknetQueriesStore,
    bitcoinQueriesStore,
    accountStore,
    priceStore,
  } = useStore();

  const isNotReady = useIsNotReady();

  const theme = useTheme();
  const pageSimpleBar = usePageSimpleBar();

  const [isRefreshButtonVisible, setIsRefreshButtonVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 스크롤 핸들러
  useEffect(() => {
    if (!isRunningInSidePanel()) {
      return;
    }

    const scrollElement = pageSimpleBar.ref.current?.getScrollElement();
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

  const visible =
    !isNotReady &&
    isRunningInSidePanel() &&
    (isRefreshButtonVisible || isLoading);

  const translateY = useSpringValue(
    visible ? visibleTranslateY : invisibleTranslateY,
    {
      config: defaultSpringConfig,
    }
  );
  useEffect(() => {
    translateY.start(visible ? visibleTranslateY : invisibleTranslateY);
  }, [translateY, visible]);

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

  if (!isRunningInSidePanel()) {
    return null;
  }

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
