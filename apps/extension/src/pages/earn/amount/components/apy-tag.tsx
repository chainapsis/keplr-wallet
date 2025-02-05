import Color from "color";
import React from "react";
import { FunctionComponent } from "react";
import { useTheme } from "styled-components";
import { XAxis } from "../../../../components/axis";
import { Box } from "../../../../components/box";
import { Caption2 } from "../../../../components/typography";
import { ColorPalette } from "../../../../styles";
import { useGetApy } from "../../../../hooks/use-get-apy";

export const ApyTag: FunctionComponent<{
  chainId: string;
}> = ({ chainId }) => {
  const theme = useTheme();
  const { apy } = useGetApy(chainId);

  return (
    <Box
      height="1.125rem"
      minHeight="1.125rem"
      borderRadius="0.375rem"
      paddingX="0.25rem"
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
      <XAxis alignY="center">
        <Caption2>{apy}</Caption2>
      </XAxis>
    </Box>
  );
};
