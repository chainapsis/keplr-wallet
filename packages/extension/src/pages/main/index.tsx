import React, { FunctionComponent, useEffect, useRef, useState } from "react";
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
  InternalLinkView,
  BuyCryptoModal,
} from "./components";
import { Stack } from "../../components/stack";
import { CoinPretty, PricePretty } from "@keplr-wallet/unit";
import { ChainInfo } from "@keplr-wallet/types";
import { MenuIcon } from "../../components/icon";
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

export interface ViewToken {
  token: CoinPretty;
  chainInfo: ChainInfo;
}

export const MainPage: FunctionComponent = observer(() => {
  const {
    keyRingStore,
    hugeQueriesStore,
    uiConfigStore,
    chainStore,
    accountStore,
    queriesStore,
  } = useStore();

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

  const availableTotalPrice = (() => {
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
  })();
  const availableChartWeight = availableTotalPrice
    ? Number.parseFloat(availableTotalPrice.toDec().toString())
    : 0;
  const stakedTotalPrice = (() => {
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
      if (bal.price) {
        if (!result) {
          result = bal.price;
        } else {
          result = result.add(bal.price);
        }
      }
    }
    return result;
  })();
  const stakedChartWeight = stakedTotalPrice
    ? Number.parseFloat(stakedTotalPrice.toDec().toString())
    : 0;

  const [isOpenMenu, setIsOpenMenu] = React.useState(false);
  const [isOpenCopyAddress, setIsOpenCopyAddress] = React.useState(false);
  const [isOpenBuy, setIsOpenBuy] = React.useState(false);

  const searchRef = useRef<HTMLInputElement | null>(null);
  const [search, setSearch] = useState("");
  useEffect(() => {
    // Give focus whenever available tab is selected.
    if (tabStatus === "available") {
      // And clear search text.
      setSearch("");

      if (searchRef.current) {
        searchRef.current.focus();
      }
    }
  }, [tabStatus]);

  const searchScrollAnim = useSpringValue(0, {
    config: defaultSpringConfig,
  });

  return (
    <HeaderLayout
      title={(() => {
        const name = keyRingStore.selectedKeyInfo?.name || "Keplr Account";

        if (icnsPrimaryName !== "") {
          return (
            <Columns sum={1} alignY="center" gutter="0.25rem">
              <Box>{name}</Box>
              <Tooltip content={icnsPrimaryName}>
                <Image
                  alt="icns-icon"
                  src={require("../../public/assets/img/icns-icon.png")}
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
      <Box paddingX="0.75rem" paddingBottom="0.5rem">
        <Stack gutter="0.75rem">
          <StringToggle tabStatus={tabStatus} setTabStatus={setTabStatus} />
          <CopyAddress onClick={() => setIsOpenCopyAddress(true)} />
          <Box position="relative">
            <DualChart
              first={{
                weight: availableChartWeight,
              }}
              second={{
                weight: stakedChartWeight,
              }}
              highlight={tabStatus === "available" ? "first" : "second"}
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
              <Subtitle3
                style={{
                  color: ColorPalette["gray-300"],
                }}
              >
                {tabStatus === "available" ? "Total Available" : "Total Staked"}
              </Subtitle3>
              <Gutter size="0.5rem" />
              <H1
                style={{
                  color: ColorPalette["gray-10"],
                }}
              >
                {tabStatus === "available"
                  ? availableTotalPrice?.toString() || "-"
                  : stakedTotalPrice?.toString() || "-"}
              </H1>
            </Box>
          </Box>
          {tabStatus === "available" ? (
            <Buttons
              onClickDeposit={() => setIsOpenCopyAddress(true)}
              onClickBuy={() => setIsOpenBuy(true)}
            />
          ) : null}

          <ClaimAll />
          <InternalLinkView />
          {tabStatus === "available" ? (
            <SearchTextInput
              ref={searchRef}
              value={search}
              onChange={(e) => {
                e.preventDefault();

                setSearch(e.target.value);

                if (e.target.value.trim().length > 0) {
                  if (document.documentElement.scrollTop < 218) {
                    searchScrollAnim.start(218, {
                      from: document.documentElement.scrollTop,
                      onChange: (anim: any) => {
                        // XXX: 이거 실제 파라미터랑 타입스크립트 인터페이스가 다르다...???
                        const v = anim.value != null ? anim.value : anim;
                        if (typeof v === "number") {
                          document.documentElement.scrollTop = v;
                        }
                      },
                    });
                  }
                }
              }}
              placeholder="Search for a chain"
            />
          ) : null}
          {/*
            AvailableTabView, StakedTabView가 컴포넌트로 빠지면서 밑의 얘들의 각각의 item들에는 stack이 안먹힌다는 걸 주의
            각 컴포넌트에서 알아서 gutter를 처리해야한다.
           */}
          {tabStatus === "available" ? (
            <AvailableTabView search={search} />
          ) : (
            <StakedTabView />
          )}
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
