import React, { FunctionComponent } from "react";
import {
  useSceneEvents,
  useSceneTransition,
} from "../../../components/transition";
import { useRegisterHeader } from "../components/header";
import { RegisterSceneBox } from "../components/register-scene-box";
import { ColorPalette } from "../../../styles";
import { Button } from "../../../components/button";
import { Stack } from "../../../components/stack";
import { RegisterH4 } from "../components/typography";
import { Box } from "../../../components/box";
import { FormattedMessage, useIntl } from "react-intl";
import { useTheme } from "styled-components";
import { KeystoneIcon } from "../../../components/icon/keystone";

export const ConnectHardwareWalletScene: FunctionComponent = () => {
  const sceneTransition = useSceneTransition();

  const intl = useIntl();
  const theme = useTheme();

  const header = useRegisterHeader();
  useSceneEvents({
    onWillVisible: () => {
      header.setHeader({
        mode: "welcome",
        title: intl.formatMessage({
          id: "pages.register.connect-hardware.header.title",
        }),
        paragraph: intl.formatMessage({
          id: "pages.register.connect-hardware.header.paragraph",
        }),
      });
    },
  });

  return (
    <RegisterSceneBox>
      <RegisterH4
        color={
          theme.mode === "light"
            ? ColorPalette["gray-400"]
            : ColorPalette["gray-50"]
        }
      >
        <Box style={{ textAlign: "center" }}>
          <FormattedMessage id="pages.register.connect-hardware.content.title" />
        </Box>
      </RegisterH4>
      <Box alignX="center" paddingBottom="3.125rem" paddingTop="3.125rem">
        <img
          src={require("../../../public/assets/img/intro-hardware-wallet.png")}
          style={{
            width: "10.625rem",
            height: "10.625rem",
          }}
          alt="intro-hardware-wallet image"
        />
      </Box>
      <Stack gutter="1.25rem">
        <Button
          text={intl.formatMessage({
            id: "pages.register.connect-hardware.connect-ledger-button",
          })}
          size="large"
          color="secondary"
          left={<LedgerIcon />}
          onClick={() => {
            sceneTransition.push("name-password-hardware", {
              type: "ledger",
            });
          }}
        />
        <Button
          text={intl.formatMessage({
            id: "pages.register.connect-hardware.connect-keystone-button",
          })}
          size="large"
          color="secondary"
          left={<KeystoneIcon color={theme.mode} />}
          onClick={() => {
            sceneTransition.push("name-password-hardware", {
              type: "keystone",
            });
          }}
        />
      </Stack>
    </RegisterSceneBox>
  );
};

const LedgerIcon: FunctionComponent = () => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_6023_318)">
        <path
          d="M21 20H14.1341V19.0323H20.0546V15.3964H21V20ZM9.86588 20H3V15.3964H3.94544V19.0323H9.86588V20ZM21 8.72578H20.0546V4.9677H14.1341V4H21V8.72578ZM3.94544 8.72578H3V4H9.86588V4.9677H3.94544V8.72578Z"
          fill="white"
        />
        <path
          d="M14.1341 14.9078H9.86591V8.36877H10.8205V13.9401H14.1341V14.9078Z"
          fill="white"
        />
      </g>
      <defs>
        <clipPath id="clip0_6023_318">
          <rect
            width="18"
            height="16"
            fill="white"
            transform="translate(3 4)"
          />
        </clipPath>
      </defs>
    </svg>
  );
};
