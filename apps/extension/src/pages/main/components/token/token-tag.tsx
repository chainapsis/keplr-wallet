import React from "react";
import { FunctionComponent } from "react";
import { useTheme } from "styled-components";
import { Tooltip } from "../../../../components/tooltip";
import { Box } from "../../../../components/box";
import { BaseTypography } from "../../../../components/typography";
import { ColorPalette } from "../../../../styles";

export const TokenTag: FunctionComponent<{
  text: string;
  tooltip?: string;
}> = ({ text, tooltip }) => {
  const theme = useTheme();

  return (
    <Tooltip enabled={!!tooltip} content={tooltip}>
      <Box
        alignX="center"
        alignY="center"
        backgroundColor={
          theme.mode === "light"
            ? ColorPalette["blue-50"]
            : ColorPalette["gray-500"]
        }
        borderRadius="0.375rem"
        paddingX="0.375rem"
        paddingTop="0.125rem"
        paddingBottom="0.1875rem"
      >
        <BaseTypography
          style={{
            fontWeight: 400,
            fontSize: "0.6875rem",
          }}
          color={
            theme.mode === "light"
              ? ColorPalette["blue-400"]
              : ColorPalette["gray-200"]
          }
        >
          {text}
        </BaseTypography>
      </Box>
    </Tooltip>
  );
};
