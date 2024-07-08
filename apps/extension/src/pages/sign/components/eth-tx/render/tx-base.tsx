import React, { FunctionComponent } from "react";
import { useTheme } from "styled-components";
import { Box } from "../../../../../components/box";
import { Column, Columns } from "../../../../../components/column";
import { Gutter } from "../../../../../components/gutter";
import { Body3, H5 } from "../../../../../components/typography";
import { ColorPalette } from "../../../../../styles";

export const EthTxBase: FunctionComponent<{
  icon: React.ReactElement;
  title: string | React.ReactElement;
  content: string | React.ReactElement;
}> = ({ icon, title, content }) => {
  const theme = useTheme();

  return (
    <Columns sum={1}>
      <Box
        width="2.75rem"
        minWidth="2.75rem"
        height="2.75rem"
        alignX="center"
        alignY="center"
      >
        {icon}
      </Box>

      <Gutter size="0.5rem" />

      <Column weight={1}>
        <Box minHeight="3rem" alignY="center">
          <H5
            color={
              theme.mode === "light"
                ? ColorPalette["gray-500"]
                : ColorPalette["gray-10"]
            }
          >
            {title}
          </H5>

          <Gutter size="0.25rem" />

          <Body3
            color={
              theme.mode === "light"
                ? ColorPalette["gray-300"]
                : ColorPalette["gray-200"]
            }
          >
            {content}
          </Body3>
        </Box>
      </Column>
    </Columns>
  );
};
