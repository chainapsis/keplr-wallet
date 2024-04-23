import { FunctionComponent } from "react";
import { Modal } from "../modal";
import { Box } from "../box";
import { Body2, Subtitle1 } from "../typography";
import React from "react";
import { ColorPalette } from "../../styles";
import { Button } from "../button";
import styled, { DefaultTheme, useTheme } from "styled-components";
import { FormattedMessage, useIntl } from "react-intl";

export const KeystoneErrorModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
  title: string;
  paragraph: string;
}> = ({ isOpen, close, title, paragraph }) => {
  const theme = useTheme();
  const intl = useIntl();
  return (
    <Modal isOpen={isOpen} close={close} align="center">
      <Box
        width="18.6875rem"
        marginX="auto"
        backgroundColor={
          theme.mode === "light"
            ? ColorPalette["white"]
            : ColorPalette["gray-600"]
        }
        padding="1.5rem 1.25rem 1.25rem"
        borderRadius="0.5rem"
      >
        <Subtitle1>{title}</Subtitle1>
        <Body2
          color={
            theme.mode === "light"
              ? ColorPalette["gray-300"]
              : ColorPalette["gray-200"]
          }
          style={{ marginTop: "0.5rem" }}
        >
          {paragraph}
        </Body2>
        <Box
          marginTop="2rem"
          alignX="right"
          style={{
            flexDirection: "row",
            width: "100%",
            alignItems: "center",
            justifyContent: "flex-end",
          }}
        >
          <Tutorial
            href="https://support.keyst.one/3rd-party-wallets/cosmos-wallets/keplr-extension?utm_source=keplr&utm_medium=moredetails&utm_id=20230419"
            target="_blank"
            rel="noopener noreferrer"
            theme={theme}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <FormattedMessage id="pages.register.connect-keystone.tutorial" />
          </Tutorial>
          <Button
            size="small"
            text={intl.formatMessage({
              id: "button.ok",
            })}
            style={{ width: "4.8125rem" }}
            onClick={close}
          />
        </Box>
      </Box>
    </Modal>
  );
};

const Tutorial = styled.a<{ theme?: DefaultTheme }>`
  margin-right: 1.75rem;
  color: ${(props) =>
    props.theme.mode === "light" ? ColorPalette.black : ColorPalette.white};
  text-decoration: none;
  font-size: 0.875rem;
  :hover {
    color: ${ColorPalette["blue-400"]};
  }
`;
