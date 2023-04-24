import React, { FunctionComponent } from "react";
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

export interface ViewToken {
  token: CoinPretty;
  chainInfo: ChainInfo;
}

export const MainPage: FunctionComponent = observer(() => {
  const { keyRingStore, hugeQueriesStore } = useStore();

  const [tabStatus, setTabStatus] = React.useState<TabStatus>("available");

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

  return (
    <HeaderLayout
      title={keyRingStore.selectedKeyInfo?.name || "Keplr Account"}
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
          {tabStatus === "available" ? <Buttons /> : null}
          <ClaimAll />
          <InternalLinkView />
          {/*
            AvailableTabView, StakedTabView가 컴포넌트로 빠지면서 밑의 얘들의 각각의 item들에는 stack이 안먹힌다는 걸 주의
            각 컴포넌트에서 알아서 gutter를 처리해야한다.
           */}
          {tabStatus === "available" ? <AvailableTabView /> : <StakedTabView />}
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
    </HeaderLayout>
  );
});
