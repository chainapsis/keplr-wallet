import React, { FunctionComponent } from "react";
import { RegisterSceneBox } from "../components/register-scene-box";
import { Stack } from "../../../components/stack";
import { Button } from "../../../components/button";
import { useSceneTransition } from "../../../components/transition";

export const NewMnemonicScene: FunctionComponent = () => {
  const sceneTransition = useSceneTransition();

  return (
    <RegisterSceneBox>
      <Stack gutter="1rem">
        <Button
          text="NOOP"
          onClick={() => {
            sceneTransition.pop();
          }}
        />
      </Stack>
    </RegisterSceneBox>
  );
};
