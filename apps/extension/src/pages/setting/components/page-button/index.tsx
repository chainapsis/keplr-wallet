import React, { FunctionComponent } from "react";
import { Column, Columns } from "../../../../components/column";
import { Box } from "../../../../components/box";
import { Stack } from "../../../../components/stack";
import { Styles } from "./styles";

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
              {startIcon ? <Box>{startIcon}</Box> : null}
              <Styles.Title>{title}</Styles.Title>
            </Columns>
            {paragraph ? (
              <Styles.Paragraph>{paragraph}</Styles.Paragraph>
            ) : null}
          </Stack>
        </Column>
        {endIcon ? <Styles.EndIcon>{endIcon}</Styles.EndIcon> : null}
      </Columns>
    </Styles.Container>
  );
};
