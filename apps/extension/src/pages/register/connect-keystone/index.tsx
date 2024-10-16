import { observer } from "mobx-react-lite";
import React, { FunctionComponent, ReactChild } from "react";
import { useRegisterHeader } from "../components/header";
import {
  useSceneEvents,
  useSceneTransition,
} from "../../../components/transition";
import { RegisterSceneBox } from "../components/register-scene-box";
import { Stack } from "../../../components/stack";
import { Box } from "../../../components/box";
import { Button } from "../../../components/button";
import { ColorPalette } from "../../../styles";
import { useTheme } from "styled-components";
import { FormattedMessage, useIntl } from "react-intl";

export const ConnectKeystoneScene: FunctionComponent<{
  name: string;
  password: string;
  stepPrevious: number;
  stepTotal: number;
}> = observer(({ name, password, stepPrevious, stepTotal }) => {
  const sceneTransition = useSceneTransition();
  const header = useRegisterHeader();
  const theme = useTheme();
  const intl = useIntl();
  const color =
    theme.mode === "light" ? ColorPalette["black"] : ColorPalette["white"];

  useSceneEvents({
    onWillVisible: () => {
      header.setHeader({
        mode: "step",
        title: intl.formatMessage({
          id: "pages.register.connect-keystone.title",
        }),
        paragraphs: [],
        stepCurrent: stepPrevious + 1,
        stepTotal: stepTotal,
      });
    },
  });

  const sync = () => {
    sceneTransition.push("scan-keystone", {
      name,
      password,
      stepPrevious: stepPrevious + 1,
      stepTotal,
    });
  };

  const span = (chunks: React.ReactNode[]) => (
    <span style={{ color }}>{chunks}</span>
  );

  return (
    <RegisterSceneBox style={{ alignItems: "center" }}>
      <Stack gutter="1.5rem">
        <Step
          num="1"
          text={
            <span>
              <FormattedMessage
                id="pages.register.connect-keystone.step-1"
                values={{ span }}
              />
            </span>
          }
        />
        <Step
          num="2"
          text={
            <span>
              <FormattedMessage
                id="pages.register.connect-keystone.step-2"
                values={{ span }}
              />
            </span>
          }
        />
        <Step
          num="3"
          text={
            <span>
              <FormattedMessage
                id="pages.register.connect-keystone.step-3"
                values={{ span }}
              />
            </span>
          }
        />
      </Stack>
      <a
        href="https://support.keyst.one/3rd-party-wallets/cosmos-wallets/keplr-extension?utm_source=keplr&utm_medium=moredetails&utm_id=20230419"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          marginTop: "2rem",
          color:
            theme.mode === "light" ? ColorPalette.black : ColorPalette.white,
          textDecoration: "none",
          fontSize: "1rem",
        }}
      >
        <FormattedMessage id="pages.register.connect-keystone.click-to-view-tutorial" />
      </a>
      <Button
        size="large"
        onClick={sync}
        text={intl.formatMessage({
          id: "pages.register.connect-keystone.sync",
        })}
        style={{ width: "22rem", marginTop: "3.5rem" }}
      />
    </RegisterSceneBox>
  );
});

const Step: FunctionComponent<{
  num: string;
  text: ReactChild;
}> = ({ num, text }) => {
  const theme = useTheme();
  return (
    <Box
      backgroundColor={
        theme.mode === "light"
          ? ColorPalette["gray-10"]
          : ColorPalette["gray-500"]
      }
      borderRadius="0.5rem"
      height="6.5rem"
      paddingX="2.06rem"
      style={{
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <Box
        style={{
          fontSize: "1.25rem",
          whiteSpace: "nowrap",
          marginRight: "3rem",
        }}
      >
        <FormattedMessage
          id="pages.register.connect-keystone.step-text"
          values={{ num }}
        />
      </Box>
      <Box
        style={{
          fontSize: "1rem",
          lineHeight: "1.5rem",
          color:
            theme.mode === "light"
              ? ColorPalette["gray-300"]
              : ColorPalette["gray-200"],
        }}
      >
        {text}
      </Box>
    </Box>
  );
};
