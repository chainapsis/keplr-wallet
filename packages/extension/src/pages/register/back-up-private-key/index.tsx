import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { RegisterSceneBox } from "../components/register-scene-box";
import { Box } from "../../../components/box";
import { WarningBox } from "../../../components/warning-box";
import { useRegisterHeader } from "../components/header";
import {
  useSceneEvents,
  useSceneTransition,
} from "../../../components/transition";
import { Button } from "../../../components/button";
import { Gutter } from "../../../components/gutter";
import { ColorPalette } from "../../../styles";
import { Body1, Subtitle3 } from "../../../components/typography";
import { CopyToClipboard } from "../components/copy-to-clipboard";
import { Buffer } from "buffer/";
import { PlainObject } from "@keplr-wallet/background";

export const BackUpPrivateKeyScene: FunctionComponent<{
  name: string;
  password: string;
  privateKey: {
    value: Uint8Array;
    meta: PlainObject;
  };
  stepPrevious: number;
  stepTotal: number;
}> = observer(({ name, password, privateKey, stepPrevious, stepTotal }) => {
  const sceneTransition = useSceneTransition();

  const header = useRegisterHeader();
  useSceneEvents({
    onWillVisible: () => {
      header.setHeader({
        mode: "step",
        title: "Back up private key",
        stepCurrent: stepPrevious + 1,
        stepTotal: stepTotal,
      });
    },
  });

  const [isShowPrivate, setIsShowPrivate] = React.useState(false);

  return (
    <RegisterSceneBox>
      <Box
        maxWidth="21rem"
        position="relative"
        backgroundColor={ColorPalette["gray-700"]}
        borderRadius="0.5rem"
        borderColor={ColorPalette["gray-400"]}
        borderWidth="1px"
        padding="1.25rem"
      >
        {!isShowPrivate ? (
          <Box cursor="pointer" onClick={() => setIsShowPrivate(true)}>
            <BlurBackdrop>
              <Subtitle3 color={ColorPalette["gray-300"]}>
                Click here to see private key
              </Subtitle3>
            </BlurBackdrop>
          </Box>
        ) : null}

        <Body1
          color={ColorPalette["gray-100"]}
          style={{ wordWrap: "break-word", fontFeatureSettings: `"calt" 0` }}
        >
          {Buffer.from(privateKey.value).toString("hex")}
        </Body1>

        <Gutter size="2rem" />

        <CopyToClipboard text={Buffer.from(privateKey.value).toString("hex")} />
      </Box>

      <Gutter size="1.25rem" />

      <WarningBox
        title="Backup your private key securely."
        paragraph={
          <Box>
            Anyone with your private key can have access to your assets.
            <br />
            <br />
            If you lose an access to your Gmail Account, the only way to recover
            your wallet is using your private key. Keep this in a safe place.
          </Box>
        }
      />

      <Gutter size="1.5rem" />

      <Button
        text="Import"
        size="large"
        onClick={() => {
          sceneTransition.replaceAll("finalize-key", {
            name: name,
            password: password,
            privateKey,
            stepPrevious: stepPrevious + 1,
            stepTotal,
          });
        }}
      />
    </RegisterSceneBox>
  );
});

const BlurBackdrop: FunctionComponent = ({ children }) => {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        background: "rgba(38, 38, 38, 0.5)",
        backgroundSize: "cover",
        borderRadius: "0.5rem",
        backdropFilter: "blur(8px)",
        zIndex: 1000,

        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {children}
    </div>
  );
};
