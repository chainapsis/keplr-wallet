import React, { FunctionComponent } from "react";
import styled from "styled-components";
import { ColorPalette } from "../../../../styles";
import { CloseIcon } from "../../../../components/icon";
import { Box } from "../../../../components/box";
import { Stack } from "../../../../components/stack";
import { useNavigate } from "react-router";

const Styles = {
  Container: styled.div`
    height: 100%;
    width: 70%;
    max-width: 20rem;

    display: flex;

    background-color: ${ColorPalette["gray-600"]};

    padding: 2rem;
  `,
  MenuItem: styled(Box)`
    font-weight: 500;
    font-size: 1.5rem;

    cursor: pointer;
  `,
  Flex1: styled.div`
    flex: 1;
  `,
};

export const MenuBar: FunctionComponent<{
  close: () => void;
}> = ({ close }) => {
  const navigate = useNavigate();

  return (
    <Styles.Container>
      <Stack gutter="1.75rem">
        <Box onClick={close} cursor="pointer">
          <CloseIcon />
        </Box>

        <Styles.MenuItem onClick={() => navigate("/setting/contacts/list")}>
          Address Book
        </Styles.MenuItem>

        <Styles.MenuItem
          onClick={() => {
            navigate("/setting");
          }}
        >
          Settings
        </Styles.MenuItem>

        <Styles.Flex1 />

        <Styles.MenuItem>Lock Wallet</Styles.MenuItem>
      </Stack>
    </Styles.Container>
  );
};
