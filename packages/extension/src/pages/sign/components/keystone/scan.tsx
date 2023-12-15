import React, { FunctionComponent, useMemo, useState } from "react";
import { Box } from "../../../../components/box";
import { Stack } from "../../../../components/stack";
import { KeystoneTextIcon } from "../../../../components/icon/keystone-text";
import { ColorPalette } from "../../../../styles";
import { CameraIcon } from "../../../../components/icon";
import { URType, useAnimatedQRScanner } from "@keystonehq/animated-qr";
import { GuideBox } from "../../../../components/guide-box";
import { KeystoneErrorModal } from "../../../../components/keystone/error";
import { KeystoneUR } from "../../utils/keystone";
import { useTheme } from "styled-components";
import { FormattedMessage, useIntl } from "react-intl";
import { Progress } from "../../../../components/keystone/progress";

export const KeystoneScan: FunctionComponent<{
  onScan: (ur: KeystoneUR) => void;
  error: Error | undefined;
  onCloseError: () => void;
}> = ({ onScan, error, onCloseError }) => {
  const { AnimatedQRScanner, hasPermission, setIsDone, isDone } =
    useAnimatedQRScanner();
  const [isErrorOpen, setIsErrorOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const theme = useTheme();
  const intl = useIntl();

  const handleScan = (ur: KeystoneUR) => {
    onScan(ur);
  };

  const handleError = (err: string) => {
    console.error(err);
    setIsErrorOpen(true);
  };

  const handleProcess = (progress: number) => {
    setProgress(progress);
  };

  const handleClose = () => {
    setIsErrorOpen(false);
    setIsDone(false);
    setProgress(0);
    onCloseError();
  };

  const cameraSize = useMemo(
    () => (hasPermission ? "16.625rem" : "15rem"),
    [hasPermission]
  );

  const isError = useMemo(
    () => error !== undefined || isErrorOpen,
    [error, isErrorOpen]
  );

  return (
    <Stack gutter="1rem" alignX="center">
      <Box
        style={{
          textAlign: "center",
          color:
            theme.mode === "light"
              ? ColorPalette["gray-300"]
              : ColorPalette["gray-200"],
        }}
      >
        <FormattedMessage id="page.sign.keystone.paragraph-scan" />
      </Box>
      <KeystoneTextIcon color={theme.mode} height="2.375rem" width="9.75rem" />
      <Box
        backgroundColor={
          theme.mode === "light"
            ? ColorPalette["gray-50"]
            : ColorPalette["gray-500"]
        }
        borderRadius="0.5rem"
        style={{ overflow: "hidden", position: "relative" }}
        width={cameraSize}
        height={cameraSize}
      >
        <Box
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            margin: "-1.25rem 0 0 -1.25rem",
          }}
        >
          <CameraIcon
            width="2.5rem"
            height="2.5rem"
            color={
              theme.mode === "light"
                ? ColorPalette["gray-300"]
                : ColorPalette["gray-200"]
            }
          />
        </Box>
        <AnimatedQRScanner
          urTypes={[
            URType.COSMOS_SIGNATURE,
            URType.ETH_SIGNATURE,
            URType.EVM_SIGNATURE,
          ]}
          handleScan={handleScan}
          handleError={handleError}
          onProgress={handleProcess}
          options={{
            width: cameraSize,
            height: cameraSize,
            blur: false,
          }}
        />
      </Box>
      <Progress percent={isDone ? 100 : progress} />
      {hasPermission ? (
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
          paddingBottom="0.88rem"
        >
          <FormattedMessage id="page.sign.keystone.position-qrcode" />
        </Box>
      ) : (
        <Box width="100%" paddingBottom="0.88rem" paddingX="0.88rem">
          <GuideBox
            color="warning"
            title={intl.formatMessage({
              id: "page.sign.keystone.no-camera-permission",
            })}
            paragraph={intl.formatMessage({
              id: "page.sign.keystone.enable-camera",
            })}
          />
        </Box>
      )}
      <KeystoneErrorModal
        isOpen={isError}
        close={handleClose}
        title={intl.formatMessage({
          id: "page.sign.keystone.invalid-qrcode",
        })}
        paragraph={intl.formatMessage({
          id: "page.sign.keystone.select-valid-qrcode",
        })}
      />
    </Stack>
  );
};
