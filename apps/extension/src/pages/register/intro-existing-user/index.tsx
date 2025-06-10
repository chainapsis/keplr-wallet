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
import { FormattedMessage, useIntl } from "react-intl";
import { useTheme } from "styled-components";

export const RegisterIntroExistingUserScene: FunctionComponent = () => {
  const sceneTransition = useSceneTransition();
  const intl = useIntl();
  const theme = useTheme();

  const header = useRegisterHeader();
  useSceneEvents({
    onWillVisible: () => {
      header.setHeader({
        mode: "welcome",
        title: intl.formatMessage({
          id: "pages.register.intro-existing-user.title",
        }),
        paragraph: intl.formatMessage({
          id: "pages.register.intro-existing-user.paragraph",
        }),
      });
    },
  });

  return (
    <RegisterSceneBox>
      <Columns sum={2} gutter="2.5rem">
        <Column weight={1}>
          <Box height="100%">
            <RegisterH4
              color={
                theme.mode === "light"
                  ? ColorPalette["gray-400"]
                  : ColorPalette["gray-50"]
              }
            >
              <FormattedMessage id="pages.register.intro-existing-user.recovery-title" />
            </RegisterH4>
            <Gutter size="0.5rem" />
            <Subtitle3 color={ColorPalette["gray-200"]}>
              <FormattedMessage id="pages.register.intro-existing-user.recovery-paragraph" />
            </Subtitle3>

            <Gutter size="1.5rem" />
            <Button
              id="recovery-button"
              text={intl.formatMessage({
                id: "pages.register.intro-existing-user.recovery-button",
              })}
              size="large"
              left={<ArrowDownTrayIcon width="1rem" height="1rem" />}
              onClick={() => {
                sceneTransition.push("recover-mnemonic");
              }}
            />
          </Box>
        </Column>
        <Box
          width="1px"
          backgroundColor={
            theme.mode === "light"
              ? ColorPalette["gray-100"]
              : ColorPalette["gray-400"]
          }
        />
        <Column weight={1}>
          <Box height="100%">
            <RegisterH4
              color={
                theme.mode === "light"
                  ? ColorPalette["gray-400"]
                  : ColorPalette["gray-50"]
              }
            >
              <FormattedMessage id="pages.register.intro-existing-user.social-recovery-title" />
            </RegisterH4>

            <Gutter size="0.5rem" />
            <div style={{ flex: 1 }}>
              <Subtitle3 color={ColorPalette["gray-200"]}>
                <FormattedMessage id="pages.register.intro-existing-user.social-recovery-paragraph" />
              </Subtitle3>
            </div>

            <Stack gutter="0.625rem">
              <Button
                text={intl.formatMessage({
                  id: "pages.register.intro-existing-user.social-recovery-google-button",
                })}
                size="large"
                color="secondary"
                left={<GoogleIcon />}
                onClick={() => {
                  if (KeplrWalletPrivate.onGoogleSignInClick) {
                    KeplrWalletPrivate.onGoogleSignInClick(sceneTransition);
                  } else {
                    alert(
                      intl.formatMessage({ id: "error.not-supported-error" })
                    );
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
