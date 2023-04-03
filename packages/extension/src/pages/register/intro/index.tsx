import React, { FunctionComponent } from "react";
import { RegisterSceneBox } from "../components/register-scene-box";
import { Stack } from "../../../components/stack";
import { Button } from "../../../components/button";
import {
  useSceneEvents,
  useSceneTransition,
} from "../../../components/transition";
import { useRegisterHeader } from "../components/header";

export const RegisterIntroScene: FunctionComponent = () => {
  const sceneTransition = useSceneTransition();

  const header = useRegisterHeader();
  useSceneEvents({
    onWillVisible: () => {
      header.setHeader({
        mode: "intro",
      });
    },
  });

  return (
    <RegisterSceneBox>
      <Stack gutter="1.25rem">
        <Button
          text="Create a new wallet"
          size="large"
          onClick={() => {
            sceneTransition.push("new-user");
          }}
        />
        <Button
          text="Import an existing wallet"
          size="large"
          onClick={() => {
            sceneTransition.push("existing-user");
          }}
        />
        <Button
          text="Connect Hardware Wallet"
          size="large"
          onClick={() => {
            // TODO
          }}
        />
      </Stack>
    </RegisterSceneBox>
  );
};
