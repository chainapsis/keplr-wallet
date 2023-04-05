import React, { FunctionComponent, useRef } from "react";
import styled from "styled-components";
import { useClickOutside } from "../../../../hooks";
import { ColorPalette } from "../../../../styles";
import {
  Subtitle1,
  Subtitle3,
  Caption1,
  Button2,
} from "../../../../components/typography";
import { TextInput } from "../../../../components/input";
import { Column, Columns } from "../../../../components/column";
import { SearchIcon, StarIcon } from "../../../../components/icon";
import { Box } from "../../../../components/box";
import { Stack } from "../../../../components/stack";

const Styles = {
  Container: styled.div`
    display: flex;
    flex-direction: column;

    width: 100%;

    padding: 1.25rem;
    gap: 0.75rem;

    background-color: ${ColorPalette["gray-600"]};
  `,
  ItemContainer: styled.div`
    padding: 0.875rem 0.5rem 0.875rem 1rem;
  `,
  Favorite: styled.div``,
  TextButton: styled(Button2)`
    cursor: pointer;
    padding: 0.5rem 1rem;
  `,
};

export const CopyAddressModal: FunctionComponent<{
  setIsOpen: (isOpen: boolean) => void;
}> = ({ setIsOpen }) => {
  const wrapperRef = useRef<HTMLInputElement>(null);
  useClickOutside(wrapperRef, () => setIsOpen(false));

  return (
    <Styles.Container ref={wrapperRef}>
      <Subtitle1 style={{ textAlign: "center" }}>Copy Address</Subtitle1>

      <TextInput
        placeholder="Search for a chain"
        left={
          <SearchIcon
            width="1.25rem"
            height="1.25rem"
            color={ColorPalette["gray-300"]}
          />
        }
      />

      <ChainAddressItem />
      <ChainAddressItem />
      <ChainAddressItem />
    </Styles.Container>
  );
};

export const ChainAddressItem: FunctionComponent = () => {
  return (
    <Styles.ItemContainer>
      <Columns sum={1} alignY="center" gutter="0.5rem">
        <Styles.Favorite>
          <StarIcon width="1.25rem" height="1.25rem" />
        </Styles.Favorite>

        <Box>
          <img
            width="36px"
            height="36px"
            src="https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/cosmoshub/chain.png"
          />
        </Box>
        <Stack>
          <Subtitle3 color={ColorPalette["gray-10"]}>Cosmos</Subtitle3>
          <Caption1 color={ColorPalette["gray-300"]}>
            juno1abcd....zkme (118)
          </Caption1>
        </Stack>
        <Column weight={1} />
        <Styles.TextButton>Copy</Styles.TextButton>
      </Columns>
    </Styles.ItemContainer>
  );
};
