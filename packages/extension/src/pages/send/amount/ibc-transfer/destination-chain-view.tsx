import React, { FunctionComponent } from "react";
import { Box } from "../../../../components/box";
import { IIBCChannelConfig } from "@keplr-wallet/hooks";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";
import { Subtitle2 } from "../../../../components/typography";
import { useTheme } from "styled-components";
import { ColorPalette } from "../../../../styles";
import { Label } from "../../../../components/input";
import { XAxis } from "../../../../components/axis";
import { ChainImageFallback } from "../../../../components/image";
import { Gutter } from "../../../../components/gutter";
import { ArrowRightIcon } from "../../../../components/icon";

export const DestinationChainView: FunctionComponent<{
  ibcChannelConfig: IIBCChannelConfig;
  onClick: () => void;
}> = observer(({ ibcChannelConfig, onClick }) => {
  const { chainStore } = useStore();

  const theme = useTheme();

  return (
    <React.Fragment>
      <Label content="Destination Chain" />
      <Box
        minHeight="4.25rem"
        alignY="center"
        backgroundColor={
          theme.mode === "light" ? ColorPalette.white : ColorPalette["gray-600"]
        }
        borderRadius="0.375rem"
        paddingX="1rem"
        paddingY="0.875rem"
        style={{
          boxShadow:
            theme.mode === "light"
              ? "0px 1px 4px 0px rgba(43, 39, 55, 0.10)"
              : "none",
        }}
        cursor="pointer"
        onClick={(e) => {
          e.preventDefault();

          onClick();
        }}
      >
        <XAxis alignY="center">
          {ibcChannelConfig.channels.length === 0 ? null : (
            <React.Fragment>
              <ChainImageFallback
                style={{
                  width: "2rem",
                  height: "2rem",
                }}
                alt="chain image"
                src={(() => {
                  if (ibcChannelConfig.channels.length === 0) {
                    return "";
                  }

                  const chainInfo = chainStore.getChain(
                    ibcChannelConfig.channels[
                      ibcChannelConfig.channels.length - 1
                    ].counterpartyChainId
                  );

                  return chainInfo.chainSymbolImageUrl;
                })()}
              />
              <Gutter size="0.75rem" />
            </React.Fragment>
          )}
          <Subtitle2
            color={
              theme.mode === "light"
                ? ColorPalette["gray-600"]
                : ColorPalette["gray-10"]
            }
          >
            {(() => {
              if (ibcChannelConfig.channels.length === 0) {
                return "";
              }

              const chainInfo = chainStore.getChain(
                ibcChannelConfig.channels[ibcChannelConfig.channels.length - 1]
                  .counterpartyChainId
              );

              return chainInfo.chainName;
            })()}
          </Subtitle2>

          <div
            style={{
              flex: 1,
            }}
          />
          <ArrowRightIcon color={ColorPalette["gray-300"]} />
        </XAxis>
      </Box>
    </React.Fragment>
  );
});
