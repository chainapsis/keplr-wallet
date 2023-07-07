import React, { FunctionComponent } from "react";
import { Box } from "../../../../components/box";
import { Stack } from "../../../../components/stack";
import { KeystoneTextIcon } from "../../../../components/icon/keystone-text";
import { ColorPalette } from "../../../../styles";
import { AnimatedQRCode } from "@keystonehq/animated-qr";
import { Button } from "../../../../components/button";
import { KeystoneUR } from "../../utils/keystone";

export const KeystoneDisplay: FunctionComponent<{
  ur?: KeystoneUR;
  onGetSignature: () => void;
}> = ({ ur, onGetSignature }) => {
  return (
    <Stack gutter="0.75rem" alignX="center">
      <Box
        style={{
          textAlign: "center",
          color: ColorPalette["gray-200"],
        }}
      >
        Scan the QR code via your Keystone device
      </Box>
      <KeystoneTextIcon height="2.375rem" width="9.75rem" />
      <Box
        backgroundColor={ColorPalette["gray-500"]}
        borderRadius="0.5rem"
        style={{ overflow: "hidden", position: "relative", padding: "13px" }}
        width="236px"
        height="236px"
      >
        {ur && (
          <AnimatedQRCode
            {...ur}
            options={{
              size: 210,
            }}
          />
        )}
      </Box>
      <Box
        style={{
          fontSize: "0.75rem",
          color: ColorPalette["gray-200"],
          textAlign: "center",
        }}
        paddingX="0.88rem"
      >
        Click on the &apos;Get Signature&apos; button after signing the
        transaction with your Keystone device.
      </Box>
      <a
        href="https://support.keyst.one/3rd-party-wallets/cosmos-wallets/keplr-extension?utm_source=keplr&utm_medium=sign&utm_id=20230419"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          color: ColorPalette.white,
          textUnderlineOffset: "3px",
        }}
      >
        Tutorial
      </a>
      <Box paddingBottom="0.88rem" paddingX="0.88rem" style={{ width: "100%" }}>
        <Button text="Get Signature" onClick={onGetSignature} />
      </Box>
    </Stack>
  );
};
