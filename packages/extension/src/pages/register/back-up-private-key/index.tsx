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
import { FormattedMessage, useIntl } from "react-intl";
import { useTheme } from "styled-components";

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
  const intl = useIntl();
  const theme = useTheme();

  const header = useRegisterHeader();
  useSceneEvents({
    onWillVisible: () => {
      header.setHeader({
        mode: "step",
        title: intl.formatMessage({
          id: "pages.register.back-up-private-key.title",
        }),
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
        backgroundColor={
          theme.mode === "light"
            ? ColorPalette["white"]
            : ColorPalette["gray-700"]
        }
        borderRadius="0.5rem"
        borderColor={
          theme.mode === "light"
            ? ColorPalette["gray-100"]
            : ColorPalette["gray-400"]
        }
        borderWidth="1px"
        padding="1.25rem"
      >
        {!isShowPrivate ? (
          <Box cursor="pointer" onClick={() => setIsShowPrivate(true)}>
            <BlurBackdrop>
              <Subtitle3
                color={
                  theme.mode === "light"
                    ? ColorPalette["gray-500"]
                    : ColorPalette["gray-300"]
                }
              >
                <FormattedMessage id="pages.register.back-up-private-key.blur-text" />
              </Subtitle3>
            </BlurBackdrop>
          </Box>
        ) : null}

        <Body1
          color={
            theme.mode === "light"
              ? ColorPalette["gray-400"]
              : ColorPalette["gray-100"]
          }
          style={{ wordWrap: "break-word", fontFeatureSettings: `"calt" 0` }}
        >
          {Buffer.from(privateKey.value).toString("hex")}
        </Body1>

        <Gutter size="2rem" />

        <CopyToClipboard text={Buffer.from(privateKey.value).toString("hex")} />
      </Box>

      <Gutter size="1.25rem" />

      <WarningBox
        title={intl.formatMessage({
          id: "pages.register.back-up-private-key.warning-title",
        })}
        paragraph={
          <Box>
            <FormattedMessage
              id="pages.register.back-up-private-key.warning-paragraph"
              values={{ br: <br /> }}
            />
          </Box>
        }
      />

      <Gutter size="1.5rem" />

      <Button
        text={intl.formatMessage({
          id: "pages.register.back-up-private-key.import-button",
        })}
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
  const theme = useTheme();

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        background:
          theme.mode === "light"
            ? "rgba(228, 228, 228, 0.5)"
            : "rgba(38, 38, 38, 0.5)",
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
