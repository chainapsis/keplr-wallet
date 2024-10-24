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

const DEFAULT_COIN_TYPE = [118, 60];

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

const fetchRequiredAccountsFromKeystone = async (
  baseApp: Base,
  paths: string[]
) => {
  const keys = [];
  let device;
  let deviceId;
  let masterFingerprint;
  for (const path of paths) {
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
  }
  return {
    keys,
    device,
    deviceId,
    masterFingerprint,
  };
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
          id: "pages.register.connect-keystone.usb.title",
        }),
        paragraphs: [],
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
    let accounts;
    let paths = DEFAULT_KEYSTONE_PATHS;

    try {
      if (!isDefaultPath(bip44Path)) {
        paths = DEFAULT_COIN_TYPE.map(
          (each) =>
            `m/44'/${each}'/${bip44Path.account}'/${bip44Path.change}/${bip44Path.addressIndex}`
        );
      }

      const result = await fetchRequiredAccountsFromKeystone(baseApp, paths);
      accounts = {
        device: result?.device,
        deviceId: result?.deviceId,
        masterFingerprint: result?.masterFingerprint,
        keys: result?.keys,
        bip44Path: {
          account: bip44Path.account ?? 0,
          change: bip44Path.change ?? 0,
          addressIndex: bip44Path.addressIndex ?? 0,
        },
        connectionType: "USB",
      };

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
            id: "pages.register.connect-keystone.usb.step-1",
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
            id: "pages.register.connect-keystone.usb.step-2",
          })}
          icon={
            <Box style={{ opacity: step !== "connected" ? 0.5 : 1 }}>
              <CosmosIcon />
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

const CosmosIcon: FunctionComponent = () => {
  return (
    <svg
      width="auto"
      height="2rem"
      viewBox="0 0 80 81"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="8.5" y="9" width="62" height="62" rx="15.6962" fill="#424247" />
      <circle
        cx="39.8219"
        cy="40.321"
        r="12.1578"
        stroke="#F6F6F9"
        strokeWidth="4.04115"
      />
      <path
        d="M54.0003 25.498L24.999 54.4993"
        stroke="#F6F6F9"
        strokeWidth="4.04115"
      />
    </svg>
  );
};
