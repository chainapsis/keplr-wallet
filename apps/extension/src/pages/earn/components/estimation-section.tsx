import { CoinPretty } from "@keplr-wallet/unit";
import React from "react";
import { FunctionComponent } from "react";
import { FormattedMessage } from "react-intl";
import { XAxis } from "../../../components/axis";
import { Box } from "../../../components/box";
import { Gutter } from "../../../components/gutter";
import { H3, Body3 } from "../../../components/typography";
import { ColorPalette } from "../../../styles";
import { Chip, ApyChip } from "./chip";
import { LongArrowDownIcon } from "../../../components/icon/long-arrow-down";

export const EstimationSection: FunctionComponent<{
  usdcAmount: CoinPretty;
}> = ({ usdcAmount }) => {
  const NOBLE_CHAIN_ID = "noble-1";

  const DEFAULT_SLIPPAGE_RATE = 0.005;
  const simulatedUsdnAmount = usdcAmount; // TO-DO: dummy. request simluate

  const renderAmount = (amount: CoinPretty) => (
    <Box>
      <XAxis>
        <H3 color={ColorPalette.white}>{amount.hideDenom(true).toString()}</H3>
        <Gutter size="0.25rem" />
        <H3 color={ColorPalette["gray-300"]}>{amount.denom}</H3>
      </XAxis>
      <Box paddingY="0.125rem">
        <Body3 color={ColorPalette["gray-300"]} style={{ textAlign: "right" }}>
          <FormattedMessage id="page.earn.estimation-confirm.usdc-to-usdn.on-noble" />
        </Body3>
      </Box>
    </Box>
  );

  return (
    <Box
      padding="1rem"
      backgroundColor={ColorPalette["gray-650"]}
      borderRadius="0.75rem"
    >
      <Chip colorType="gray" text="APY 0%" />
      <Gutter size="0.75rem" />
      {renderAmount(usdcAmount)}

      <Gutter size="0.5rem" />
      <Box alignX="center">
        <LongArrowDownIcon
          width="1.5rem"
          height="1.5rem"
          color={ColorPalette["gray-400"]}
        />
      </Box>

      <Gutter size="0.75rem" />
      <XAxis>
        <ApyChip chainId={NOBLE_CHAIN_ID} colorType="green" />
        <Gutter size="0.25rem" />
        <Chip colorType="green" text="EARN" />
      </XAxis>
      <Gutter size="0.75rem" />
      {renderAmount(simulatedUsdnAmount)}
    </Box>
  );
};
