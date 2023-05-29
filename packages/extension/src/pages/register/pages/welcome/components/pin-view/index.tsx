import React, { FunctionComponent } from "react";
import { Box } from "../../../../../../components/box";
import { ColorPalette } from "../../../../../../styles";
import { Columns } from "../../../../../../components/column";
import { PinIcon } from "../pin-icon";
import { Stack } from "../../../../../../components/stack";
import styled from "styled-components";
import { PuzzleIcon } from "../puzzle-icon";
import { Gutter } from "../../../../../../components/gutter";

const Styles = {
  Title: styled.div`
    font-weight: 600;
    font-size: 1rem;
  `,
  Paragraph: styled.div`
    font-weight: 500;
    font-size: 0.875rem;
    color: ${ColorPalette["gray-200"]};
  `,
};

export const PinView: FunctionComponent = () => {
  return (
    <Box
      position="absolute"
      backgroundColor={ColorPalette["gray-500"]}
      borderRadius="1.5rem"
      padding="1.5rem 1rem"
      style={{ top: "1.25rem", right: "1.25rem" }}
    >
      <Columns sum={1} alignY="top" gutter="1rem">
        <Box
          backgroundColor={ColorPalette["blue-400"]}
          borderRadius="50%"
          padding="0.375rem"
        >
          <PinIcon />
        </Box>

        <Stack gutter="0.25rem">
          <Styles.Title>Pin Keplr for easy access</Styles.Title>

          <Gutter size="0.25rem" />

          <Columns sum={1} alignY="center" gutter="0.25rem">
            <Styles.Paragraph>Click the ‘Extensions’ </Styles.Paragraph>
            <PuzzleIcon size="1rem" />
            <Styles.Paragraph>button</Styles.Paragraph>
          </Columns>

          <Columns sum={1} alignY="center" gutter="0.25rem">
            <Styles.Paragraph>
              Locate Keplr then click the ‘Pin’
            </Styles.Paragraph>
            <PinIcon size="1rem" />
            <Styles.Paragraph>button</Styles.Paragraph>
          </Columns>
        </Stack>
      </Columns>
    </Box>
  );
};
