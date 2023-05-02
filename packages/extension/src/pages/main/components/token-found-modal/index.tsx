import React, { FunctionComponent } from "react";
import { Box } from "../../../../components/box";
import {
  Caption1,
  Subtitle1,
  Subtitle3,
} from "../../../../components/typography";
import { ColorPalette } from "../../../../styles";
import { Button } from "../../../../components/button";
import { Column, Columns } from "../../../../components/column";
import { ChainImageFallback } from "../../../../components/image";
import { Stack } from "../../../../components/stack";
import { Checkbox } from "../../../../components/checkbox";
import { ArrowDownIcon, ArrowUpIcon } from "../../../../components/icon";
import styled from "styled-components";
import { VerticalCollapseTransition } from "../../../../components/transition/vertical-collapse";

export const TokenFoundModal: FunctionComponent = () => {
  return (
    <Box
      padding="0.75rem"
      backgroundColor={ColorPalette["gray-600"]}
      style={{ gap: "0.75rem" }}
    >
      <Box paddingTop="1.25rem" paddingBottom="0.75rem">
        <Subtitle1 style={{ textAlign: "center" }}>
          6 New Token(s) Found
        </Subtitle1>
      </Box>

      <Box maxHeight="25rem" style={{ overflowY: "scroll" }}>
        <Stack gutter="0.75rem">
          <FoundChainView />
          <FoundChainView />
          <FoundChainView />
          <FoundChainView />
          <FoundChainView />
          <FoundChainView />
          <FoundChainView />
          <FoundChainView />
          <FoundChainView />
          <FoundChainView />
        </Stack>
      </Box>

      <Button text="Add Chains" size="large" />
    </Box>
  );
};

const FoundChainView: FunctionComponent = () => {
  const [isDetailOpen, setIsDetailOpen] = React.useState<boolean>(false);

  return (
    <Box
      padding="0.875rem"
      backgroundColor={ColorPalette["gray-500"]}
      borderRadius="0.375rem"
    >
      <Columns sum={1} gutter="0.5rem" alignY="center">
        <Box width="2.25rem" height="2.25rem">
          <ChainImageFallback
            alt="Token Found Modal Chain Image"
            src={undefined}
          />
        </Box>

        <Stack gutter="0.25rem">
          <Subtitle1 color={ColorPalette["gray-10"]}>Cosmos</Subtitle1>
          <Caption1 color={ColorPalette["gray-300"]}>4 Tokens</Caption1>
        </Stack>

        <Column weight={1} />

        <Checkbox checked={true} onChange={() => {}} size="large" />

        <IconButton onClick={() => setIsDetailOpen(!isDetailOpen)}>
          {isDetailOpen ? <ArrowUpIcon /> : <ArrowDownIcon />}
        </IconButton>
      </Columns>

      <VerticalCollapseTransition collapsed={!isDetailOpen}>
        <Box
          backgroundColor={ColorPalette["gray-400"]}
          borderRadius="0.375rem"
          paddingY="0.75rem"
          paddingX="1rem"
          marginTop="0.75rem"
        >
          <Stack gutter="0.5rem">
            <FoundTokenView />
            <FoundTokenView />
          </Stack>
        </Box>
      </VerticalCollapseTransition>
    </Box>
  );
};

const FoundTokenView: FunctionComponent = () => {
  return (
    <Columns sum={1} gutter="0.5rem" alignY="center">
      <Box width="1.75rem" height="1.75rem">
        <ChainImageFallback
          alt="Token Found Modal Token Image"
          src={undefined}
        />
      </Box>

      <Subtitle3 color={ColorPalette["gray-50"]}>OSMO</Subtitle3>

      <Column weight={1} />

      <Subtitle3 color={ColorPalette["gray-50"]}>23.123</Subtitle3>
    </Columns>
  );
};

const IconButton = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  width: 2.5rem;
  height: 2.5rem;

  cursor: pointer;

  border-radius: 50%;

  color: ${ColorPalette["gray-200"]};

  :hover {
    background-color: ${ColorPalette["gray-550"]};
  }
`;
