import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useState } from "react";
import { useRegisterHeader } from "../components/header";
import {
  useSceneEvents,
  useSceneTransition,
} from "../../../components/transition";
import { RegisterSceneBox } from "../components/register-scene-box";
import KeystoneSDK, { UR } from "@keystonehq/keystone-sdk";
import { Box } from "../../../components/box";
import { ColorPalette } from "../../../styles";
import { CameraIcon } from "../../../components/icon";
import { Purpose, useAnimatedQRScanner } from "@keystonehq/animated-qr";
import { GuideBox } from "../../../components/guide-box";
import { KeystoneErrorModal } from "../../../components/keystone/error";
import { useTheme } from "styled-components";

export const ScanKeystoneScene: FunctionComponent<{
  name: string;
  password: string;
  stepPrevious: number;
  stepTotal: number;
}> = observer(({ name, password, stepPrevious, stepTotal }) => {
  const sceneTransition = useSceneTransition();
  const { AnimatedQRScanner, hasPermission, setIsDone } =
    useAnimatedQRScanner();
  const [isErrorOpen, setIsErrorOpen] = useState(false);
  const theme = useTheme();

  const header = useRegisterHeader();
  useSceneEvents({
    onWillVisible: () => {
      header.setHeader({
        mode: "step",
        title: "Scan the QR Code",
        paragraphs: ["Scan the QR code displayed on your Keystone device"],
        stepCurrent: stepPrevious + 1,
        stepTotal: stepTotal,
      });
    },
  });

  const handleScan = (ur: { type: string; cbor: string }) => {
    const sdk = new KeystoneSDK({
      origin: "Keplr Extension",
    });
    const accounts = sdk.parseMultiAccounts(
      new UR(Buffer.from(ur.cbor, "hex"), ur.type)
    );
    sceneTransition.replaceAll("finalize-key", {
      name,
      password,
      keystone: accounts,
      stepPrevious: stepPrevious + 1,
      stepTotal,
    });
  };

  const handleError = (err: string) => {
    console.error(err);
    setIsErrorOpen(true);
  };

  const handleClose = () => {
    setIsErrorOpen(false);
    setIsDone(false);
  };

  return (
    <RegisterSceneBox style={{ alignItems: "center" }}>
      <Box
        backgroundColor={
          theme.mode === "light"
            ? ColorPalette["gray-50"]
            : ColorPalette["gray-500"]
        }
        borderRadius="0.5rem"
        style={{ overflow: "hidden", position: "relative" }}
        width="23.5rem"
        height="23.5rem"
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
          purpose={Purpose.COSMOS_SYNC}
          handleScan={handleScan}
          handleError={handleError}
          options={{
            width: "23.5rem",
            height: "23.5rem",
            blur: false,
          }}
        />
      </Box>
      {hasPermission ? (
        <Box
          color={
            theme.mode === "light"
              ? ColorPalette["gray-300"]
              : ColorPalette["gray-200"]
          }
          style={{
            fontSize: "1rem",
            lineHeight: "1.625rem",
            textAlign: "center",
            marginTop: "2rem",
          }}
        >
          Position the QR code in front of your camera.
        </Box>
      ) : (
        <Box width="23.5rem" marginTop="2rem">
          <GuideBox
            color="warning"
            title="No camera permission"
            paragraph="Please enable your camera permission via [Settings]"
          />
        </Box>
      )}
      <KeystoneErrorModal
        isOpen={isErrorOpen}
        close={handleClose}
        title="Invalid QR code"
        paragraph="Please ensure you have selected a valid QR code from your Keystone device."
      />
    </RegisterSceneBox>
  );
});
