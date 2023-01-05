import React, { FunctionComponent } from "react";
import { RegisterSceneBox } from "../components/register-scene-box";
import { Stack } from "../../../components/stack";
import { Button } from "../../../components/button";
import { Gutter } from "../../../components/gutter";
import styled from "styled-components";
import { ColorPalette } from "../../../styles";
import { XAxis, YAxis } from "../../../components/axis";
import { useSceneTransition } from "../../../components/transition";

const Styles = {
  BrandingText: styled.div`
    font-weight: 400;
    font-size: 1.5rem;
    line-height: 1;
    letter-spacing: 1.17557px;
    color: ${ColorPalette["black"]};
  `,
};

export const RegisterIntroScene: FunctionComponent = () => {
  const sceneTransition = useSceneTransition();

  return (
    <RegisterSceneBox>
      <Stack gutter="1rem">
        <YAxis alignX="center">
          {/* TODO: Add logo */}
          <XAxis alignY="center">
            <div>LOGO IMAGE</div>
            <div>BRANDING TEXT IMAGE</div>
          </XAxis>
          <Gutter size="1.25rem" />
          <Styles.BrandingText>Wallet for the Interchain</Styles.BrandingText>
        </YAxis>
        <Gutter size="3.25rem" />
        <Button
          text="Create new seed"
          onClick={() => {
            sceneTransition.push("new-mnemonic");
          }}
        />
        <Button
          text="Import Existing Account"
          mode="light"
          onClick={() => {
            // TODO
          }}
        />
        <Button
          text="Connect Hardware Wallet"
          mode="text"
          onClick={() => {
            // TODO
          }}
        />
      </Stack>
    </RegisterSceneBox>
  );
};
