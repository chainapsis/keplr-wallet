import React, { FunctionComponent, useState } from "react";
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
import { CoinPretty } from "@keplr-wallet/unit";
import { ChainInfo } from "@keplr-wallet/types";
import { MenuIcon } from "../../components/icon";
import { Box } from "../../components/box";
import { Modal } from "../../components/modal/v2";
import { DualChart } from "./components/chart";
import { Gutter } from "../../components/gutter";
import { H1, Subtitle3 } from "../../components/typography";
import { ColorPalette } from "../../styles";
import { MainQueryState } from "./query";
import { AvailableTabView } from "./available";
import { StakedTabView } from "./staked";

export interface ViewToken {
  token: CoinPretty;
  chainInfo: ChainInfo;
}

export const MainPage: FunctionComponent = observer(() => {
  const { chainStore, accountStore, queriesStore, keyRingStore, priceStore } =
    useStore();

  const [queryState] = useState(
    () => new MainQueryState(chainStore, queriesStore, accountStore, priceStore)
  );

  const [tabStatus, setTabStatus] = React.useState<TabStatus>("available");

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
      <Box paddingX="0.75rem">
        <Stack gutter="0.75rem">
          <StringToggle tabStatus={tabStatus} setTabStatus={setTabStatus} />
          <CopyAddress onClick={() => setIsOpenCopyAddress(true)} />
          <Box position="relative">
            <DualChart
              first={{
                weight: 2,
              }}
              second={{
                weight: 1,
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
                $12,123.45
              </H1>
            </Box>
          </Box>
          {tabStatus === "available" ? <Buttons /> : null}
          <ClaimAll />
          <InternalLinkView />
          {tabStatus === "available" ? (
            <AvailableTabView queryState={queryState} />
          ) : (
            <StakedTabView queryState={queryState} />
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
    </HeaderLayout>
  );
});
