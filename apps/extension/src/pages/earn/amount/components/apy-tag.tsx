import Color from "color";
import React from "react";
import { FunctionComponent } from "react";
import { useTheme } from "styled-components";
import { Box } from "../../../../components/box";
import { Subtitle4 } from "../../../../components/typography";
import { ColorPalette } from "../../../../styles";
import { useGetApy } from "../../../../hooks/use-get-apy";

export const ApyTag: FunctionComponent<{
  chainId: string;
}> = ({ chainId }) => {
  const theme = useTheme();
  const { apy } = useGetApy(chainId);

  return (
    <Box
      borderRadius="0.375rem"
      paddingX="0.5rem"
      paddingY="0.25rem"
      width="fit-content"
      alignY="center"
      backgroundColor={
        theme.mode === "light"
          ? ColorPalette["green-50"]
          : Color(ColorPalette["green-700"]).alpha(0.2).toString()
      }
      color={
        theme.mode === "light"
          ? ColorPalette["green-500"]
          : ColorPalette["green-400"]
      }
    >
      <Subtitle4>APY {apy}</Subtitle4>
    </Box>
  );
};
