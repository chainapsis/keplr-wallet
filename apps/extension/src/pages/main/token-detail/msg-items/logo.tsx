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
      backgroundColor={
        backgroundColor ||
        (theme.mode === "light"
          ? ColorPalette["gray-50"]
          : ColorPalette["gray-500"])
      }
      borderRadius="999999px"
      alignX="center"
      alignY="center"
    >
      <Box alignX="center" alignY="center" color={ColorPalette["gray-200"]}>
        {center}
      </Box>
    </Box>
  );
};
