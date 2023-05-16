import React, { FunctionComponent } from "react";
import styled from "styled-components";
import { ColorPalette } from "../../../../styles";
import { CloseIcon, LinkIcon } from "../../../../components/icon";
import { Box } from "../../../../components/box";
import { Stack } from "../../../../components/stack";
import { useNavigate } from "react-router";
import { Gutter } from "../../../../components/gutter";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";
import { Button2, H3 } from "../../../../components/typography";
import { XAxis } from "../../../../components/axis";

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

      <Stack>
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

        <Gutter size="1rem" />

        <Box
          width="6.5rem"
          style={{ border: `1px solid ${ColorPalette["gray-400"]}` }}
        />

        <Gutter size="1rem" />

        <Styles.MenuItem onClick={() => navigate("/setting/contacts/list")}>
          Contacts
        </Styles.MenuItem>

        <Gutter size="1.75rem" />

        <Styles.MenuItem onClick={() => navigate("/setting/token/list")}>
          Add Token
        </Styles.MenuItem>

        <Gutter size="1.75rem" />

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

      <Gutter size="0.75rem" />

      <Box
        cursor="pointer"
        onClick={(e) => {
          e.preventDefault();

          browser.tabs.create({
            url: "https://chains.keplr.app/",
          });
        }}
      >
        <XAxis alignY="center">
          <Button2 color={ColorPalette["gray-300"]}>
            Go to Keplr Chain Registry
          </Button2>

          <Gutter size="0.25rem" />

          <LinkIcon
            width="1.125rem"
            height="1.125rem"
            color={ColorPalette["gray-300"]}
          />
        </XAxis>
      </Box>
    </Box>
  );
});
