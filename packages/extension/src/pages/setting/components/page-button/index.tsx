import React, { FunctionComponent } from "react";
import { Column, Columns } from "../../../../components/column";
import { Box } from "../../../../components/box";
import { Stack } from "../../../../components/stack";
import styled from "styled-components";

export interface PageButtonProps {
  title: string | React.ReactNode;
  paragraph?: string;
  endIcon?: React.ReactNode;

  onClick?: () => void;
}

export const Styles = {
  Container: styled.div`
    cursor: ${({ onClick }) => (onClick ? "pointer" : "auto")};
  `,
};

export const PageButton: FunctionComponent<PageButtonProps> = ({
  title,
  paragraph,
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
          <Stack>
            <Box>{title}</Box>
            <Box>{paragraph}</Box>
          </Stack>
        </Column>
        <Box>{endIcon}</Box>
      </Columns>
    </Styles.Container>
  );
};
