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
import { CosmosApp } from "@keplr-wallet/ledger-cosmos";
import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
import { observer } from "mobx-react-lite";

type Step = "unknown" | "connected" | "app";

export const ConnectLedgerScene: FunctionComponent<{
  name: string;
  password: string;
  app: string;
  bip44Path: {
    account: number;
    change: number;
    addressIndex: number;
  };
}> = observer(({ name, password, app: propApp, bip44Path }) => {
  if (propApp !== "Cosmos" && propApp !== "Terra") {
    throw new Error(`Unsupported app: ${propApp}`);
  }

  const sceneTransition = useSceneTransition();

  const header = useRegisterHeader();
  useSceneEvents({
    onWillVisible: () => {
      header.setHeader({
        mode: "step",
        title: "Please connect your Hardware wallet",
        paragraphs: [
          "You need to connect Ethereum app in Ledger software, if you wanna add chain(Evmos, Injective) to Keplr wallet",
        ],
        stepCurrent: 2,
        stepTotal: 6,
      });
    },
  });

  const [step, setStep] = useState<Step>("unknown");
  // TODO: Add loading state

  const connectLedger = async () => {
    let transport = await TransportWebUSB.create();
    let app = new CosmosApp(propApp, transport);

    try {
      const version = await app.getVersion();
      if (version.device_locked) {
        throw new Error("Device is locked");
      }

      // XXX: You must not check "error_message".
      //      If "error_message" is not "No errors",
      //      probably it doesn't mean that the device is not connected.
      setStep("connected");
    } catch (e) {
      console.log(e);
      setStep("unknown");
      await transport.close();
      return;
    }

    let isAppOpened = false;
    try {
      const appInfo = await app.getAppInfo();
      if (
        appInfo.error_message === "No errors" &&
        appInfo.app_name === propApp
      ) {
        isAppOpened = true;
      }
    } catch (e) {
      // Ignore error
      console.log(e);
    }

    try {
      if (!isAppOpened) {
        await CosmosApp.openApp(transport, propApp);

        const maxRetry = 25;
        let i = 0;
        while (i < maxRetry) {
          // Reinstantiate the app with the new transport.
          // This is needed because the connection can be closed if app opened. (Maybe ledger's permission system handles dashboard, and each app differently.)
          transport = await TransportWebUSB.create();
          app = new CosmosApp(propApp, transport);

          const appInfo = await app.getAppInfo();
          if (
            appInfo.error_message === "No errors" &&
            appInfo.app_name === propApp
          ) {
            break;
          }

          i++;
          await new Promise((resolve) => setTimeout(resolve, 200));
        }
      }
    } catch {
      // Ignore error
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));
    const res = await app.getPublicKey(
      bip44Path.account,
      bip44Path.change,
      bip44Path.addressIndex
    );
    if (res.error_message === "No errors") {
      setStep("app");

      sceneTransition.replaceAll("finalize-key", {
        name,
        password,
        ledger: {
          pubKey: res.compressed_pk,
          app: propApp,
          bip44Path,
        },
      });
    } else {
      setStep("connected");
    }

    await transport.close();
  };

  return (
    <RegisterSceneBox>
      <Stack gutter="1.25rem">
        <StepView
          step={1}
          paragraph="Connect and unlock your Ledger."
          focused={step === "unknown"}
          completed={step !== "unknown"}
        />
        <StepView
          step={2}
          paragraph="Open the Cosmos app on your Ledger device."
          focused={step === "connected"}
          completed={step === "app"}
        />
      </Stack>

      <Gutter size="1.25rem" />

      <Box width="22.5rem" marginX="auto">
        <Button text="Next" size="large" onClick={connectLedger} />
      </Box>
    </RegisterSceneBox>
  );
});

const StepView: FunctionComponent<{
  step: number;
  paragraph: string;

  focused: boolean;
  completed: boolean;
}> = ({ step, paragraph, focused, completed }) => {
  return (
    <Box
      paddingX="2rem"
      paddingY="1.25rem"
      borderRadius="1.125rem"
      backgroundColor={focused ? ColorPalette["gray-500"] : "transparent"}
    >
      <XAxis alignY="center">
        <div>TODO: ICON</div>
        <Gutter size="1.25rem" />
        <YAxis>
          <XAxis>
            <H2
              style={{
                color: focused
                  ? ColorPalette["gray-10"]
                  : ColorPalette["gray-300"],
              }}
            >
              Step {step}
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
