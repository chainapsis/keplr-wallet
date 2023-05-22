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

export const LookingForChains: FunctionComponent<{
  chainInfos: ChainInfo[];
}> = ({ chainInfos }) => {
  return (
    <Box>
      <TokenTitleView title="Looking for a chain?" />

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
  const { keyRingStore } = useStore();

  return (
    <Box
      backgroundColor={Color(ColorPalette["gray-600"]).alpha(0.6).string()}
      paddingX="1rem"
      paddingY="0.875rem"
      borderRadius="0.375rem"
    >
      <Columns sum={1} gutter="0.5rem" alignY="center">
        <ChainImageFallback
          style={{
            width: "2rem",
            height: "2rem",
            opacity: "0.6",
          }}
          src={chainInfo.chainSymbolImageUrl}
          alt={`${chainInfo.chainSymbolImageUrl} ${chainInfo.chainName}`}
        />

        <Gutter size="0.75rem" />

        <YAxis>
          <Subtitle2 color={Color(ColorPalette["gray-10"]).alpha(0.6).string()}>
            {chainInfo.chainName}
          </Subtitle2>

          <Gutter size="0.25rem" />

          <Body3 color={Color(ColorPalette["gray-300"]).alpha(0.6).string()}>
            {chainInfo.stakeCurrency.coinDenom}
          </Body3>
        </YAxis>

        <Column weight={1} />

        <Button
          text="Enable"
          size="small"
          color="secondary"
          onClick={() => {
            if (keyRingStore.selectedKeyInfo) {
              browser.tabs
                .create({
                  url: `/register.html#?route=enable-chains&vaultId=${keyRingStore.selectedKeyInfo.id}&initialSearchValue=${chainInfo.chainName}`,
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
