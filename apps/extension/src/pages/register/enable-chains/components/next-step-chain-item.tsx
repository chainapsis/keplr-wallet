import React, { FunctionComponent } from "react";
import { ChainInfo, ModularChainInfo } from "@keplr-wallet/types";
import { Box } from "../../../../components/box";
import { Columns } from "../../../../components/column";
import { XAxis, YAxis } from "../../../../components/axis";
import { ChainImageFallback } from "../../../../components/image";
import { Gutter } from "../../../../components/gutter";
import { Subtitle2, Subtitle4 } from "../../../../components/typography";
import { Tag } from "../../../../components/tag";
import { ColorPalette } from "../../../../styles";
import { FormattedMessage } from "react-intl";

export const NextStepChainItem: FunctionComponent<{
  modularChainInfo: ModularChainInfo | ChainInfo;
  tagText: string;
}> = ({ modularChainInfo, tagText }) => {
  return (
    <Box
      paddingX="1rem"
      paddingY="0.75rem"
      cursor="not-allowed"
      style={{ opacity: 0.5 }}
    >
      <Columns sum={1}>
        <XAxis alignY="center">
          <ChainImageFallback chainInfo={modularChainInfo} size="3rem" />

          <Gutter size="0.5rem" />

          <YAxis>
            <XAxis alignY="center">
              <Subtitle2>{modularChainInfo.chainName}</Subtitle2>

              <Gutter size="0.375rem" />

              <Tag text={tagText} />
            </XAxis>

            <Gutter size="0.25rem" />

            <Subtitle4 color={ColorPalette["gray-300"]}>
              {"starknet" in modularChainInfo ? (
                <FormattedMessage id="pages.register.enable-chains.guide.can-select-starknet-later-step" />
              ) : (
                <FormattedMessage id="pages.register.enable-chains.guide.can-select-evm-next-step" />
              )}
            </Subtitle4>
          </YAxis>
        </XAxis>
      </Columns>
    </Box>
  );
};
