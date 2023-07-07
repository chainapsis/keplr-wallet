import React, { FunctionComponent, useMemo, useState } from "react";
import { Box } from "../../../../components/box";
import { Stack } from "../../../../components/stack";
import { KeystoneTextIcon } from "../../../../components/icon/keystone-text";
import { ColorPalette } from "../../../../styles";
import { CameraIcon } from "../../../../components/icon";
import { Purpose, useAnimatedQRScanner } from "@keystonehq/animated-qr";
import { GuideBox } from "../../../../components/guide-box";
import { KeystoneError } from "../../../../components/keystone/error";
import { KeystoneUR } from "../../utils/keystone";

export const KeystoneScan: FunctionComponent<{
  onScan: (ur: KeystoneUR) => void;
}> = ({ onScan }) => {
  const { AnimatedQRScanner, hasPermission, setIsDone } =
    useAnimatedQRScanner();
  const [isErrorOpen, setIsErrorOpen] = useState(false);

  const handleScan = (ur: KeystoneUR) => {
    onScan(ur);
  };

  const handleError = (err: string) => {
    console.error(err);
    setIsErrorOpen(true);
  };

  const handleClose = () => {
    setIsErrorOpen(false);
    setIsDone(false);
  };

  const cameraSize = useMemo(
    () => (hasPermission ? "16.625rem" : "15rem"),
    [hasPermission]
  );

  return (
    <Stack gutter="1rem" alignX="center">
      <Box
        style={{
          textAlign: "center",
          color: ColorPalette["gray-200"],
        }}
      >
        Scan the QR code displayed on your Keystone device
      </Box>
      <KeystoneTextIcon height="2.375rem" width="9.75rem" />
      <Box
        backgroundColor={ColorPalette["gray-500"]}
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
            color={ColorPalette["gray-200"]}
          />
        </Box>
        <AnimatedQRScanner
          purpose={Purpose.COSMOS_SIGN}
          handleScan={handleScan}
          handleError={handleError}
          options={{
            width: cameraSize,
            height: cameraSize,
            blur: false,
          }}
        />
      </Box>
      {hasPermission ? (
        <Box
          style={{
            fontSize: "0.75rem",
            color: ColorPalette["gray-200"],
            textAlign: "center",
          }}
          paddingX="0.88rem"
          paddingBottom="0.88rem"
        >
          Position the QR code in front of your camera.
        </Box>
      ) : (
        <Box width="100%" paddingBottom="0.88rem" paddingX="0.88rem">
          <GuideBox
            color="warning"
            title="No camera permission"
            paragraph="Please enable your camera permission via [Settings]"
          />
        </Box>
      )}
      <KeystoneError
        isOpen={isErrorOpen}
        close={handleClose}
        title="Invalid QR code"
        paragraph="Please ensure you have selected a valid QR code from your Keystone device."
      />
    </Stack>
  );
};
