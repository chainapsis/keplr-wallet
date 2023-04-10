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

export const RegisterIntroExistingUserScene: FunctionComponent = () => {
  const sceneTransition = useSceneTransition();

  const header = useRegisterHeader();
  useSceneEvents({
    onWillVisible: () => {
      header.setHeader({
        mode: "welcome",
        title: "Welcome Back to Keplr",
        paragraph: "Glad you’re back!",
      });
    },
  });

  return (
    <RegisterSceneBox>
      <Columns sum={2} gutter="2.5rem">
        <Column weight={1}>
          {/* TODO: ㅅㅂ 이거 현재 컴포넌트 시스템으로 처리할 수가 없다 */}
          <YAxis>
            <Subtitle2>Via Recovery Phrase or Private Key</Subtitle2>
            <Gutter size="0.5rem" />
            <Subtitle3>
              You can also import your wallets from other Interchain wallet
              providers with this option.
            </Subtitle3>
            {/* TODO: Make and use Flex component? */}
            <div style={{ flex: 1 }} />
            <Button
              text="Use Recovery Phrase"
              size="large"
              onClick={() => {
                sceneTransition.push("recover-mnemonic");
              }}
            />
          </YAxis>
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
                sceneTransition.push("new-mnemonic");
              }}
            />
            <Button
              text="Connect with Apple ID"
              size="large"
              color="secondary"
              onClick={() => {
                sceneTransition.push("recover-mnemonic");
              }}
            />
          </Stack>
        </Column>
      </Columns>
    </RegisterSceneBox>
  );
};
