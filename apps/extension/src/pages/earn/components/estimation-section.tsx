import { CoinPretty } from "@keplr-wallet/unit";
import React from "react";
import { FunctionComponent } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { XAxis } from "../../../components/axis";
import { Box } from "../../../components/box";
import { Gutter } from "../../../components/gutter";
import { H3, Body3 } from "../../../components/typography";
import { ColorPalette } from "../../../styles";
import { Chip, ApyChip } from "./chip";
import { LongArrowDownIcon } from "../../../components/icon/long-arrow-down";
import { NOBLE_CHAIN_ID } from "../../../config.ui";
import { useTheme } from "styled-components";

export const EstimationSection: FunctionComponent<{
  inAmount: CoinPretty;
  outAmount: CoinPretty;
}> = ({ inAmount, outAmount }) => {
  const theme = useTheme();
  const isLightMode = theme.mode === "light";

  const intl = useIntl();

  const renderAmount = (amount: CoinPretty) => (
    <Box>
      <XAxis>
        <Gutter size="0.25rem" />
        <H3 color={isLightMode ? ColorPalette["gray-700"] : ColorPalette.white}>
          {amount.shrink(true).hideDenom(true).trim(true).toString()}
        </H3>
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
      backgroundColor={
        isLightMode ? ColorPalette.white : ColorPalette["gray-650"]
      }
      borderRadius="0.75rem"
    >
      <Chip
        colorType="gray"
        text={intl.formatMessage({
          id: "page.earn.estimation-confirm.usdc-to-usdn.no-rewards",
        })}
      />
      <Gutter size="0.75rem" />
      {renderAmount(inAmount)}

      <Gutter size="0.25rem" />
      <Box alignX="center">
        <LongArrowDownIcon
          width="1.5rem"
          height="1.5rem"
          color={
            isLightMode ? ColorPalette["gray-200"] : ColorPalette["gray-400"]
          }
        />
      </Box>

      <Gutter size="0.75rem" />
      <ApyChip chainId={NOBLE_CHAIN_ID} colorType="green" />
      <Gutter size="0.75rem" />
      {renderAmount(outAmount)}
    </Box>
  );
};
