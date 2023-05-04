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
import { XAxis } from "../../../components/axis";
import { Caption1, Subtitle3 } from "../../../components/typography";
import { Gutter } from "../../../components/gutter";
import { useRegisterHeader } from "../components/header";
import { RegisterH4 } from "../components/typography";
import { TextButton } from "../../../components/button-text";
import { AppleIcon, GoogleIcon, KeyIcon } from "../../../components/icon";

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
          <Box minHeight="15.625rem">
            <RegisterH4 color={ColorPalette["gray-50"]}>
              Via Recovery Phrase
            </RegisterH4>

            <Gutter size="0.5rem" />

            <Subtitle3 color={ColorPalette["gray-200"]}>
              Maximum control & high compatibility across all wallets
            </Subtitle3>

            <Gutter size="1.5rem" />

            <Stack gutter="0.625rem">
              <Button
                text="Create new recovery phrase"
                left={
                  <KeyIcon
                    width="1rem"
                    height="1rem"
                    color={ColorPalette["gray-10"]}
                  />
                }
                size="large"
                onClick={() => {
                  sceneTransition.push("new-mnemonic");
                }}
              />
              <TextButton
                text="Import existing recovery phrase"
                size="large"
                onClick={() => {
                  sceneTransition.replace("existing-user");
                }}
              />
            </Stack>

            <Box style={{ flex: 1 }} />

            <Columns sum={1} gutter="0.25rem" alignY="center">
              <XAxis>
                <ShieldIcon />
                <ShieldIcon />
                <ShieldIcon />
              </XAxis>

              <Caption1 color={ColorPalette["gray-200"]}>
                Higher Security
              </Caption1>
            </Columns>
          </Box>
        </Column>
        <Box width="1px" backgroundColor={ColorPalette["gray-400"]} />
        <Column weight={1}>
          <Box height="100%">
            <RegisterH4 color={ColorPalette["gray-50"]}>
              Sign-up with Google or Apple
            </RegisterH4>
            <Gutter size="0.5rem" />
            <Subtitle3 color={ColorPalette["gray-200"]}>
              Simple & easy registration
              <br />
              <br />
            </Subtitle3>
            <Gutter size="1.5rem" />

            <Stack gutter="0.625rem">
              <Button
                text="Connect with Google"
                size="large"
                color="secondary"
                left={<GoogleIcon />}
                onClick={() => {
                  alert("TODO: Not implemented yet");
                }}
              />
              <Button
                text="Connect with Apple ID"
                size="large"
                color="secondary"
                left={<AppleIcon />}
                onClick={() => {
                  alert("TODO: Not implemented yet");
                }}
              />
            </Stack>

            <Box style={{ flex: 1 }} />

            <Columns sum={1} gutter="0.25rem" alignY="center">
              <XAxis>
                <BoltIcon />
                <BoltIcon />
                <BoltIcon />
              </XAxis>

              <Caption1 color={ColorPalette["gray-200"]}>
                More Convenience
              </Caption1>
            </Columns>
          </Box>
        </Column>
      </Columns>
    </RegisterSceneBox>
  );
};

const ShieldIcon: FunctionComponent = () => {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8.00002 14.6663C6.45558 14.2775 5.18046 13.3912 4.17469 12.0077C3.16891 10.6241 2.66624 9.08812 2.66669 7.39967V3.33301L8.00002 1.33301L13.3334 3.33301V7.39967C13.3334 9.08856 12.8305 10.6248 11.8247 12.0083C10.8189 13.3919 9.54402 14.2779 8.00002 14.6663Z"
        fill="#ABABB5"
      />
    </svg>
  );
};

const BoltIcon: FunctionComponent = () => {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.74348 1.0633C9.94431 1.17526 10.0429 1.40975 9.98239 1.63158L8.65464 6.50002H13.5C13.6991 6.50002 13.8792 6.61814 13.9586 6.80074C14.0379 6.98335 14.0014 7.19562 13.8655 7.34118L6.86554 14.8412C6.70866 15.0093 6.45736 15.0487 6.25654 14.9367C6.05571 14.8248 5.95713 14.5903 6.01763 14.3685L7.34539 9.50002H2.50001C2.30091 9.50002 2.12079 9.38189 2.04144 9.19929C1.96209 9.01669 1.99863 8.80441 2.13448 8.65886L9.13448 1.15886C9.29137 0.990769 9.54266 0.951339 9.74348 1.0633Z"
        fill="#ABABB5"
      />
    </svg>
  );
};
