import React, {
  FunctionComponent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { HeaderLayout } from "../../layouts/header";
import { ProfileButton } from "../../layouts/header/components";
import {
  Buttons,
  ClaimAll,
  MenuBar,
  StringToggle,
  TabStatus,
  CopyAddress,
  CopyAddressModal,
  IBCTransferView,
  BuyCryptoModal,
  StakeWithKeplrDashboardButton,
} from "./components";
import { Stack } from "../../components/stack";
import { CoinPretty, PricePretty } from "@keplr-wallet/unit";
import { ChainInfo } from "@keplr-wallet/types";
import { ArrowTopRightOnSquareIcon, MenuIcon } from "../../components/icon";
import { Box } from "../../components/box";
import { Modal } from "../../components/modal";
import { DualChart } from "./components/chart";
import { Gutter } from "../../components/gutter";
import { H1, Subtitle3 } from "../../components/typography";
import { ColorPalette } from "../../styles";
import { AvailableTabView } from "./available";
import { StakedTabView } from "./staked";
import { SearchTextInput } from "../../components/input";
import { useSpringValue } from "@react-spring/web";
import { defaultSpringConfig } from "../../styles/spring";
import { Columns } from "../../components/column";
import { Tooltip } from "../../components/tooltip";
import { Image } from "../../components/image";
import { QueryError } from "@keplr-wallet/stores";
import { Skeleton } from "../../components/skeleton";
import { FormattedMessage, useIntl } from "react-intl";
import { useGlobarSimpleBar } from "../../hooks/global-simplebar";
import { useTheme } from "styled-components";
import { IbcHistoryView } from "./components/ibc-history-view";

export interface ViewToken {
  token: CoinPretty;
  chainInfo: ChainInfo;
  isFetching: boolean;
  error: QueryError<any> | undefined;
}

export const useIsNotReady = () => {
  const { chainStore, queriesStore } = useStore();

  const query = queriesStore.get(chainStore.chainInfos[0].chainId).cosmos
    .queryRPCStatus;

  return query.response == null && query.error == null;
};

export const MainPage: FunctionComponent = observer(() => {
  const {
    analyticsStore,
    keyRingStore,
    hugeQueriesStore,
    uiConfigStore,
    chainStore,
    accountStore,
    queriesStore,
  } = useStore();

  const isNotReady = useIsNotReady();
  const intl = useIntl();
  const theme = useTheme();

  const [tabStatus, setTabStatus] = React.useState<TabStatus>("available");

  const icnsPrimaryName = (() => {
    if (
      uiConfigStore.icnsInfo &&
      chainStore.hasChain(uiConfigStore.icnsInfo.chainId)
    ) {
      const queries = queriesStore.get(uiConfigStore.icnsInfo.chainId);
      const icnsQuery = queries.icns.queryICNSNames.getQueryContract(
        uiConfigStore.icnsInfo.resolverContractAddress,
        accountStore.getAccount(uiConfigStore.icnsInfo.chainId).bech32Address
      );

      return icnsQuery.primaryName.split(".")[0];
    }
  })();

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
  const availableChartWeight =
    availableTotalPrice && !isNotReady
      ? Number.parseFloat(availableTotalPrice.toDec().toString())
      : 0;
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
  const stakedChartWeight =
    stakedTotalPrice && !isNotReady
      ? Number.parseFloat(stakedTotalPrice.toDec().toString())
      : 0;

  const [isOpenMenu, setIsOpenMenu] = React.useState(false);
  const [isOpenCopyAddress, setIsOpenCopyAddress] = React.useState(false);
  const [isOpenBuy, setIsOpenBuy] = React.useState(false);

  const searchRef = useRef<HTMLInputElement | null>(null);
  const [search, setSearch] = useState("");
  const [isEnteredSearch, setIsEnteredSearch] = useState(false);
  useEffect(() => {
    // Give focus whenever available tab is selected.
    if (!isNotReady && tabStatus === "available") {
      // And clear search text.
      setSearch("");

      if (searchRef.current) {
        searchRef.current.focus();
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

  return (
    <HeaderLayout
      isNotReady={isNotReady}
      title={(() => {
        const name = keyRingStore.selectedKeyInfo?.name || "Keplr Account";

        if (icnsPrimaryName !== "") {
          return (
            <Columns sum={1} alignY="center" gutter="0.25rem">
              <Box>{name}</Box>

              <Tooltip
                content={
                  <div style={{ whiteSpace: "nowrap" }}>
                    ICNS : {icnsPrimaryName}
                  </div>
                }
              >
                <Image
                  alt="icns-icon"
                  src={require(theme.mode === "light"
                    ? "../../public/assets/img/icns-icon-light.png"
                    : "../../public/assets/img/icns-icon.png")}
                  style={{ width: "1rem", height: "1rem" }}
                />
              </Tooltip>
            </Columns>
          );
        }

        return name;
      })()}
      left={
        <Box
          paddingLeft="1rem"
          onClick={() => setIsOpenMenu(true)}
          cursor="pointer"
        >
          <MenuIcon />
        </Box>
      }
      right={<ProfileButton />}
    >
      <Box paddingX="0.75rem" paddingBottom="1.5rem">
        <Stack gutter="0.75rem">
          <StringToggle
            tabStatus={tabStatus}
            setTabStatus={setTabStatus}
            isNotReady={isNotReady}
          />
          <CopyAddress
            onClick={() => {
              analyticsStore.logEvent("click_copyAddress");
              setIsOpenCopyAddress(true);
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
              <Skeleton isNotReady={isNotReady}>
                <Subtitle3
                  style={{
                    color: ColorPalette["gray-300"],
                  }}
                >
                  {tabStatus === "available"
                    ? intl.formatMessage({ id: "page.main.chart.available" })
                    : intl.formatMessage({ id: "page.main.chart.staked" })}
                </Subtitle3>
              </Skeleton>
              <Gutter size="0.5rem" />
              <Skeleton isNotReady={isNotReady} dummyMinWidth="8.125rem">
                <H1
                  style={{
                    color:
                      theme.mode === "light"
                        ? ColorPalette["gray-700"]
                        : ColorPalette["gray-10"],
                  }}
                >
                  {tabStatus === "available"
                    ? availableTotalPrice?.toString() || "-"
                    : stakedTotalPrice?.toString() || "-"}
                </H1>
              </Skeleton>
            </Box>
          </Box>
          {tabStatus === "available" ? (
            <Buttons
              onClickDeposit={() => {
                setIsOpenCopyAddress(true);
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
                  url: "https://wallet.keplr.app",
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
                  url: "https://wallet.keplr.app",
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
                setIsOpenCopyAddress(true);
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
        isOpen={isOpenMenu}
        align="left"
        close={() => setIsOpenMenu(false)}
      >
        <MenuBar close={() => setIsOpenMenu(false)} />
      </Modal>

      <Modal
        isOpen={isOpenCopyAddress}
        align="bottom"
        close={() => setIsOpenCopyAddress(false)}
      >
        <CopyAddressModal close={() => setIsOpenCopyAddress(false)} />
      </Modal>

      <Modal
        isOpen={isOpenBuy}
        align="bottom"
        close={() => setIsOpenBuy(false)}
      >
        <BuyCryptoModal close={() => setIsOpenBuy(false)} />
      </Modal>
    </HeaderLayout>
  );
});
