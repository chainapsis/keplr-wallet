import React, { FunctionComponent } from "react";
import { Box } from "../box";
import { ColorPalette } from "../../styles";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { Gutter } from "../gutter";
import { YAxis } from "../axis";
import styled from "styled-components";
import { Button2, Caption1, Subtitle3 } from "../typography";
import { Column, Columns } from "../column";
import { ChainImageFallback } from "../image";

const Styles = {
  Container: styled.div`
    display: flex;
    flex-direction: column;

    width: 100%;

    padding: 1.25rem 0.75rem 0 0.75rem;

    background-color: ${ColorPalette["gray-600"]};

    overflow-y: auto;
  `,
  TextButton: styled(Button2)`
    padding: 0.5rem 1rem;
  `,
};

export const ContractAddressItem: FunctionComponent<{
  name: string;
  address: string;
  imageUrl: string;
  afterSelect: (address: string) => void;
}> = ({ name, address, imageUrl, afterSelect }) => {
  return (
    <Box
      paddingY="0.875rem"
      paddingLeft="1rem"
      paddingRight="0.5rem"
      borderRadius="0.375rem"
      backgroundColor={ColorPalette["gray-600"]}
      hover={{
        backgroundColor: ColorPalette["gray-550"],
      }}
      style={{
        cursor: "pointer",
      }}
      onClick={async (e) => {
        e.preventDefault();
        afterSelect(address);
      }}
    >
      <Columns sum={1} alignY="center" gutter="0.5rem">
        <Box>
          <ChainImageFallback
            style={{
              width: "2rem",
              height: "2rem",
            }}
            src={imageUrl}
            alt="chain icon"
          />
        </Box>
        <YAxis>
          <Subtitle3 color={ColorPalette["gray-10"]}>{name}</Subtitle3>
          <Gutter size="0.25rem" />
          <Caption1 color={ColorPalette["gray-300"]}>
            {Bech32Address.shortenAddress(address, 20)}
          </Caption1>
        </YAxis>
        <Column weight={2} />
        <Styles.TextButton
          style={{
            color: ColorPalette["gray-10"],
          }}
        >
          Select
        </Styles.TextButton>
      </Columns>
    </Box>
  );
};
