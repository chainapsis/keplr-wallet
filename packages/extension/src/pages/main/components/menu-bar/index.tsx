import React, { FunctionComponent } from "react";
import styled from "styled-components";
import { ColorPalette } from "../../../../styles";
import { CloseIcon } from "../../../../components/icon";
import { Box } from "../../../../components/box";
import { Stack } from "../../../../components/stack";
import { useNavigate } from "react-router";
import { Gutter } from "../../../../components/gutter";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";

const Styles = {
  MenuItem: styled(Box)`
    font-weight: 500;
    font-size: 1.5rem;
    color: ${ColorPalette["white"]};

    cursor: pointer;
  `,
  Flex1: styled.div`
    flex: 1;
  `,
};

export const MenuBar: FunctionComponent<{
  close: () => void;
}> = observer(({ close }) => {
  const { keyRingStore } = useStore();

  const navigate = useNavigate();

  return (
    <Box
      height="100%"
      width="70%"
      maxWidth="20rem"
      backgroundColor={ColorPalette["gray-600"]}
      padding="2rem"
      style={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box onClick={close} cursor="pointer" maxWidth="2.5rem">
        <CloseIcon width="2rem" height="2rem" />
      </Box>
      <Gutter size="1.25rem" />
      <Stack gutter="1.75rem">
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
      </Stack>

      <Styles.Flex1 />

      <Styles.MenuItem
        onClick={(e) => {
          e.preventDefault();

          keyRingStore.lock();
        }}
      >
        Lock Wallet
      </Styles.MenuItem>
    </Box>
  );
});
