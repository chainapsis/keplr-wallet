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
import { H3 } from "../../../../components/typography";

const Styles = {
  MenuItem: styled(H3)`
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
      paddingTop="1.125rem"
      paddingLeft="1.25rem"
      paddingBottom="2rem"
      style={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box onClick={close} cursor="pointer">
        <CloseIcon />
      </Box>
      <Gutter size="1.25rem" />
      <Stack gutter="1.75rem">
        <Styles.MenuItem
          onClick={() => {
            navigate("/setting");
          }}
        >
          Settings
        </Styles.MenuItem>

        <Styles.MenuItem onClick={() => navigate("/setting/contacts/list")}>
          Contacts
        </Styles.MenuItem>

        <Styles.MenuItem onClick={() => navigate("/setting/token/add")}>
          Add Token
        </Styles.MenuItem>

        <Styles.MenuItem
          onClick={(e) => {
            e.preventDefault();

            if (keyRingStore.selectedKeyInfo) {
              browser.tabs
                .create({
                  url: `/register.html#?route=enable-chains&vaultId=${keyRingStore.selectedKeyInfo.id}`,
                })
                .then(() => {
                  window.close();
                });
            }
          }}
        >
          Manage Chain List
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
