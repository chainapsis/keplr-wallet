import Color from "color";
import React from "react";
import { FunctionComponent } from "react";
import { useTheme } from "styled-components";
import { Box } from "../../../components/box";
import { Subtitle4 } from "../../../components/typography";
import { ColorPalette } from "../../../styles";
import { useGetEarnApy } from "../../../hooks/use-get-apy";
import { observer } from "mobx-react-lite";

export const Chip: FunctionComponent<{
  text: string;
  colorType: "green" | "gray";
}> = ({ colorType, text }) => {
  const theme = useTheme();

  const backgroundColor = (() => {
    switch (colorType) {
      case "green":
        return theme.mode === "light"
          ? ColorPalette["green-50"]
          : Color(ColorPalette["green-700"]).alpha(0.2).toString();
      case "gray":
        return theme.mode === "light"
          ? ColorPalette["gray-50"]
          : ColorPalette["gray-600"];
    }
  })();

  const color = (() => {
    switch (colorType) {
      case "green":
        return theme.mode === "light"
          ? ColorPalette["green-500"]
          : ColorPalette["green-400"];
      case "gray":
        return ColorPalette["gray-300"];
    }
  })();

  return (
    <Box
      borderRadius="0.375rem"
      paddingX="0.5rem"
      height="19px"
      width="fit-content"
      alignY="center"
      backgroundColor={backgroundColor}
      color={color}
    >
      <Subtitle4>{text}</Subtitle4>
    </Box>
  );
};

export const ApyChip: FunctionComponent<{
  chainId: string;
  colorType: "green" | "gray";
}> = observer(({ chainId, colorType }) => {
  const { apy } = useGetEarnApy(chainId);

  return <Chip colorType={colorType} text={`APY ${apy}`} />;
});
