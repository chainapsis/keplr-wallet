import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { useRegisterHeader } from "../components/header";
import {
  useSceneEvents,
  useSceneTransition,
} from "../../../components/transition";
import { RegisterSceneBox } from "../components/register-scene-box";
import { AnimatedQRScanner, Purpose } from "@keystonehq/animated-qr";
import KeystoneSDK, { UR } from "@keystonehq/keystone-sdk";

export const ConnectKeystoneScene: FunctionComponent<{
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
        title: "Please connect your Hardware wallet",
        paragraphs: ["You need to scan the QR code displayed on Keystone"],
        stepCurrent: stepPrevious + 1,
        stepTotal: stepTotal,
      });
    },
  });

  const handleScan = (ur: { type: string; cbor: string }) => {
    const accounts = KeystoneSDK.parseMultiAccounts(
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

  return (
    <RegisterSceneBox>
      <p>Scan</p>
      <AnimatedQRScanner
        purpose={Purpose.COSMOS_SYNC}
        handleScan={handleScan}
        handleError={handleError}
        options={{
          width: 300,
          height: 300,
          blur: false,
        }}
      />
    </RegisterSceneBox>
  );
});
