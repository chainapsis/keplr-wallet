import React, { FunctionComponent } from "react";
import {
  useSceneEvents,
  useSceneTransition,
} from "../../../components/transition";
import { useRegisterHeader } from "../components/header";
import { RegisterSceneBox } from "../components/register-scene-box";
import { ColorPalette } from "../../../styles";
import { Button } from "../../../components/button";
import { Stack } from "../../../components/stack";

export const ConnectHardwareWalletScene: FunctionComponent = () => {
  const sceneTransition = useSceneTransition();

  const header = useRegisterHeader();
  useSceneEvents({
    onWillVisible: () => {
      header.setHeader({
        mode: "welcome",
        title: "Connect Hardware Wallet",
        paragraph: "TODO",
      });
    },
  });

  return (
    <RegisterSceneBox>
      <div
        style={{
          textAlign: "center",
          color: ColorPalette["gray-50"],
        }}
      >
        Select a hardware wallet that you <br />
        would like to use with Keplr
      </div>
      <div>TODO: Add image</div>
      <Stack gutter="1.25rem">
        <Button
          text="Connect Ledger"
          size="large"
          color="secondary"
          onClick={() => {
            sceneTransition.push("connect-ledger");
          }}
        />
        <Button
          text="Connect Keystone"
          size="large"
          color="secondary"
          onClick={() => {
            alert("TODO: Not yet implemented");
          }}
        />
      </Stack>
    </RegisterSceneBox>
  );
};
