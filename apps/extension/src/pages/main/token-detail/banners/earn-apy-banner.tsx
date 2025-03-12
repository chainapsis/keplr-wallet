import React, { FunctionComponent } from "react";
import { Box } from "../../../../components/box";
import { PercentageIcon } from "../../../../components/icon";
import { YAxis } from "../../../../components/axis";
import { Subtitle3 } from "../../../../components/typography";
import { useIntl } from "react-intl";
import { Button } from "../../../../components/button";
import { ColorPalette } from "../../../../styles";
import { Gutter } from "../../../../components/gutter";
import { ApyChip } from "../../../earn/components/chip";
import { useNavigate } from "react-router";
import { useTheme } from "styled-components";

export const EarnApyBanner: FunctionComponent<{
  chainId: string;
}> = ({ chainId }) => {
  const theme = useTheme();
  const isLightMode = theme.mode === "light";
  const intl = useIntl();
  const navigate = useNavigate();

  return (
    <Box
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        ...(isLightMode
          ? { boxShadow: "0px 1px 4px 0px rgba(43, 39, 55, 0.10)" }
          : {}),
      }}
      backgroundColor={
        isLightMode ? ColorPalette.white : ColorPalette["gray-650"]
      }
      padding="1rem"
      marginX="0.75rem"
      marginTop="19px"
      borderRadius="0.375rem"
    >
      <Box
        width="2.5rem"
        height="2.5rem"
        alignX="center"
        alignY="center"
        borderRadius="999999px"
        backgroundColor={
          isLightMode ? ColorPalette["gray-50"] : ColorPalette["gray-550"]
        }
      >
        <PercentageIcon
          width="0.75rem"
          height="0.75rem"
          color={isLightMode ? ColorPalette["gray-200"] : ColorPalette["white"]}
        />
      </Box>
      <Gutter size="0.75rem" />
      <YAxis gap="0.375rem">
        <Subtitle3
          color={isLightMode ? ColorPalette["gray-700"] : ColorPalette.white}
        >
          {intl.formatMessage({
            id: "page.token-detail.earn-apy-banner.title",
          })}
        </Subtitle3>
        <ApyChip chainId={chainId} colorType="green" />
      </YAxis>
      <Button
        color="primary"
        size="small"
        text={intl.formatMessage({
          id: "page.token-detail.earn-apy-banner.start-earn-button",
        })}
        style={{ marginLeft: "auto" }}
        onClick={() => {
          navigate(
            `/earn/intro?chainId=${chainId}&coinMinimalDenom=${"uusdc"}`
          );
        }}
      />
    </Box>
  );
};
