import React, { FunctionComponent, useState } from "react";
import { RegisterSceneBox } from "../components/register-scene-box";
import {
  useSceneEvents,
  useSceneTransition,
} from "../../../components/transition";
import { useRegisterHeader } from "../components/header";
import { Gutter } from "../../../components/gutter";
import { Box } from "../../../components/box";
import { XAxis, YAxis } from "../../../components/axis";
import { Body1, H2 } from "../../../components/typography";
import { ColorPalette } from "../../../styles";
import { Stack } from "../../../components/stack";
import { Button } from "../../../components/button";
import { TransportWebUSB } from "@keystonehq/hw-transport-webusb";
import Base from "@keystonehq/hw-app-base";
import { createKeystoneTransport } from "../../../utils/keystone";
import { observer } from "mobx-react-lite";
import { FormattedMessage, useIntl } from "react-intl";
import { useTheme } from "styled-components";
import KeystoneSDK, {
  Curve,
  DerivationAlgorithm,
} from "@keystonehq/keystone-sdk";
import { KeystoneIcon } from "../../../components/icon/keystone";
import { IconProps } from "../../../components/icon/types";

type Step = "unknown" | "connected" | "app";

const DEFAULT_KEYSTONE_PATHS = [
  "m/44'/118'/0'/0/0", // cosmos path
  "m/44'/60'/0'/0/0", // ethereum path
  "m/44'/529'/0'/0/0",
  "m/44'/394'/0'/0/0",
  "m/44'/234'/0'/0/0",
  "m/44'/564'/0'/0/0",
  "m/44'/459'/0'/0/0",
  "m/44'/330'/0'/0/0",
];

const isDefaultPath = (bip44Path: {
  account: number;
  change: number;
  addressIndex: number;
}) => {
  return (
    bip44Path.account === 0 &&
    bip44Path.change === 0 &&
    bip44Path.addressIndex === 0
  );
};

export const ConnectKeystoneUSBScene: FunctionComponent<{
  name: string;
  password: string;
  bip44Path: {
    account: number;
    change: number;
    addressIndex: number;
  };
  stepPrevious: number;
  stepTotal: number;
}> = observer(({ name, password, bip44Path, stepPrevious, stepTotal }) => {
  const intl = useIntl();

  const sceneTransition = useSceneTransition();

  const header = useRegisterHeader();
  useSceneEvents({
    onWillVisible: () => {
      header.setHeader({
        mode: "step",
        title: intl.formatMessage({
          id: "pages.register.connect-keystone.title",
        }),
        paragraphs: [
          intl.formatMessage({
            id: "pages.register.connect-keystone.paragraph",
          }),
        ],
        stepCurrent: stepPrevious + 1,
        stepTotal: stepTotal,
      });
    },
  });

  const [step, setStep] = useState<Step>("unknown");
  const [isLoading, setIsLoading] = useState(false);

  const connectKeystone = async () => {
    setIsLoading(true);

    let transport: TransportWebUSB;

    try {
      transport = await createKeystoneTransport();
    } catch {
      setStep("unknown");
      setIsLoading(false);
      return;
    }

    const baseApp = new Base(transport as any);

    // step1: make sure the device is connected and unlocked
    try {
      await baseApp.getAppConfig();
      setStep("connected");
    } catch (e) {
      console.log(e);
      setStep("unknown");
      setIsLoading(false);
      return;
    }

    // step2: get the keystone accounts
    const keys = [];
    let device: string | undefined;
    let masterFingerprint = "";
    let deviceId: string | undefined;
    let accounts;

    try {
      if (!isDefaultPath(bip44Path)) {
        const setPath = `m/44'/118'/${bip44Path.account}'/${bip44Path.change}/${bip44Path.addressIndex}`;
        const res = await baseApp.getURAccount(
          setPath,
          Curve.secp256k1,
          DerivationAlgorithm.slip10
        );
        const sdk = new KeystoneSDK({
          origin: "Keplr Extension",
        });
        accounts = sdk.parseMultiAccounts(res.toUR());
        accounts = {
          ...accounts,
          connectionType: "USB",
        };
      } else {
        for (const path of DEFAULT_KEYSTONE_PATHS) {
          const res = await baseApp.getURAccount(
            path,
            Curve.secp256k1,
            DerivationAlgorithm.slip10
          );
          const sdk = new KeystoneSDK({
            origin: "Keplr Extension",
          });
          const account = sdk.parseMultiAccounts(res.toUR());
          keys.push(account.keys[0]);
          device = account.device;
          deviceId = account.deviceId;
          masterFingerprint = account.masterFingerprint;
          accounts = {
            device,
            deviceId,
            masterFingerprint,
            keys,
            connectionType: "USB",
          };
        }
      }

      setStep("app");
      //
      sceneTransition.replaceAll("finalize-key", {
        name,
        password,
        keystone: accounts,
        stepPrevious: stepPrevious + 1,
        stepTotal,
      });
    } catch (e) {
      console.log(e);
      setStep("unknown");
    }
    setIsLoading(false);

    return;
  };

  return (
    <RegisterSceneBox>
      <Stack gutter="1.25rem">
        <StepView
          step={1}
          paragraph={intl.formatMessage({
            id: "pages.register.connect-keystone.connect-keystone-step-paragraph",
          })}
          icon={
            <Box style={{ opacity: step !== "unknown" ? 0.5 : 1 }}>
              <KeystoneIcon />
            </Box>
          }
          focused={step === "unknown"}
          completed={step !== "unknown"}
        />
        <StepView
          step={2}
          paragraph={intl.formatMessage({
            id: "pages.register.connect-keystone.fetch-address-paragraph",
          })}
          icon={
            <Box style={{ opacity: step !== "connected" ? 0.5 : 1 }}>
              <KeystoneConnectIcon width={32} height={27} />
            </Box>
          }
          focused={step === "connected"}
          completed={step === "app"}
        />
      </Stack>
      <Gutter size="1.25rem" />
      <Box width="22.5rem" marginX="auto">
        <Button
          text={intl.formatMessage({
            id: "button.next",
          })}
          size="large"
          isLoading={isLoading}
          onClick={connectKeystone}
        />
      </Box>
    </RegisterSceneBox>
  );
});

const StepView: FunctionComponent<{
  step: number;
  paragraph: string;
  icon?: React.ReactNode;

  focused: boolean;
  completed: boolean;
}> = ({ step, paragraph, icon, focused, completed }) => {
  const theme = useTheme();

  return (
    <Box
      paddingX="2rem"
      paddingY="1.25rem"
      borderRadius="1.125rem"
      backgroundColor={
        focused
          ? theme.mode === "light"
            ? ColorPalette["gray-50"]
            : ColorPalette["gray-500"]
          : theme.mode === "light"
          ? "none"
          : "transparent"
      }
    >
      <XAxis alignY="center">
        <div>{icon}</div>
        <Gutter size="1.25rem" />
        <YAxis>
          <XAxis>
            <H2
              style={{
                color: focused
                  ? theme.mode === "light"
                    ? ColorPalette["gray-400"]
                    : ColorPalette["gray-10"]
                  : theme.mode === "light"
                  ? ColorPalette["gray-200"]
                  : ColorPalette["gray-300"],
              }}
            >
              <FormattedMessage
                id="pages.register.connect-ledger.step-text"
                values={{ step }}
              />
            </H2>
            {completed ? (
              <React.Fragment>
                <Gutter size="0.25rem" />
                <CheckIcon
                  color={
                    focused ? ColorPalette["gray-10"] : ColorPalette["gray-300"]
                  }
                />
              </React.Fragment>
            ) : null}
          </XAxis>
          <Gutter size="0.5rem" />
          <Body1
            style={{
              color: focused
                ? theme.mode === "light"
                  ? ColorPalette["gray-300"]
                  : ColorPalette["gray-200"]
                : theme.mode === "light"
                ? ColorPalette["gray-200"]
                : ColorPalette["gray-300"],
            }}
          >
            {paragraph}
          </Body1>
        </YAxis>
      </XAxis>
    </Box>
  );
};

const CheckIcon: FunctionComponent<{
  color: string;
}> = ({ color }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="25"
      fill="none"
      viewBox="0 0 24 25"
    >
      <path
        fill={color}
        d="M9 16.67L4.83 12.5l-1.42 1.41L9 19.5l12-12-1.41-1.41L9 16.67z"
      />
    </svg>
  );
};

const KeystoneConnectIcon: FunctionComponent<IconProps> = ({
  width,
  height,
}) => {
  return (
    <svg width={width} height={height} viewBox="0 0 320 270" fill="none">
      <circle
        cx="163.077"
        cy="134.769"
        r="129.077"
        stroke="#505766"
        strokeOpacity="0.6"
        strokeWidth="4"
      />
      <path d="M118 72H206V197H118V72Z" stroke="#787A8D" strokeWidth="4" />
      <path
        d="M125 79H199V183H125V79Z"
        fill="url(#paint0_linear_1099_541)"
        fillOpacity="0.4"
      />
      <path
        d="M125 79H199V183H125V79Z"
        fill="url(#paint1_radial_1099_541)"
        fillOpacity="0.2"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M131 93H149.5V98H131V93ZM131 102H178V107H131V102ZM154 111H131V116H154V111Z"
        fill="#787A8D"
      />
      <rect
        x="2"
        y="13.0771"
        width="94.4615"
        height="94.4615"
        rx="47.2308"
        fill="#040A18"
      />
      <rect
        x="2"
        y="13.0771"
        width="94.4615"
        height="94.4615"
        rx="47.2308"
        stroke="#4F4F59"
        strokeWidth="4"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M58.4613 48.0008L49.2306 36.7188L39.9998 48.0008H47.1793V75.0331L39.9998 70.4645V66.0356C41.811 65.2443 43.0767 63.437 43.0767 61.3341C43.0767 58.5019 40.7807 56.2059 37.9485 56.2059C35.1163 56.2059 32.8203 58.5019 32.8203 61.3341C32.8203 63.437 34.0861 65.2443 35.8972 66.0356V71.5905V72.7166L36.8473 73.3212L47.1793 79.8959V80.1376V82.1888H51.2819V80.1376V75.7935L61.6139 69.2186L62.5639 68.614V67.488V61.3341H65.128V52.1034H55.8972V61.3341H58.4613V66.3619L51.2819 70.9307V48.0008H58.4613Z"
        fill="white"
        fillOpacity="0.9"
      />
      <rect
        x="223.538"
        y="160.77"
        width="94.4615"
        height="94.4615"
        rx="47.2308"
        fill="#040A18"
      />
      <rect
        x="223.538"
        y="160.77"
        width="94.4615"
        height="94.4615"
        rx="47.2308"
        stroke="#4F4F59"
        strokeWidth="4"
      />
      <path
        d="M265.299 224.41H254.358V216.205M276.239 224.41H287.179V216.205M276.239 191.59H287.179V199.795M265.299 191.59H254.358V199.795"
        stroke="white"
        strokeOpacity="0.9"
        strokeWidth="4.10256"
      />
      <path d="M252.308 208H289.231" stroke="white" strokeWidth="4.10256" />
      <defs>
        <linearGradient
          id="paint0_linear_1099_541"
          x1="125"
          y1="79"
          x2="138.205"
          y2="183.585"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="white" stopOpacity="0.6" />
          <stop offset="1" stopColor="white" stopOpacity="0.1" />
        </linearGradient>
        <radialGradient
          id="paint1_radial_1099_541"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(125 79) rotate(52.6346) scale(60.9659 64.3597)"
        >
          <stop stopColor="white" />
          <stop offset="1" stopColor="white" stopOpacity="0.2" />
        </radialGradient>
      </defs>
    </svg>
  );
};
