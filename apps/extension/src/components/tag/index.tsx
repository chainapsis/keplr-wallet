import React, { FunctionComponent } from "react";
import { Box } from "../box";
import { ColorPalette } from "../../styles";
import { Caption1 } from "../typography";
import { Tooltip } from "../tooltip";
import { useTheme } from "styled-components";

export const Tag: FunctionComponent<{
  text: string;
  tooltip?: string;

  paddingX?: string;

  whiteSpace?: "normal" | "nowrap";
}> = ({ text, tooltip, paddingX, whiteSpace }) => {
  const theme = useTheme();

  return (
    <Tooltip enabled={!!tooltip} content={tooltip}>
      <Box
        alignX="center"
        alignY="center"
        backgroundColor={
          theme.mode === "light"
            ? ColorPalette["blue-50"]
            : ColorPalette["gray-400"]
        }
        borderRadius="0.25rem"
        height="1.25rem"
        paddingX={paddingX || "0.625rem"}
      >
        <Caption1
          color={
            theme.mode === "light"
              ? ColorPalette["blue-400"]
              : ColorPalette["gray-100"]
          }
          style={{
            whiteSpace,
          }}
        >
          {text}
        </Caption1>
      </Box>
    </Tooltip>
  );
};
