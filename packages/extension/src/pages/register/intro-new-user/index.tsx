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
import { YAxis } from "../../../components/axis";
import { Subtitle2, Subtitle3 } from "../../../components/typography";
import { Gutter } from "../../../components/gutter";
import { useRegisterHeader } from "../components/header";

export const RegisterIntroNewUserScene: FunctionComponent = () => {
  const sceneTransition = useSceneTransition();

  const header = useRegisterHeader();
  useSceneEvents({
    onWillVisible: () => {
      header.setHeader({
        mode: "welcome",
        title: "Welcome to Keplr",
        paragraph: "Select the way you want to create your wallet",
      });
    },
  });

  return (
    <RegisterSceneBox>
      <Columns sum={2} gutter="2.5rem">
        <Column weight={1}>
          <YAxis>
            <Subtitle2>Via Recovery Phrase</Subtitle2>
            <Gutter size="0.5rem" />
            <Subtitle3>
              Maximum control & high compatibility across all wallets
            </Subtitle3>
            <Gutter size="1.5rem" />
          </YAxis>
          <Stack gutter="0.625rem">
            <Button
              text="Create new recovery phrase"
              size="large"
              onClick={() => {
                sceneTransition.push("new-mnemonic");
              }}
            />
            <Button
              text="Import existing recovery phrase"
              size="large"
              onClick={() => {
                sceneTransition.replace("existing-user");
              }}
            />
          </Stack>
        </Column>
        <Box width="1px" backgroundColor={ColorPalette["gray-400"]} />
        <Column weight={1}>
          <YAxis>
            <Subtitle2>Sign-up with Google or Apple</Subtitle2>
            <Gutter size="0.625rem" />
            <Subtitle3>Simple & easy registration</Subtitle3>
            <Gutter size="1.5rem" />
          </YAxis>
          <Stack gutter="0.625rem">
            <Button
              text="Connect with Google"
              size="large"
              color="secondary"
              onClick={() => {
                alert("TODO: Not implemented yet");
              }}
            />
            <Button
              text="Connect with Apple ID"
              size="large"
              color="secondary"
              onClick={() => {
                alert("TODO: Not implemented yet");
              }}
            />
          </Stack>
        </Column>
      </Columns>
    </RegisterSceneBox>
  );
};
