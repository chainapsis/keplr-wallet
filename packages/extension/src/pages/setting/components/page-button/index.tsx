import React, { FunctionComponent } from "react";
import { Column, Columns } from "../../../../components/column";
import { Box } from "../../../../components/box";
import { Stack } from "../../../../components/stack";
import styled from "styled-components";

export interface PageButtonProps {
  title: string;
  paragraph?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

export const Styles = {
  Container: styled.div`
    cursor: pointer;
  `,
};

export const PageButton: FunctionComponent<
  PageButtonProps & React.HTMLAttributes<HTMLDivElement>
> = (props) => {
  const { title, paragraph, startIcon, endIcon } = props;

  const attributes = { ...props };
  delete attributes.paragraph;

  return (
    <Styles.Container {...attributes}>
      <Columns sum={1} alignY="center">
        <Column weight={1}>
          <Stack>
            <Columns sum={1} alignY="center">
              <Box>{startIcon}</Box>
              <Box>{title}</Box>
            </Columns>
            <Box>{paragraph}</Box>
          </Stack>
        </Column>
        <Box>{endIcon}</Box>
      </Columns>
    </Styles.Container>
  );
};
