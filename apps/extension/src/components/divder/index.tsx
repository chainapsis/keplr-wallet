import React, { FunctionComponent } from "react";
import { ColorPalette } from "../../styles";
import { useTheme } from "styled-components";
import { Box } from "../box";

export const Divider: FunctionComponent<{
  color?: string;
  direction?: "horizontal" | "vertical";
  spacing?: string;
}> = ({ color, direction = "horizontal", spacing = "0" }) => {
  const theme = useTheme();
  const lineColor =
    color ??
    (theme.mode === "dark"
      ? ColorPalette["gray-600"]
      : ColorPalette["gray-50"]);

  if (direction === "vertical") {
    return (
      <Box
        width="1px"
        height="100%"
        backgroundColor={lineColor}
        marginX={spacing}
      />
    );
  }

  return (
    <Box
      width="100%"
      height="1px"
      backgroundColor={lineColor}
      marginY={spacing}
    />
  );
};
