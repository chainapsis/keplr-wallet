import React, { FunctionComponent } from "react";
import { Box } from "../../../../components/box";
import { TokenTitleView } from "../token";
import { Stack } from "../../../../components/stack";
import { ColorPalette } from "../../../../styles";
import { ChainInfo } from "@keplr-wallet/types";
import { Gutter } from "../../../../components/gutter";
import { ChainImageFallback } from "../../../../components/image";
import { Column, Columns } from "../../../../components/column";
import { YAxis } from "../../../../components/axis";
import { Body3, Subtitle2 } from "../../../../components/typography";
import Color from "color";
import { Button } from "../../../../components/button";
import { useStore } from "../../../../stores";
import { observer } from "mobx-react-lite";
import { useIntl } from "react-intl";
import { useTheme } from "styled-components";

export const LookingForChains: FunctionComponent<{
  chainInfos: ChainInfo[];
}> = ({ chainInfos }) => {
  const intl = useIntl();

  return (
    <Box>
      <TokenTitleView
        title={intl.formatMessage({
          id: "page.main.components.looking-for-chains.title",
        })}
      />

      <Gutter size="0.5rem" />

      <Stack>
        {chainInfos.map((chainInfo) => (
          <LookingForChainItem key={chainInfo.chainId} chainInfo={chainInfo} />
        ))}
      </Stack>
    </Box>
  );
};

export const LookingForChainItem: FunctionComponent<{
  chainInfo: ChainInfo;
}> = observer(({ chainInfo }) => {
  const { analyticsStore, keyRingStore } = useStore();
  const intl = useIntl();
  const theme = useTheme();

  return (
    <Box
      backgroundColor={Color(
        theme.mode === "light" ? ColorPalette.white : ColorPalette["gray-600"]
      )
        .alpha(0.6)
        .string()}
      paddingX="1rem"
      paddingY="0.875rem"
      borderRadius="0.375rem"
    >
      <Columns sum={1} gutter="0.5rem" alignY="center">
        <ChainImageFallback
          size="2rem"
          chainInfo={chainInfo}
          style={{
            opacity: "0.6",
          }}
        />

        <Gutter size="0.75rem" />

        <YAxis>
          <Subtitle2
            color={Color(
              theme.mode === "light"
                ? ColorPalette["gray-700"]
                : ColorPalette["gray-10"]
            )
              .alpha(0.6)
              .string()}
          >
            {chainInfo.chainName}
          </Subtitle2>

          <Gutter size="0.25rem" />

          <Body3 color={Color(ColorPalette["gray-300"]).alpha(0.6).string()}>
            {chainInfo.stakeCurrency?.coinDenom ||
              chainInfo.currencies[0].coinDenom}
          </Body3>
        </YAxis>

        <Column weight={1} />

        <Button
          text={intl.formatMessage({
            id: "page.main.components.looking-for-chains.enable-button",
          })}
          size="small"
          color="secondary"
          onClick={() => {
            if (keyRingStore.selectedKeyInfo) {
              analyticsStore.logEvent("click_enableChain", {
                chainId: chainInfo.chainId,
                chainName: chainInfo.chainName,
              });

              browser.tabs
                .create({
                  url: `/register.html#?route=enable-chains&vaultId=${keyRingStore.selectedKeyInfo.id}&skipWelcome=true&initialSearchValue=${chainInfo.chainName}`,
                })
                .then(() => {
                  window.close();
                });
            }
          }}
        />
      </Columns>
    </Box>
  );
});
