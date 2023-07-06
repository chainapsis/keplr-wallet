import { FunctionComponent } from "react";
import { Modal } from "../modal";
import { Box } from "../box";
import { Body2, Subtitle1 } from "../typography";
import React from "react";
import { ColorPalette } from "../../styles";
import { Button } from "../button";

export const KeystoneError: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
  title: string;
  paragraph: string;
}> = ({ isOpen, close, title, paragraph }) => {
  return (
    <Modal isOpen={isOpen} close={close} align="center">
      <Box
        width="18.6875rem"
        marginX="auto"
        backgroundColor={ColorPalette["gray-600"]}
        padding="1.5rem 1.25rem 1.25rem"
        borderRadius="0.5rem"
      >
        <Subtitle1>{title}</Subtitle1>
        <Body2 color={ColorPalette["gray-200"]} style={{ marginTop: "0.5rem" }}>
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
          <a
            href="https://support.keyst.one/3rd-party-wallets/cosmos-wallets/keplr-extension?utm_source=keplr&utm_medium=moredetails&utm_id=20230419"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              marginRight: "1.75rem",
              color: ColorPalette.white,
              textDecoration: "none",
              fontSize: "0.875rem",
            }}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            Tutorial
          </a>
          <Button
            size="small"
            text="OK"
            style={{ width: "4.8125rem" }}
            onClick={close}
          />
        </Box>
      </Box>
    </Modal>
  );
};
