import React, { FunctionComponent } from "react";
import { Column, Columns } from "../../../../components/column";
import { Box } from "../../../../components/box";
import { ColorPalette } from "../../../../styles";
import { Gutter } from "../../../../components/gutter";
import { Body3, H5 } from "../../../../components/typography";
import { useTheme } from "styled-components";

export const MessageItem: FunctionComponent<{
  icon: React.ReactElement;
  title: string | React.ReactElement;
  content: string | React.ReactElement;
}> = ({ icon, title, content }) => {
  const theme = useTheme();

  return (
    <Box padding="1rem">
      <Columns sum={1}>
        <Box
          width="2.5rem"
          minWidth="2.5rem"
          height="2.5rem"
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
            <Gutter size="2px" />
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
    </Box>
  );
};
