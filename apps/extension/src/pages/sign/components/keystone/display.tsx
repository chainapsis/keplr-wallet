import React, { FunctionComponent } from "react";
import { Box } from "../../../../components/box";
import { Stack } from "../../../../components/stack";
import { KeystoneTextIcon } from "../../../../components/icon/keystone-text";
import { ColorPalette } from "../../../../styles";
import { AnimatedQRCode } from "@keystonehq/animated-qr";
import { Button } from "../../../../components/button";
import { KeystoneUR } from "../../utils/keystone";
import { useTheme } from "styled-components";
import { FormattedMessage, useIntl } from "react-intl";

export const KeystoneDisplay: FunctionComponent<{
  ur?: KeystoneUR;
  onGetSignature: () => void;
}> = ({ ur, onGetSignature }) => {
  const theme = useTheme();
  const intl = useIntl();
  return (
    <Stack gutter="0.75rem" alignX="center">
      <Box
        style={{
          textAlign: "center",
          color:
            theme.mode === "light"
              ? ColorPalette["gray-300"]
              : ColorPalette["gray-200"],
        }}
      >
        <FormattedMessage id="page.sign.keystone.scan-qrcode" />
      </Box>
      <KeystoneTextIcon color={theme.mode} height="2.375rem" width="9.75rem" />
      <Box
        backgroundColor={
          theme.mode === "light"
            ? ColorPalette["gray-50"]
            : ColorPalette["gray-500"]
        }
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
          color:
            theme.mode === "light"
              ? ColorPalette["gray-300"]
              : ColorPalette["gray-200"],
          textAlign: "center",
        }}
        paddingX="0.88rem"
      >
        <FormattedMessage id="page.sign.keystone.click-get-signature" />
      </Box>
      <a
        href="https://support.keyst.one/3rd-party-wallets/cosmos-wallets/keplr-extension?utm_source=keplr&utm_medium=sign&utm_id=20230419"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          color: ColorPalette.white,
          textUnderlineOffset: "3px",
        }}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        Tutorial
      </a>
      <Box paddingBottom="0.88rem" paddingX="0.88rem" style={{ width: "100%" }}>
        <Button
          text={intl.formatMessage({
            id: "page.sign.keystone.get-signature",
          })}
          onClick={onGetSignature}
        />
      </Box>
    </Stack>
  );
};
