import React, { FunctionComponent } from "react";
import { Box } from "../../../../components/box";
import { observer } from "mobx-react-lite";
import { Subtitle2 } from "../../../../components/typography";
import { useTheme } from "styled-components";
import { ColorPalette } from "../../../../styles";
import { Label } from "../../../../components/input";
import { XAxis } from "../../../../components/axis";
import { ChainImageFallback } from "../../../../components/image";
import { Gutter } from "../../../../components/gutter";
import { ArrowRightIcon } from "../../../../components/icon";
import { useIntl } from "react-intl";
import { ChainInfo, ModularChainInfo } from "@keplr-wallet/types";

export const DestinationChainView: FunctionComponent<{
  chainInfo?: ModularChainInfo | ChainInfo;
  onClick: () => void;
}> = observer(({ chainInfo, onClick }) => {
  const theme = useTheme();
  const intl = useIntl();

  return (
    <React.Fragment>
      <Label
        content={intl.formatMessage({
          id: "page.send.amount.ibc-transfer.destination-chain",
        })}
      />
      <Box
        minHeight="4.25rem"
        alignY="center"
        backgroundColor={
          theme.mode === "light" ? ColorPalette.white : ColorPalette["gray-600"]
        }
        borderRadius={theme.mode === "light" ? "0.5rem" : "0.375rem"}
        paddingX="1rem"
        paddingY="0.875rem"
        borderWidth={theme.mode === "light" ? "1px" : "0"}
        borderColor={theme.mode === "light" ? ColorPalette["gray-50"] : "none"}
        cursor="pointer"
        onClick={(e) => {
          e.preventDefault();

          onClick();
        }}
      >
        <XAxis alignY="center">
          {!chainInfo ? null : (
            <React.Fragment>
              <ChainImageFallback chainInfo={chainInfo} size="2rem" />
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
              if (!chainInfo) {
                return "";
              }

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
