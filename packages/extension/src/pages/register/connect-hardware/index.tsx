import React, { FunctionComponent, useState } from "react";
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
import { Image } from "../../../components/image";
import { FormattedMessage, useIntl } from "react-intl";
import { InformationPlainIcon, KeystoneIcon } from "../../../components/icon";
import styled from "styled-components";

export const ConnectHardwareWalletScene: FunctionComponent = () => {
  const sceneTransition = useSceneTransition();
  const [isKeystoneInfoShow, setIsKeystoneInfoShow] = useState(false);

  const intl = useIntl();

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

  const onKeystoneInformationClick: React.MouseEventHandler<HTMLSpanElement> = (
    e
  ) => {
    e.stopPropagation();
    setIsKeystoneInfoShow(!isKeystoneInfoShow);
  };

  return (
    <RegisterSceneBox>
      {!isKeystoneInfoShow && (
        <RegisterH4 color={ColorPalette["gray-50"]}>
          <Box style={{ textAlign: "center" }}>
            <FormattedMessage id="pages.register.connect-hardware.content.title" />
          </Box>
        </RegisterH4>
      )}
      <Box
        alignX="center"
        paddingBottom="3.125rem"
        paddingTop={isKeystoneInfoShow ? "0" : "3.125rem"}
      >
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
        {!isKeystoneInfoShow && (
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
        )}
        <Button
          text={intl.formatMessage({
            id: "pages.register.connect-hardware.connect-keystone-button",
          })}
          size="large"
          color="secondary"
          left={
            <Image
              src={require("../../../public/assets/img/intro-keystone-logo.png")}
              alt={"intro-keystone-logo"}
              style={{
                width: "1.5rem",
                height: "1.5rem",
              }}
            />
          }
          right={
            <KeystoneInformationIcon onClick={onKeystoneInformationClick}>
              <InformationPlainIcon width="1.125rem" height="1.125rem" />
            </KeystoneInformationIcon>
          }
          onClick={() => {
            sceneTransition.push("name-password-hardware", {
              type: "keystone",
            });
          }}
        />
        {isKeystoneInfoShow && <KeystoneInformation />}
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

const KeystoneInformationIcon = styled.span`
  position: absolute;
  right: 0.75rem;
  padding: 0.5rem;
  border-radius: 0.5rem;
  z-index: 2;
  line-height: 0;
  :hover {
    background-color: ${ColorPalette["gray-500"]};
  }
`;

const KeystoneInformation: FunctionComponent = () => {
  return (
    <Box
      padding="1.875rem"
      backgroundColor={ColorPalette["gray-500"]}
      borderRadius="0.375rem"
    >
      <Stack alignX="center" gutter="1rem">
        <Box
          width="3.42856rem"
          height="3.42856rem"
          borderRadius="50%"
          backgroundColor={ColorPalette.black}
          alignX="center"
          alignY="center"
        >
          <KeystoneIcon width="2.74288rem" height="2.74288rem" />
        </Box>
        <Box
          style={{
            fontSize: "1rem",
            textAlign: "center",
            lineHeight: "1.5rem",
          }}
        >
          A top-notch hardware wallet for optimal security, user-friendly
          interface and extensive compatibility.
        </Box>
        <a
          target="_blank"
          href="https://keyst.one/?utm_source=keplr&utm_medium=learnmore&utm_id=20230419"
          style={{
            color: ColorPalette["blue-400"],
            fontSize: "0.875rem",
            lineHeight: "1.375rem",
            textUnderlineOffset: "3px",
            fontWeight: 600,
          }}
          rel="noopener noreferrer"
        >
          Learn more
        </a>
      </Stack>
    </Box>
  );
};
