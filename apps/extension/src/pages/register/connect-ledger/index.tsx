import React, { Fragment, FunctionComponent, useState } from "react";
import { RegisterSceneBox } from "../components/register-scene-box";
import {
  useSceneEvents,
  useSceneTransition,
} from "../../../components/transition";
import { useRegisterHeader } from "../components/header";
import { Gutter } from "../../../components/gutter";
import { Box } from "../../../components/box";
import { XAxis, YAxis } from "../../../components/axis";
import { Body1, H2, Subtitle2 } from "../../../components/typography";
import { ColorPalette } from "../../../styles";
import { Stack } from "../../../components/stack";
import { Button } from "../../../components/button";
import { App, AppHRP, CosmosApp } from "@keplr-wallet/ledger-cosmos";
import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
import { observer } from "mobx-react-lite";
import Transport from "@ledgerhq/hw-transport";
import { useStore } from "../../../stores";
import { useNavigate } from "react-router";
import Eth from "@ledgerhq/hw-app-eth";
import { LedgerError, StarknetClient } from "@ledgerhq/hw-app-starknet";
import { Buffer } from "buffer/";
import { PubKeySecp256k1, PubKeyStarknet } from "@keplr-wallet/crypto";
import { LedgerUtils } from "../../../utils";
import { Checkbox } from "../../../components/checkbox";
import TransportWebHID from "@ledgerhq/hw-transport-webhid";
import { useConfirm } from "../../../hooks/confirm";
import { FormattedMessage, useIntl } from "react-intl";
import { useTheme } from "styled-components";
import { STARKNET_LEDGER_DERIVATION_PATH } from "../../sign/utils/handle-starknet-sign";
import { GuideBox } from "../../../components/guide-box";

type Step = "unknown" | "connected" | "app";

export const ConnectLedgerScene: FunctionComponent<{
  name: string;
  password: string;
  app: App | "Ethereum" | "Starknet";
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
    const intl = useIntl();

    const theme = useTheme();

    if (
      !Object.keys(AppHRP).includes(propApp) &&
      propApp !== "Ethereum" &&
      propApp !== "Starknet"
    ) {
      throw new Error(`Unsupported app: ${propApp}`);
    }

    const sceneTransition = useSceneTransition();

    const header = useRegisterHeader();
    useSceneEvents({
      onWillVisible: () => {
        header.setHeader({
          mode: "step",
          title: intl.formatMessage({
            id: "pages.register.connect-ledger.title",
          }),
          paragraphs:
            propApp !== "Ethereum" && propApp !== "Starknet"
              ? [
                  intl.formatMessage({
                    id: "pages.register.connect-ledger.paragraph",
                  }),
                ]
              : undefined,
          stepCurrent: stepPrevious + 1,
          stepTotal: stepTotal,
        });
      },
    });

    const { chainStore, keyRingStore, uiConfigStore } = useStore();

    const navigate = useNavigate();
    const confirm = useConfirm();

    const [step, setStep] = useState<Step>("unknown");
    const [isLoading, setIsLoading] = useState(false);

    const connectLedger = async () => {
      setIsLoading(true);

      let transport: Transport;

      try {
        transport =
          // XXX: Use WebHID for Starknet because WebUSB doesn't work for Starknet app.
          uiConfigStore.useWebHIDLedger || propApp === "Starknet"
            ? await TransportWebHID.create()
            : await TransportWebUSB.create();
      } catch (e) {
        console.log(e);
        setStep("unknown");
        setIsLoading(false);
        return;
      }

      switch (propApp) {
        case "Cosmos":
        case "Terra":
        case "Secret": {
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

          await LedgerUtils.tryAppOpen(transport, propApp);
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

          return;
        }
        case "Ethereum": {
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

          await LedgerUtils.tryAppOpen(transport, propApp);
          ethApp = new Eth(transport);

          try {
            const res = await ethApp.getAddress(
              `m/44'/60'/${bip44Path.account}'/${bip44Path.change}/${bip44Path.addressIndex}`
            );

            const pubKey = new PubKeySecp256k1(
              Buffer.from(res.publicKey, "hex")
            );

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

              sceneTransition.push("enable-chains", {
                vaultId: appendModeInfo.vaultId,
                keyType: "ledger",
                candidateAddresses: [],
                isFresh: false,
                skipWelcome: true,
                fallbackStarknetLedgerApp: true,
                stepPrevious: stepPrevious,
                stepTotal: stepTotal,
              });
              // navigate("/welcome", {
              //   replace: true,
              // });
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
        case "Starknet": {
          transport = await LedgerUtils.tryAppOpen(transport, propApp);
          const starknetApp = new StarknetClient(transport);
          const res = await starknetApp.getPubKey(
            STARKNET_LEDGER_DERIVATION_PATH,
            false
          );
          switch (res.returnCode) {
            case LedgerError.BadCla:
            case LedgerError.BadIns:
              setIsLoading(false);
              setStep("connected");

              await transport.close();

              return;
            case LedgerError.UserRejected:
              setIsLoading(false);
              setStep("app");

              await transport.close();

              return;
            case LedgerError.NoError:
              const pubKey = new PubKeyStarknet(res.publicKey);

              if (appendModeInfo) {
                await keyRingStore.appendLedgerKeyApp(
                  appendModeInfo.vaultId,
                  pubKey.toBytes(),
                  propApp
                );
                await chainStore.enableChainInfoInUI(
                  ...appendModeInfo.afterEnableChains
                );
              }

              navigate("/welcome", {
                replace: true,
              });

              setIsLoading(false);
              setStep("app");

              await transport.close();

              return;
            default:
              setIsLoading(false);
              setStep("unknown");

              await transport.close();

              return;
          }
        }
      }
    };

    return (
      <RegisterSceneBox>
        <Stack gutter="1.25rem">
          <StepView
            step={1}
            paragraph={intl.formatMessage({
              id: "pages.register.connect-ledger.connect-ledger-step-paragraph",
            })}
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
            paragraph={intl.formatMessage(
              { id: "pages.register.connect-ledger.open-app-step-paragraph" },
              { app: propApp }
            )}
            icon={
              <Box style={{ opacity: step !== "connected" ? 0.5 : 1 }}>
                {(() => {
                  switch (propApp) {
                    case "Terra":
                      return <TerraIcon />;
                    case "Ethereum":
                      return <EthereumIcon />;
                    case "Secret":
                      return <SecretIcon />;
                    case "Starknet":
                      return <StarknetIcon />;
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

        {propApp !== "Starknet" && (
          <Fragment>
            <Gutter size="1.25rem" />
            <YAxis alignX="center">
              <XAxis alignY="center">
                <Checkbox
                  checked={uiConfigStore.useWebHIDLedger}
                  onChange={async (checked) => {
                    if (checked && !window.navigator.hid) {
                      await confirm.confirm(
                        intl.formatMessage({
                          id: "pages.register.connect-ledger.use-hid-confirm-title",
                        }),
                        intl.formatMessage({
                          id: "pages.register.connect-ledger.use-hid-confirm-paragraph",
                        }),
                        {
                          forceYes: true,
                        }
                      );
                      await browser.tabs.create({
                        url: "chrome://flags/#enable-experimental-web-platform-features",
                      });
                      window.close();
                      return;
                    }

                    uiConfigStore.setUseWebHIDLedger(checked);
                  }}
                />
                <Gutter size="0.5rem" />
                <Subtitle2 color={ColorPalette["gray-300"]}>
                  <FormattedMessage id="pages.register.connect-ledger.use-hid-text" />
                </Subtitle2>
              </XAxis>
            </YAxis>
          </Fragment>
        )}

        <Gutter size="1.25rem" />

        {propApp === "Starknet" && (
          <GuideBox
            title="The custom derivation path set in the previous step does not apply to Starknet App accounts."
            backgroundColor={
              theme.mode === "light"
                ? ColorPalette["gray-50"]
                : ColorPalette["gray-500"]
            }
          />
        )}

        <Gutter size="1.25rem" />

        <Box width="22.5rem" marginX="auto">
          <Button
            text={intl.formatMessage({
              id: "button.next",
            })}
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
  const theme = useTheme();

  return (
    <svg
      width="80"
      height="81"
      viewBox="0 0 80 81"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="8.5"
        y="9"
        width="62"
        height="62"
        rx="15.6962"
        fill={
          theme.mode === "light"
            ? ColorPalette["gray-300"]
            : ColorPalette["gray-400"]
        }
      />
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
  const theme = useTheme();

  return (
    <svg
      width="80"
      height="80"
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="9"
        y="9"
        width="62"
        height="62"
        rx="15.6962"
        fill={
          theme.mode === "light"
            ? ColorPalette["gray-300"]
            : ColorPalette["gray-400"]
        }
      />
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

const TerraIcon: FunctionComponent = () => {
  const theme = useTheme();

  return (
    <svg
      width="80"
      height="81"
      viewBox="0 0 80 81"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="8.5"
        y="9"
        width="62"
        height="62"
        rx="15.6962"
        fill={
          theme.mode === "light"
            ? ColorPalette["gray-300"]
            : ColorPalette["gray-400"]
        }
      />
      <path
        xmlns="http://www.w3.org/2000/svg"
        d="M30.9452 43.907C30.6265 43.3646 29.047 40.8402 27.8945 39.2868C26.7421 37.7333 25.271 36.1999 24.044 34.5995C23.9829 34.7669 23.9219 34.9343 23.8677 35.1017C23.5808 35.9441 23.3653 36.8087 23.2237 37.6864C22.9254 39.4936 22.9254 41.3365 23.2237 43.1437C23.3764 44.0224 23.6031 44.8869 23.9016 45.7283C24.1719 46.5436 24.5027 47.3381 24.8913 48.1054C25.2871 48.8721 25.7403 49.6085 26.2472 50.3084C26.7665 51.0015 27.3351 51.6571 27.9488 52.2703C29.0238 53.3331 30.2392 54.2476 31.5621 54.9889C32.6332 55.5849 32.9993 55.5648 33.1823 55.5514C33.3857 55.2233 33.5416 51.286 33.3924 50.295C33.0338 48.0211 32.2004 45.8458 30.9452 43.907ZM51.2149 27.7495C51.1437 27.6916 51.0689 27.6379 50.9912 27.5888C48.6781 25.7258 45.8875 24.5323 42.9293 24.1411C39.971 23.7498 36.9609 24.1761 34.2331 25.3724C34.0704 25.3724 33.8805 25.3724 33.6772 25.3323C32.8536 25.3485 32.0463 25.5622 31.3248 25.955C30.857 26.2295 30.4096 26.5241 29.969 26.8389C29.2617 27.3474 28.5953 27.9094 27.9759 28.5196C27.3622 29.1328 26.7936 29.7884 26.2743 30.4815C25.7572 31.187 25.2949 31.9302 24.8913 32.7046L24.749 32.9858C25.4269 33.1867 27.9216 32.5706 30.3825 31.4323C30.9457 32.4115 31.7532 33.2321 32.7281 33.8161C32.28 34.5861 32.0968 35.479 32.2061 36.3606C32.7145 40.184 38.3074 42.6214 40.1852 43.4249L40.3411 43.4785C39.404 44.0888 38.5807 44.8545 37.9074 45.7417C37.4603 46.3162 37.1542 46.9852 37.0131 47.6963C36.8719 48.4073 36.8996 49.141 37.0939 49.8397C38.043 53.2546 41.4054 56.1406 43.5002 56.1406H43.6358C44.3963 55.9854 45.1406 55.7613 45.8594 55.471C46.5352 55.6748 47.265 55.6099 47.8931 55.2902C50.8061 53.7904 53.2224 51.4967 54.8554 48.6813C54.9367 48.534 54.8554 48.4067 54.6655 48.4201C54.5239 48.4383 54.3835 48.4651 54.2452 48.5005C54.5031 48.0174 54.7295 47.5187 54.9231 47.0073C55.2692 46.964 55.5934 46.8167 55.8519 46.5854C57.1347 43.356 57.3778 39.8143 56.5479 36.4435C55.7181 33.0726 53.8558 30.0366 51.2149 27.7495ZM33.345 32.9121C32.5299 32.4314 31.8494 31.7569 31.3655 30.9502C32.8635 30.2528 34.1753 29.2186 35.1957 27.9303C35.1957 27.9303 35.9346 26.7987 35.5008 26.0353C37.1962 25.3992 38.9952 25.0746 40.8089 25.0778C43.3073 25.0822 45.7653 25.7013 47.9609 26.879H47.7508C43.9002 26.9862 36.2533 29.3164 33.345 32.9121ZM53.0046 48.4134C52.8894 48.6076 52.7606 48.7951 52.6386 48.9826C49.9269 49.9535 45.8051 52.036 45.1815 54.0849C45.1297 54.2517 45.109 54.4264 45.1204 54.6005C44.5949 54.7868 44.0584 54.9411 43.5138 55.0626H43.4663C42.1105 55.0626 39.026 52.8194 38.1311 49.5584C37.9832 49.0108 37.9676 48.4365 38.0853 47.8818C38.203 47.327 38.4509 46.8073 38.809 46.3644C39.5732 45.3855 40.5244 44.5643 41.6088 43.9472C44.3205 44.9382 50.3472 46.9805 53.7029 47.0876C53.5016 47.5426 53.273 47.9854 53.0182 48.4134H53.0046Z"
        fill="#F6F6F9"
      />
    </svg>
  );
};

const SecretIcon: FunctionComponent = () => {
  const theme = useTheme();

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="80"
      height="80"
      fill="none"
      viewBox="0 0 80 80"
    >
      <rect
        width="62"
        height="62"
        x="9"
        y="9"
        fill={
          theme.mode === "light"
            ? ColorPalette["gray-300"]
            : ColorPalette["gray-400"]
        }
        rx="15.696"
      />
      <path
        fill="#fff"
        d="M51.367 41.368c-2.315-2.095-5.345-3.494-8.281-4.85l-.022-.007c-5.178-2.395-9.655-4.468-9.337-9.369.138-1.868 1.476-2.996 2.575-3.604 1.237-.688 2.878-1.099 4.397-1.099.18 0 .362.008.535.015 4.419.3 7.905 2.198 11.311 6.139l.203.241.239-.205 1.33-1.172.239-.212-.21-.242c-3.797-4.41-7.92-6.63-12.96-6.974a6.993 6.993 0 00-.701-.029c-.152 0-.319 0-.492.007h-.217c-3.305 0-6.929 1.1-9.684 2.945-3.29 2.205-5.135 5.238-5.186 8.541-.13 8.036 6.357 10.74 12.078 13.135l.015.007.058.022c5.062 2.125 9.43 3.956 9.336 8.864-.043 3.238-4.614 5.025-7.753 5.025h-.44v.007c-4.68-.139-8.86-2.183-12.426-6.058l-.217-.234-.231.212-1.295 1.216-.231.22.217.234c4.05 4.418 9.047 6.791 14.457 6.857h.246c3.493 0 7.29-.952 10.154-2.557 3.587-1.985 5.677-4.878 5.894-8.145.246-3.59-.933-6.513-3.601-8.93zM34.573 34.38c2.062 1.787 4.853 3.07 7.55 4.307l.051.022c2.857 1.333 5.562 2.593 7.522 4.344 2.17 1.934 3.088 4.175 2.893 7.054-.181 2.85-2.271 4.754-4.173 5.904.369-.762.571-1.59.593-2.468.043-2.96-1.078-5.326-3.435-7.245-2.061-1.678-4.795-2.813-7.442-3.919-5.504-2.293-10.704-4.461-10.61-10.864.029-2.46 1.49-4.79 4.115-6.556.087-.058.174-.117.268-.176a6.039 6.039 0 00-.528 2.161c-.21 2.967.839 5.4 3.196 7.436z"
      />
    </svg>
  );
};

const StarknetIcon: FunctionComponent = () => {
  const theme = useTheme();

  return (
    <svg
      width="80"
      height="80"
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="9"
        y="9"
        width="62"
        height="62"
        rx="15.6962"
        fill={
          theme.mode === "light"
            ? ColorPalette["gray-300"]
            : ColorPalette["gray-400"]
        }
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M29.345 33.5692L29.9867 31.3661C30.1172 30.918 30.4355 30.5694 30.8402 30.4319L32.8325 29.7511C33.1083 29.6575 33.1106 29.2251 32.837 29.1266L30.8536 28.4135C30.4511 28.2686 30.1373 27.9149 30.0128 27.4652L29.4009 25.2514C29.3167 24.9458 28.9276 24.9424 28.8389 25.2472L28.1971 27.4503C28.0667 27.8975 27.7484 28.2462 27.3437 28.3845L25.3513 29.0645C25.0756 29.1589 25.0726 29.5904 25.3469 29.689L27.3303 30.402C27.7328 30.547 28.0466 30.9015 28.171 31.3512L28.783 33.5642C28.8672 33.8706 29.2563 33.8739 29.345 33.5692Z"
        fill="#FAFAFA"
      />
      <path
        d="M53.9183 29.9862L53.9182 29.9862C52.8992 30.1576 52.0315 30.746 51.0903 31.5721C50.8533 31.7801 50.6031 32.0127 50.3418 32.2555C49.6436 32.9045 48.8667 33.6266 48.0545 34.1472L48.0438 34.154L48.033 34.1606C47.0766 34.74 46.2507 35.4077 45.3434 36.1412C45.3015 36.1751 45.2594 36.2092 45.2171 36.2433C44.906 36.5077 44.6222 36.7775 44.3149 37.0697C44.2027 37.1765 44.0872 37.2863 43.9662 37.3998L42.7994 38.5541C41.4998 39.9045 40.2041 41.1499 38.9382 42.1913L38.935 42.194C37.6605 43.2336 36.4387 44.0483 35.2078 44.6264C33.944 45.2232 32.5947 45.5684 30.8815 45.6232C29.1831 45.6825 27.2277 45.3785 25.2096 44.9062C25.2093 44.9062 25.2089 44.9061 25.2086 44.906L25.4365 43.9323C24.4095 43.6943 23.3561 43.4042 22.2563 43.1013C21.5852 42.9165 20.897 42.727 20.1869 42.5416L53.9183 29.9862ZM53.9183 29.9862L53.9264 29.9848C55.0891 29.7794 56.1282 29.7921 57.3363 29.9865C57.4952 30.0141 57.7675 30.1148 58.1455 30.3239C58.5104 30.5256 58.9137 30.7944 59.3185 31.0957C59.6332 31.33 59.9377 31.5758 60.2146 31.813M53.9183 29.9862L60.2146 31.813M60.2146 31.813C60.1085 31.8736 60.0042 31.9369 59.9011 32.0027C59.3927 32.3108 58.941 32.6478 58.5338 32.9815L58.5337 32.9814L58.5253 32.9885C57.7041 33.6766 57.0142 34.3879 56.3723 35.1161C56.3726 35.1158 56.3729 35.1154 56.3733 35.115L60.2146 31.813ZM52.9473 39.5876C52.6613 39.9638 52.3895 40.3628 52.1344 40.7375L52.124 40.7527C51.8572 41.1444 51.6075 41.5104 51.3494 41.8488L51.3327 41.8707L51.3172 41.8935L50.5244 43.0611C50.244 43.4588 50.0404 43.7417 49.6527 44.251C48.2525 46.0888 46.6018 47.8431 44.5701 49.3791C42.5484 50.8952 40.0731 52.1862 37.2785 52.7212L37.2785 52.7212L37.2704 52.7228C34.5029 53.2762 31.5329 52.9065 29.1885 51.8894L29.1886 51.8893L29.1764 51.8842C26.7813 50.8823 24.903 49.3549 23.3798 47.651C22.3157 46.4239 21.4242 45.1235 20.721 43.7182C21.1513 43.8342 21.5755 43.9511 21.9956 44.0668L52.9473 39.5876Z"
        stroke="white"
        strokeWidth="2"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M62 32.2989C61.0832 30.0381 59.3786 28.1351 57.0909 26.7308C54.8166 25.3419 51.6583 24.6332 48.5287 25.2373C46.9823 25.5295 45.4843 26.0921 44.1698 26.8412C42.8612 27.5874 41.6886 28.4856 40.6734 29.4492C40.1666 29.9326 39.7066 30.4369 39.2496 30.9441L38.0652 32.4197L36.2357 34.795C33.9035 37.8511 31.392 41.4327 27.2705 42.494C23.2244 43.5358 21.4695 42.6131 19 42.2319C19.4516 43.3711 20.0109 44.4773 20.7691 45.4504C21.5133 46.4433 22.3922 47.3759 23.4849 48.1751C24.0372 48.559 24.6202 48.9379 25.2678 49.2594C25.9123 49.5698 26.6075 49.8431 27.3494 50.0489C28.8253 50.4442 30.4869 50.5826 32.0957 50.37C33.7053 50.1602 35.2437 49.6617 36.5885 48.9998C37.9432 48.3442 39.1233 47.5456 40.177 46.7029C42.2717 45.0031 43.9009 43.1251 45.2772 41.2267C45.9695 40.2775 46.5978 39.3105 47.179 38.3432L47.863 37.1915C48.0721 36.8549 48.2836 36.5162 48.4986 36.2007C49.3651 34.9334 50.2128 33.9172 51.2424 33.1544C52.2577 32.372 53.6717 31.7938 55.561 31.6595C57.4424 31.5236 59.6145 31.7747 62 32.2989Z"
        fill="#FAFAFA"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M51.4695 50.9081C51.4695 52.6039 52.8455 53.9795 54.5418 53.9795C56.2383 53.9795 57.6123 52.6039 57.6123 50.9081C57.6123 49.2123 56.2383 47.8367 54.5418 47.8367C52.8455 47.8367 51.4695 49.2123 51.4695 50.9081Z"
        fill="white"
      />
    </svg>
  );
};
