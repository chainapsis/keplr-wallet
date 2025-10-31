import React, { FunctionComponent } from "react";
import { YAxis } from "../../../../../components/axis";
import { Box } from "../../../../../components/box";
import { Gutter } from "../../../../../components/gutter";
import { ColorPalette } from "../../../../../styles";
import { useTheme } from "styled-components";

export const MsgSkeleton: FunctionComponent = () => {
  const theme = useTheme();

  return (
    <YAxis>
      <Box
        width="4rem"
        height="0.75rem"
        backgroundColor={
          theme.mode === "light"
            ? ColorPalette["gray-50"]
            : ColorPalette["gray-500"]
        }
      />
      <Gutter size="0.2rem" />
      <Box
        width="6rem"
        height="0.75rem"
        backgroundColor={
          theme.mode === "light"
            ? ColorPalette["gray-50"]
            : ColorPalette["gray-500"]
        }
      />
    </YAxis>
  );
};
