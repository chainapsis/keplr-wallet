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
import Transport from "@ledgerhq/hw-transport";
import { useStore } from "../../../stores";
import { useNavigate } from "react-router";
import Eth from "@ledgerhq/hw-app-eth";
import { Buffer } from "buffer/";
import { PubKeySecp256k1 } from "@keplr-wallet/crypto";
import { LedgerUtils } from "../../../utils";

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

  // append mode일 경우 위의 name, password는 안쓰인다. 대충 빈 문자열 넣으면 된다.
  appendModeInfo?: {
    vaultId: string;
    afterEnableChains: string[];
  };
  stepPrevious: number;
  stepTotal: number;
}> = observer(
  ({
    name,
    password,
    app: propApp,
    bip44Path,
    appendModeInfo,
    stepPrevious,
    stepTotal,
  }) => {
    if (propApp !== "Cosmos" && propApp !== "Terra" && propApp !== "Ethereum") {
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
          stepCurrent: stepPrevious + 1,
          stepTotal: stepTotal,
        });
      },
    });

    const { chainStore, keyRingStore } = useStore();

    const navigate = useNavigate();

    const [step, setStep] = useState<Step>("unknown");
    const [isLoading, setIsLoading] = useState(false);

    const connectLedger = async () => {
      setIsLoading(true);

      let transport: Transport;
      try {
        transport = await TransportWebUSB.create();
      } catch {
        setStep("unknown");
        setIsLoading(false);
        return;
      }

      if (propApp === "Ethereum") {
        let ethApp = new Eth(transport);

        // Ensure that the keplr can connect to ethereum app on ledger.
        // getAppConfiguration() works even if the ledger is on screen saver mode.
        // To detect the screen saver mode, we should request the address before using.
        try {
          await ethApp.getAddress(`m/44'/60'/'0/0/0`);
        } catch (e) {
          // Device is locked or user is in home sceen or other app.
          if (
            e?.message.includes("(0x6b0c)") ||
            e?.message.includes("(0x6511)") ||
            e?.message.includes("(0x6e00)")
          ) {
            setStep("connected");
          } else {
            console.log(e);
            setStep("unknown");
            await transport.close();

            setIsLoading(false);
            return;
          }
        }

        transport = await LedgerUtils.tryAppOpen(transport, propApp);
        ethApp = new Eth(transport);

        try {
          const res = await ethApp.getAddress(
            `m/44'/60'/${bip44Path.account}'/${bip44Path.change}/${bip44Path.addressIndex}`
          );

          const pubKey = new PubKeySecp256k1(Buffer.from(res.publicKey, "hex"));

          setStep("app");

          if (appendModeInfo) {
            await keyRingStore.appendLedgerKeyApp(
              appendModeInfo.vaultId,
              pubKey.toBytes(true),
              propApp
            );
            await chainStore.enableChainInfoInUI(
              ...appendModeInfo.afterEnableChains
            );
            navigate("/welcome", {
              replace: true,
            });
          } else {
            sceneTransition.replaceAll("finalize-key", {
              name,
              password,
              ledger: {
                pubKey: pubKey.toBytes(),
                app: propApp,
                bip44Path,
              },
              stepPrevious: stepPrevious + 1,
              stepTotal: stepTotal,
            });
          }
        } catch (e) {
          console.log(e);
          setStep("connected");
        }

        await transport.close();

        setIsLoading(false);

        return;
      }

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

        setIsLoading(false);
        return;
      }

      transport = await LedgerUtils.tryAppOpen(transport, propApp);
      app = new CosmosApp(propApp, transport);

      const res = await app.getPublicKey(
        bip44Path.account,
        bip44Path.change,
        bip44Path.addressIndex
      );
      if (res.error_message === "No errors") {
        setStep("app");

        if (appendModeInfo) {
          await keyRingStore.appendLedgerKeyApp(
            appendModeInfo.vaultId,
            res.compressed_pk,
            propApp
          );
          await chainStore.enableChainInfoInUI(
            ...appendModeInfo.afterEnableChains
          );
          navigate("/welcome", {
            replace: true,
          });
        } else {
          sceneTransition.replaceAll("finalize-key", {
            name,
            password,
            ledger: {
              pubKey: res.compressed_pk,
              app: propApp,
              bip44Path,
            },
            stepPrevious: stepPrevious + 1,
            stepTotal: stepTotal,
          });
        }
      } else {
        setStep("connected");
      }

      await transport.close();

      setIsLoading(false);
    };

    return (
      <RegisterSceneBox>
        <Stack gutter="1.25rem">
          <StepView
            step={1}
            paragraph="Connect and unlock your Ledger."
            icon={
              <Box style={{ opacity: step !== "unknown" ? 0.5 : 1 }}>
                <LedgerIcon />
              </Box>
            }
            focused={step === "unknown"}
            completed={step !== "unknown"}
          />
          <StepView
            step={2}
            paragraph={`Open the ${propApp} app on your Ledger device.`}
            icon={
              <Box style={{ opacity: step !== "connected" ? 0.5 : 1 }}>
                {(() => {
                  switch (propApp) {
                    case "Terra":
                      // TODO
                      return <CosmosIcon />;
                    case "Ethereum":
                      return <EthereumIcon />;
                    default:
                      return <CosmosIcon />;
                  }
                })()}
              </Box>
            }
            focused={step === "connected"}
            completed={step === "app"}
          />
        </Stack>

        <Gutter size="1.25rem" />

        <Box width="22.5rem" marginX="auto">
          <Button
            text="Next"
            size="large"
            isLoading={isLoading}
            onClick={connectLedger}
          />
        </Box>
      </RegisterSceneBox>
    );
  }
);

const StepView: FunctionComponent<{
  step: number;
  paragraph: string;
  icon?: React.ReactNode;

  focused: boolean;
  completed: boolean;
}> = ({ step, paragraph, icon, focused, completed }) => {
  return (
    <Box
      paddingX="2rem"
      paddingY="1.25rem"
      borderRadius="1.125rem"
      backgroundColor={focused ? ColorPalette["gray-500"] : "transparent"}
    >
      <XAxis alignY="center">
        <div>{icon}</div>
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

const LedgerIcon: FunctionComponent = () => {
  return (
    <svg
      width="80"
      height="81"
      viewBox="0 0 80 81"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M11.6572 52.8184L11.6572 35.3273C11.6572 33.0077 13.5376 31.1273 15.8572 31.1273L65.2999 31.1273C67.6195 31.1273 69.4999 33.0077 69.4999 35.3273L69.4999 48.6184C69.4999 50.938 67.6195 52.8184 65.2999 52.8184L11.6572 52.8184Z"
        fill="#202330"
      />
      <rect
        x="11"
        y="48.2188"
        width="19.7191"
        height="58.5"
        rx="6"
        transform="rotate(-90 11 48.2188)"
        fill="url(#paint0_linear_2180_18341)"
      />
      <rect
        x="29.084"
        y="43.7676"
        width="11.1922"
        height="22.3845"
        rx="3"
        transform="rotate(-90 29.084 43.7676)"
        fill="black"
      />
      <path
        d="M11 30.9114C11 29.5791 12.0801 28.499 13.4124 28.499L59.6404 28.499C65.0857 28.499 69.5 32.9133 69.5 38.3586C69.5 43.8039 65.0857 48.2181 59.6404 48.2181L13.9579 48.2181C12.6873 48.2181 11.6573 49.2481 11.6573 50.5187C11.6573 51.7893 12.6873 52.8193 13.9579 52.8193L64.2416 52.8193C64.2416 53.1823 63.9473 53.4766 63.5843 53.4766L13.6292 53.4766C12.1771 53.4766 11 52.2994 11 50.8473L11 30.9114Z"
        fill="url(#paint1_linear_2180_18341)"
      />
      <circle
        cx="59.9679"
        cy="38.6864"
        r="5.58708"
        transform="rotate(-90 59.9679 38.6864)"
        fill="#92AEC3"
      />
      <circle
        cx="59.9679"
        cy="38.6855"
        r="4.92978"
        transform="rotate(-90 59.9679 38.6855)"
        fill="url(#paint2_linear_2180_18341)"
      />
      <path
        d="M46.0595 42.9139V43.6173H51.0959V40.4446H50.362V42.9139H46.0595ZM46.0595 32.4434V33.1468H50.362V35.6162H51.0959V32.4434H46.0595ZM43.4622 37.8856V36.2509H44.6134C45.1747 36.2509 45.3762 36.4302 45.3762 36.92V37.2097C45.3762 37.7132 45.1818 37.8856 44.6134 37.8856H43.4622ZM45.2897 38.1753C45.8148 38.0442 46.1817 37.5751 46.1817 37.0165C46.1817 36.6648 46.0379 36.3474 45.7645 36.0922C45.4191 35.7748 44.9586 35.6162 44.3615 35.6162H42.7427V40.4445H43.4622V38.5202H44.5415C45.0954 38.5202 45.3185 38.7409 45.3185 39.2928V40.4446H46.0524V39.4031C46.0524 38.6444 45.8653 38.3547 45.2897 38.2719V38.1753ZM39.2318 38.3339H41.4478V37.6993H39.2318V36.2508H41.6636V35.6162H38.4978V40.4445H41.7715V39.8099H39.2318V38.3339ZM36.8214 38.5891V38.9201C36.8214 39.6168 36.5551 39.8445 35.8861 39.8445H35.7278C35.0586 39.8445 34.7349 39.6375 34.7349 38.6787V37.382C34.7349 36.4164 35.0731 36.2162 35.7421 36.2162H35.8859C36.5407 36.2162 36.7493 36.4508 36.7565 37.0992H37.548C37.476 36.1473 36.8141 35.5473 35.8212 35.5473C35.3392 35.5473 34.9362 35.6922 34.6341 35.968C34.1808 36.375 33.929 37.0648 33.929 38.0304C33.929 38.9616 34.1449 39.6513 34.5909 40.0789C34.8931 40.3617 35.3104 40.5134 35.7205 40.5134C36.1522 40.5134 36.548 40.3478 36.7493 39.9892H36.85V40.4445H37.5119V37.9546H35.5621V38.5891H36.8214ZM30.4757 36.2508H31.26C32.0012 36.2508 32.4041 36.4301 32.4041 37.3958V38.6649C32.4041 39.6305 32.0012 39.8099 31.26 39.8099H30.4757V36.2508ZM31.3247 40.4446C32.699 40.4446 33.2096 39.4445 33.2096 38.0305C33.2096 36.5958 32.6629 35.6164 31.3102 35.6164H29.7561V40.4446H31.3247ZM26.2812 38.3339H28.4973V37.6993H26.2812V36.2508H28.713V35.6162H25.5472V40.4445H28.821V39.8099H26.2812V38.3339ZM22.0363 35.6162H21.3024V40.4445H24.6121V39.8099H22.0363V35.6162ZM16.2588 40.4446V43.6175H21.2951V42.9139H16.9926V40.4446H16.2588ZM16.2588 32.4434V35.6162H16.9926V33.1468H21.2951V32.4434H16.2588Z"
        fill="#92AEC3"
      />
      <defs>
        <linearGradient
          id="paint0_linear_2180_18341"
          x1="20.8596"
          y1="48.2187"
          x2="20.8596"
          y2="106.719"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#414866" />
          <stop offset="1" stopColor="#2F3652" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_2180_18341"
          x1="11"
          y1="44.9038"
          x2="56.1644"
          y2="17.6474"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#D3E4F0" />
          <stop offset="1" stopColor="#B6CBDB" />
        </linearGradient>
        <linearGradient
          id="paint2_linear_2180_18341"
          x1="59.9679"
          y1="33.7557"
          x2="59.9679"
          y2="43.6152"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#DCEEFD" />
          <stop offset="1" stopColor="#BACEDE" />
        </linearGradient>
      </defs>
    </svg>
  );
};

const CosmosIcon: FunctionComponent = () => {
  return (
    <svg
      width="80"
      height="81"
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

const EthereumIcon: FunctionComponent = () => {
  return (
    <svg
      width="80"
      height="80"
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="9" y="9" width="62" height="62" rx="15.6962" fill="#424247" />
      <path
        d="M39.879 34.5138V20L27.849 39.9635L39.879 34.5138Z"
        fill="#F6F6F9"
      />
      <path
        d="M39.879 47.2864L27.849 39.9646L39.879 34.5149V47.2864Z"
        fill="#F6F6F9"
      />
      <path
        d="M27.7705 42.8664L39.8591 59.8968V50.0083L27.7705 42.8664Z"
        fill="#F6F6F9"
      />
      <path
        d="M39.7849 34.5404V20L51.7849 40L39.7849 34.5404Z"
        fill="#ABABB5"
      />
      <path
        d="M39.7739 47.2417L51.7854 39.9305L39.7739 34.4888V47.2417Z"
        fill="#ABABB5"
      />
      <path
        d="M51.7848 42.8383L39.6992 59.8545V49.9743L51.7848 42.8383Z"
        fill="#ABABB5"
      />
    </svg>
  );
};
