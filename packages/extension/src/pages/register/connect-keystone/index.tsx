import { observer } from "mobx-react-lite";
import React, { FunctionComponent, ReactChild } from "react";
import { useRegisterHeader } from "../components/header";
import {
  useSceneEvents,
  useSceneTransition,
} from "../../../components/transition";
import { RegisterSceneBox } from "../components/register-scene-box";
import { Stack } from "../../../components/stack";
import { Box } from "../../../components/box";
import { Button } from "../../../components/button";
import { ColorPalette } from "../../../styles";

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
        title: "Please Connect Your Hardware Wallet",
        paragraphs: [],
        stepCurrent: stepPrevious + 1,
        stepTotal: stepTotal,
      });
    },
  });

  const sync = () => {
    sceneTransition.push("scan-keystone", {
      name,
      password,
      stepPrevious: stepPrevious + 1,
      stepTotal,
    });
  };

  return (
    <RegisterSceneBox style={{ alignItems: "center" }}>
      <Stack gutter="1.5rem">
        <Step
          num="1"
          text={
            <span>
              Tap “
              <span style={{ color: ColorPalette.white }}>
                Connect Software Wallet
              </span>
              ” at the bottom left corner on the Keystone device.
            </span>
          }
        />
        <Step
          num="2"
          text={
            <span>
              Select “
              <span style={{ color: ColorPalette.white }}>Keplr Wallet</span>”.
            </span>
          }
        />
        <Step
          num="3"
          text={
            <span>
              Click on the “
              <span style={{ color: ColorPalette.white }}>Sync Keystone</span>”
              button below to scan the QR code displayed on the Keystone device.
            </span>
          }
        />
      </Stack>
      <a
        href="https://support.keyst.one/3rd-party-wallets/cosmos-wallets/keplr-extension?utm_source=keplr&utm_medium=moredetails&utm_id=20230419"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          marginTop: "2rem",
          color: ColorPalette.white,
          textDecoration: "none",
          fontSize: "1rem",
        }}
      >
        Click here to view detailed tutorial
      </a>
      <Button
        onClick={sync}
        text="Sync Keystone"
        style={{ width: "22rem", marginTop: "3.5rem" }}
      />
    </RegisterSceneBox>
  );
});

const Step: FunctionComponent<{
  num: string;
  text: ReactChild;
}> = ({ num, text }) => {
  return (
    <Box
      backgroundColor={ColorPalette["gray-500"]}
      borderRadius="0.5rem"
      height="6.5rem"
      paddingX="2.06rem"
      style={{
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <Box
        style={{
          fontSize: "1.25rem",
          whiteSpace: "nowrap",
          marginRight: "3rem",
        }}
      >
        Step {num}
      </Box>
      <Box
        style={{
          fontSize: "1rem",
          lineHeight: "1.5rem",
          color: ColorPalette["gray-200"],
        }}
      >
        {text}
      </Box>
    </Box>
  );
};
