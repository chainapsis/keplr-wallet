import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
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
import { AnimatedQRScanner, Purpose } from "@keystonehq/animated-qr";

export const ScanKeystoneScene: FunctionComponent<{
  name: string;
  password: string;

  // append mode일 경우 위의 name, password는 안쓰인다. 대충 빈 문자열 넣으면 된다.
  appendModeInfo?: {
    vaultId: string;
    afterEnableChains: string[];
  };
  stepPrevious: number;
  stepTotal: number;
}> = observer(({ name, password, stepPrevious, stepTotal }) => {
  const sceneTransition = useSceneTransition();

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
  };

  const handleLoaded = (canPlay: boolean) => {
    console.log(canPlay);
  };

  return (
    <RegisterSceneBox style={{ alignItems: "center" }}>
      <Box
        backgroundColor={ColorPalette["gray-500"]}
        borderRadius="0.5rem"
        style={{ overflow: "hidden", position: "relative" }}
        width="21.25rem"
        height="21.25rem"
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
          videoLoaded={handleLoaded}
          options={{
            width: "21.25rem",
            height: "21.25rem",
            blur: false,
          }}
        />
      </Box>
      <Box
        color={ColorPalette["gray-200"]}
        style={{
          fontSize: "1.125rem",
          lineHeight: "1.625rem",
          textAlign: "center",
          marginTop: "2rem",
        }}
      >
        Position the QR code in front of your camera.
      </Box>
    </RegisterSceneBox>
  );
});
