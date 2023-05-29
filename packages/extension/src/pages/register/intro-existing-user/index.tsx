import React, { FunctionComponent } from "react";
import { RegisterSceneBox } from "../components/register-scene-box";
import { Stack } from "../../../components/stack";
import { Button } from "../../../components/button";
import {
  useSceneEvents,
  useSceneTransition,
} from "../../../components/transition";
import { Column, Columns } from "../../../components/column";
import { Box } from "../../../components/box";
import { ColorPalette } from "../../../styles";
import { Subtitle3 } from "../../../components/typography";
import { Gutter } from "../../../components/gutter";
import { useRegisterHeader } from "../components/header";
import { RegisterH4 } from "../components/typography";
import { ArrowDownTrayIcon, GoogleIcon } from "../../../components/icon";
import * as KeplrWalletPrivate from "keplr-wallet-private";

export const RegisterIntroExistingUserScene: FunctionComponent = () => {
  const sceneTransition = useSceneTransition();

  const header = useRegisterHeader();
  useSceneEvents({
    onWillVisible: () => {
      header.setHeader({
        mode: "welcome",
        title: "Welcome Back to Keplr",
        paragraph: "Glad you’re back! 🫶",
      });
    },
  });

  return (
    <RegisterSceneBox>
      <Columns sum={2} gutter="2.5rem">
        <Column weight={1}>
          <Box height="100%">
            <RegisterH4 color={ColorPalette["gray-50"]}>
              Recovery Phrase or Private Key
            </RegisterH4>
            <Gutter size="0.5rem" />
            <Subtitle3 color={ColorPalette["gray-200"]}>
              Use an existing 12/24 word recovery phrase or private key. You can
              also import wallets from other wallet providers.
            </Subtitle3>

            <Gutter size="1.5rem" />
            <Button
              text="Use recovery phrase or private key"
              size="large"
              left={<ArrowDownTrayIcon width="1rem" height="1rem" />}
              onClick={() => {
                sceneTransition.push("recover-mnemonic");
              }}
            />
          </Box>
        </Column>
        <Box width="1px" backgroundColor={ColorPalette["gray-400"]} />
        <Column weight={1}>
          <Box height="100%">
            <RegisterH4 color={ColorPalette["gray-50"]}>Use Google</RegisterH4>

            <div style={{ flex: 1 }} />

            <Stack gutter="0.625rem">
              <Button
                text="Connect with Google"
                size="large"
                color="secondary"
                left={<GoogleIcon />}
                onClick={() => {
                  if (KeplrWalletPrivate.onGoogleSignInClick) {
                    KeplrWalletPrivate.onGoogleSignInClick(sceneTransition);
                  } else {
                    alert("Not supported");
                  }
                }}
              />
            </Stack>
          </Box>
        </Column>
      </Columns>
    </RegisterSceneBox>
  );
};
