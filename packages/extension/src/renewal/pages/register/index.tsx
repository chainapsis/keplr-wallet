import React, { FunctionComponent } from "react";
import styled, { css } from "styled-components";
import { ColorPalette } from "../../styles";
import { Button } from "../../components/button";
import { Stack } from "../../components/stack";
import { Gutter } from "../../components/gutter";
import { Box } from "../../components/box";
import { Card } from "../../components/card";

const Container = styled.div`
  min-width: 100vw;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const Test = styled.div<{ done: boolean }>`
  font-size: 21px;
  ${({ done }) => {
    if (done) {
      return css`
        color: ${ColorPalette["blue-100"]};
      `;
    } else {
      return css`
        color: ${ColorPalette["blue-300"]};
      `;
    }
  }}
`;

export const RegisterPage: FunctionComponent = () => {
  return (
    <Container>
      <Card
        width="100%"
        maxWidth="34.25rem"
        minHeight="12.5rem"
        display="flex"
        flexDirection="vertical"
      >
        <Stack gutter="1rem" flex={2}>
          <Gutter size="1rem" />
          <Button />
          <Gutter size="0.5rem" />
          <Test done={true}>Register</Test>
          <Gutter size="1.5rem" />
        </Stack>
        <Box flex={1}>test</Box>
      </Card>
    </Container>
  );
};
