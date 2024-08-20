import React, { FunctionComponent } from "react";
import styled, { useTheme } from "styled-components";
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
import { Bleed } from "../../../../components/bleed";
import { FormattedMessage } from "react-intl";
import { useLocation } from "react-router-dom";
import { isRunningInSidePanel } from "../../../../utils";

const Styles = {
  MenuItem: styled(H3)`
    color: ${(props) =>
      props.theme.mode === "light"
        ? ColorPalette["gray-700"]
        : ColorPalette["white"]};

    cursor: pointer;
  `,
  Flex1: styled.div`
    flex: 1;
  `,
};

export const MenuBar: FunctionComponent<{
  close: () => void;
}> = observer(({ close }) => {
  const { analyticsStore, keyRingStore } = useStore();

  const location = useLocation();

  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Box
      height="100%"
      width="fit-content"
      alignX="left"
      backgroundColor={
        theme.mode === "light" ? ColorPalette.white : ColorPalette["gray-600"]
      }
      paddingTop="1.125rem"
      paddingX="1.75rem"
      paddingBottom="1.25rem"
      style={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Bleed horizontal="0.15rem">
        {/*
            좀 이상한 구조지만 clickable area를 조절하고
            아이콘이 약간 오른쪽으로 치우져보이는 느낌을 없애기 위해서
            어쩔 수 없이 약간 복잡해짐
           */}
        <Box alignX="left">
          <Box onClick={close} cursor="pointer">
            <CloseIcon
              width="1.5rem"
              height="1.5rem"
              color={
                theme.mode === "light"
                  ? ColorPalette["gray-200"]
                  : ColorPalette["gray-50"]
              }
            />
          </Box>
        </Box>
      </Bleed>
      <Gutter size="1.25rem" />

      <Stack gutter="1.5rem">
        <Styles.MenuItem
          onClick={(e) => {
            e.preventDefault();

            if (keyRingStore.selectedKeyInfo) {
              analyticsStore.logEvent("click_menu_manageChainVisibility");
              browser.tabs
                .create({
                  url: `/register.html#?route=enable-chains&vaultId=${keyRingStore.selectedKeyInfo.id}&skipWelcome=true`,
                })
                .then(() => {
                  if (!isRunningInSidePanel()) {
                    window.close();
                  } else {
                    close();
                  }
                });
            }
          }}
        >
          <FormattedMessage id="page.main.components.menu-bar.manage-chain-visibility-title" />
        </Styles.MenuItem>

        <Gutter size="1rem" />

        <Box
          width="6.5rem"
          style={{
            border: `1px solid ${
              theme.mode === "light"
                ? ColorPalette["gray-100"]
                : ColorPalette["gray-400"]
            }`,
          }}
        />

        <Gutter size="1rem" />

        <Styles.MenuItem onClick={() => navigate("/setting/contacts/list")}>
          <FormattedMessage id="page.main.components.menu-bar.my-contacts-title" />
        </Styles.MenuItem>

        <Styles.MenuItem onClick={() => navigate("/setting/token/list")}>
          <FormattedMessage id="page.main.components.menu-bar.add-token-title" />
        </Styles.MenuItem>

        {location.pathname !== "/setting" ? (
          <Styles.MenuItem
            onClick={() => {
              navigate("/setting");
            }}
          >
            <FormattedMessage id="page.main.components.menu-bar.setting-title" />
          </Styles.MenuItem>
        ) : null}
      </Stack>

      <Styles.Flex1 />

      <Styles.MenuItem
        onClick={(e) => {
          e.preventDefault();

          keyRingStore.lock();
        }}
      >
        <FormattedMessage id="page.main.components.menu-bar.lock-wallet-title" />
      </Styles.MenuItem>

      <Gutter size="1rem" />

      <Box
        width="6.5rem"
        style={{
          border: `1px solid ${
            theme.mode === "light"
              ? ColorPalette["gray-100"]
              : ColorPalette["gray-400"]
          }`,
        }}
      />

      <Gutter size="1rem" />

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
          <Button2
            color={
              theme.mode === "light"
                ? ColorPalette["gray-200"]
                : ColorPalette["gray-300"]
            }
          >
            <FormattedMessage id="page.main.components.menu-bar.go-to-keplr-chain-registry" />
          </Button2>

          <Gutter size="0.25rem" />

          <LinkIcon
            width="1.125rem"
            height="1.125rem"
            color={
              theme.mode === "light"
                ? ColorPalette["gray-200"]
                : ColorPalette["gray-300"]
            }
          />
        </XAxis>
      </Box>
    </Box>
  );
});
