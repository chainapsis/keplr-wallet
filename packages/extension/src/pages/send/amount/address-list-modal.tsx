import React, { FunctionComponent, useRef } from "react";
import { useClickOutside } from "../../../hooks";
import styled from "styled-components";
import { ColorPalette } from "../../../styles";
import { Body2, H5, Subtitle1 } from "../../../components/typography";
import { Stack } from "../../../components/stack";

const Styles = {
  Container: styled.div`
    display: flex;
    flex-direction: column;

    width: 100%;

    padding: 0.75rem;
    gap: 0.75rem;

    background-color: ${ColorPalette["gray-600"]};
  `,
};

export const AddressListModal: FunctionComponent<{
  setIsOpen: (isOpen: boolean) => void;
}> = ({ setIsOpen }) => {
  const wrapperRef = useRef<HTMLInputElement>(null);
  useClickOutside(wrapperRef, () => setIsOpen(false));

  return (
    <Styles.Container ref={wrapperRef}>
      <Subtitle1 style={{ padding: "0.5rem" }}>Address List</Subtitle1>

      <Stack>
        <AddressItem />
        <AddressItem />
        <AddressItem />
        <AddressItem />
      </Stack>
    </Styles.Container>
  );
};

const ItemStyle = {
  Container: styled(Stack)`
    padding: 0.75rem 1rem;

    :hover {
      background: rgba(46, 46, 50, 0.5);
    }

    border-radius: 0.375rem;

    cursor: pointer;
  `,
  Title: styled(H5)`
    color: ${ColorPalette["gray-10"]};
  `,
  Address: styled(Body2)`
    color: ${ColorPalette["gray-200"]};
  `,
  Memo: styled(Body2)`
    color: ${ColorPalette["gray-200"]};
  `,
};

const AddressItem: FunctionComponent = () => {
  return (
    <ItemStyle.Container gutter="0.25rem">
      <ItemStyle.Title>Sent on May 12, 2023</ItemStyle.Title>
      <ItemStyle.Address>cosmos1hjyde2kfgtl78t...rt649nn8j5</ItemStyle.Address>
      <ItemStyle.Memo>cosmos1hjyde2</ItemStyle.Memo>
    </ItemStyle.Container>
  );
};
