import React, { FunctionComponent } from "react";
import { Column, Columns } from "../../../../components/column";
import { Box } from "../../../../components/box";
import { Stack } from "../../../../components/stack";
import { Styles } from "./styles";
import { Body2, Subtitle1 } from "../../../../components/typography";
import { ColorPalette } from "../../../../styles";

export interface PageButtonProps {
  title: string | React.ReactNode;
  paragraph?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;

  onClick?: () => void;
}

export const PageButton: FunctionComponent<PageButtonProps> = ({
  title,
  paragraph,
  startIcon,
  endIcon,
  onClick,
}) => {
  return (
    <Styles.Container
      onClick={
        onClick &&
        ((e) => {
          e.preventDefault();
          onClick();
        })
      }
    >
      <Columns sum={1} alignY="center">
        <Column weight={1}>
          <Stack gutter="0.375rem">
            <Columns sum={1} gutter="0.375rem" alignY="center">
              {startIcon && <Box>{startIcon}</Box>}
              <Subtitle1 color={ColorPalette["gray-10"]}>{title}</Subtitle1>
            </Columns>
            <Body2 color={ColorPalette["gray-300"]}>{paragraph}</Body2>
          </Stack>
        </Column>
        <Box>{endIcon}</Box>
      </Columns>
    </Styles.Container>
  );
};
