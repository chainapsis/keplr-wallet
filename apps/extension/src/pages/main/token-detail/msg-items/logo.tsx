import React, { FunctionComponent } from "react";
import { Box } from "../../../../components/box";
import { ColorPalette } from "../../../../styles";
import { useTheme } from "styled-components";

export const ItemLogo: FunctionComponent<{
  center: React.ReactElement;
  backgroundColor?: string;
  width?: string;
  height?: string;
}> = ({ center, backgroundColor, width, height }) => {
  const theme = useTheme();

  return (
    <Box
      width={width || "2rem"}
      height={height || "2rem"}
      borderColor={
        backgroundColor ||
        (theme.mode === "light"
          ? ColorPalette["gray-100"]
          : ColorPalette["gray-400"])
      }
      borderWidth="1"
      borderRadius="999999px"
      alignX="center"
      alignY="center"
    >
      <Box
        alignX="center"
        alignY="center"
        color={
          theme.mode === "light"
            ? ColorPalette["gray-300"]
            : ColorPalette["gray-200"]
        }
      >
        {center}
      </Box>
    </Box>
  );
};
