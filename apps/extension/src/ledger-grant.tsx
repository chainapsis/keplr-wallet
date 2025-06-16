// Shim ------------
require("setimmediate");
// Shim ------------

import React, { FunctionComponent, useState } from "react";
import ReactDOM from "react-dom";
import { HashRouter, Route, Routes } from "react-router-dom";
import { StoreProvider, useStore } from "./stores";
import { ColorPalette, GlobalStyle, ScrollBarStyle } from "./styles";
import { Keplr } from "@keplr-wallet/provider";
import manifest from "./manifest.v2.json";
import { InExtensionMessageRequester } from "@keplr-wallet/router-extension";
import { configure } from "mobx";
import { ModalRootProvider } from "./components/modal";
import { ConfirmProvider, useConfirm } from "./hooks/confirm";
import { AppIntlProvider } from "./languages";
import { observer } from "mobx-react-lite";
import { useLoadFonts } from "./use-load-fonts";
import { useAutoLockMonitoring } from "./use-auto-lock-monitoring";
import { Gutter } from "./components/gutter";
import { RegisterH2 } from "./pages/register/components/typography";
import { Body1, H3, Subtitle2 } from "./components/typography";
import { Box } from "./components/box";
import { Button } from "./components/button";
import { Columns } from "./components/column";
import { XAxis } from "./components/axis";
import { Checkbox } from "./components/checkbox";
import TransportWebHID from "@ledgerhq/hw-transport-webhid";
import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
import { LedgerUtils } from "./utils";
import { CosmosApp } from "@keplr-wallet/ledger-cosmos";
import { AppThemeProvider } from "./theme";
import Transport from "@ledgerhq/hw-transport";
import Eth from "@ledgerhq/hw-app-eth";
import "simplebar-react/dist/simplebar.min.css";
import { FormattedMessage, useIntl } from "react-intl";
import { useTheme } from "styled-components";
import { RoutePageAnalytics } from "./route-page-analytics";
import { LedgerError, StarknetClient } from "@ledgerhq/hw-app-starknet";
import { STARKNET_LEDGER_DERIVATION_PATH } from "./pages/sign/utils/handle-starknet-sign";
import AppClient from "ledger-bitcoin";

configure({
  enforceActions: "always", // Make mobx to strict mode.
});

window.keplr = new Keplr(
  manifest.version,
  "core",
  new InExtensionMessageRequester()
);

const AutoLockMonitor: FunctionComponent = observer(() => {
  useAutoLockMonitoring();

  return null;
});

const LedgerGrantPage: FunctionComponent = observer(() => {
  const { uiConfigStore } = useStore();
  const theme = useTheme();

  const confirm = useConfirm();
  const intl = useIntl();

  const [appIsLoading, setAppIsLoading] = useState("");

  const [status, setStatus] = useState<"select" | "failed" | "success">(
    "select"
  );

  return (
    <Box width="100vw" height="100vh" alignX="center" alignY="center">
      <Box maxWidth="47.75rem">
        <img
          src={require(theme.mode === "light"
            ? "./public/assets/img/intro-logo-light.png"
            : "./public/assets/img/intro-logo.png")}
          alt="Keplr logo"
          style={{
            width: "10.625rem",
            aspectRatio: "453 / 153",
          }}
        />
        <Gutter size="2.25rem" />
        <RegisterH2
          color={
            theme.mode === "light"
              ? ColorPalette["gray-700"]
              : ColorPalette["gray-50"]
          }
        >
          <FormattedMessage id="page.ledger-grant.title" />
        </RegisterH2>
        <Gutter size="1rem" />
        <H3
          color={
            theme.mode === "light"
              ? ColorPalette["gray-200"]
              : ColorPalette["gray-300"]
          }
        >
          <FormattedMessage id="page.ledger-grant.paragraph" />
        </H3>

        <Gutter size="1.625rem" />
        {(() => {
          switch (status) {
            case "failed":
              return (
                <Box
                  cursor="pointer"
                  onClick={(e) => {
                    e.preventDefault();

                    setStatus("select");
                  }}
                >
                  <XAxis alignY="center">
                    <Body1 color={ColorPalette["red-400"]}>
                      Failed! Try Again
                    </Body1>
                    <Gutter size="0.25rem" />
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="1.5rem"
                      height="1.5rem"
                      fill="none"
                      viewBox="0 0 24 25"
                    >
                      <path
                        stroke={ColorPalette["red-400"]}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12.563 5.75l6.75 6.75-6.75 6.75m5.812-6.75H4.687"
                      />
                    </svg>
                  </XAxis>
                </Box>
              );
            case "success":
              return (
                <Body1 color={ColorPalette["green-400"]}>
                  Success! You can close this web page.
                </Body1>
              );
            case "select":
              return (
                <React.Fragment>
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

                  <Gutter size="1.625rem" />
                  <Columns sum={1} gutter="1rem">
                    <Button
                      color="secondary"
                      text="Cosmos app"
                      isLoading={appIsLoading === "Cosmos"}
                      disabled={!!appIsLoading && appIsLoading !== "Cosmos"}
                      onClick={async () => {
                        if (appIsLoading) {
                          return;
                        }
                        setAppIsLoading("Cosmos");

                        let transport: Transport | undefined = undefined;
                        try {
                          transport = uiConfigStore.useWebHIDLedger
                            ? await TransportWebHID.create()
                            : await TransportWebUSB.create();

                          let app = new CosmosApp("Cosmos", transport);

                          if ((await app.getAppInfo()).app_name === "Cosmos") {
                            setStatus("success");
                            return;
                          }

                          transport = await LedgerUtils.tryAppOpen(
                            transport,
                            "Cosmos"
                          );
                          app = new CosmosApp("Cosmos", transport);

                          if ((await app.getAppInfo()).app_name === "Cosmos") {
                            setStatus("success");
                            return;
                          }

                          setStatus("failed");
                        } catch (e) {
                          console.log(e);

                          setStatus("failed");
                        } finally {
                          transport?.close().catch(console.log);

                          setAppIsLoading("");
                        }
                      }}
                    />
                    <Button
                      color="secondary"
                      text="Terra app"
                      isLoading={appIsLoading === "Terra"}
                      disabled={!!appIsLoading && appIsLoading !== "Terra"}
                      onClick={async () => {
                        if (appIsLoading) {
                          return;
                        }
                        setAppIsLoading("Terra");

                        let transport: Transport | undefined = undefined;
                        try {
                          transport = uiConfigStore.useWebHIDLedger
                            ? await TransportWebHID.create()
                            : await TransportWebUSB.create();

                          let app = new CosmosApp("Terra", transport);

                          if ((await app.getAppInfo()).app_name === "Terra") {
                            setStatus("success");
                            return;
                          }

                          transport = await LedgerUtils.tryAppOpen(
                            transport,
                            "Terra"
                          );
                          app = new CosmosApp("Terra", transport);

                          if ((await app.getAppInfo()).app_name === "Terra") {
                            setStatus("success");
                            return;
                          }

                          setStatus("failed");
                        } catch (e) {
                          console.log(e);

                          setStatus("failed");
                        } finally {
                          transport?.close().catch(console.log);

                          setAppIsLoading("");
                        }
                      }}
                    />
                    <Button
                      color="secondary"
                      text="Secret app"
                      isLoading={appIsLoading === "Secret"}
                      disabled={!!appIsLoading && appIsLoading !== "Secret"}
                      onClick={async () => {
                        if (appIsLoading) {
                          return;
                        }
                        setAppIsLoading("Secret");

                        let transport: Transport | undefined = undefined;
                        try {
                          transport = uiConfigStore.useWebHIDLedger
                            ? await TransportWebHID.create()
                            : await TransportWebUSB.create();

                          let app = new CosmosApp("Secret", transport);

                          if ((await app.getAppInfo()).app_name === "Secret") {
                            setStatus("success");
                            return;
                          }

                          transport = await LedgerUtils.tryAppOpen(
                            transport,
                            "Secret"
                          );
                          app = new CosmosApp("Secret", transport);

                          if ((await app.getAppInfo()).app_name === "Secret ") {
                            setStatus("success");
                            return;
                          }

                          setStatus("failed");
                        } catch (e) {
                          console.log(e);

                          setStatus("failed");
                        } finally {
                          transport?.close().catch(console.log);

                          setAppIsLoading("");
                        }
                      }}
                    />
                    <Button
                      color="secondary"
                      text="Ethereum app"
                      isLoading={appIsLoading === "Ethereum"}
                      disabled={!!appIsLoading && appIsLoading !== "Ethereum"}
                      onClick={async () => {
                        if (appIsLoading) {
                          return;
                        }
                        setAppIsLoading("Ethereum");

                        let transport: Transport | undefined = undefined;
                        try {
                          transport = uiConfigStore.useWebHIDLedger
                            ? await TransportWebHID.create()
                            : await TransportWebUSB.create();

                          let app = new Eth(transport);

                          try {
                            // Ensure that the keplr can connect to ethereum app on ledger.
                            // getAppConfiguration() works even if the ledger is on screen saver mode.
                            // To detect the screen saver mode, we should request the address before using.
                            await app.getAddress("m/44'/60'/0'/0/0");
                            setStatus("success");
                            return;
                          } catch (e) {
                            console.log(e);
                            // noop
                          }

                          transport = await LedgerUtils.tryAppOpen(
                            transport,
                            "Ethereum"
                          );
                          app = new Eth(transport);

                          // Ensure that the keplr can connect to ethereum app on ledger.
                          // getAppConfiguration() works even if the ledger is on screen saver mode.
                          // To detect the screen saver mode, we should request the address before using.
                          await app.getAddress("m/44'/60'/0'/0/0");
                          setStatus("success");
                          return;
                        } catch (e) {
                          console.log(e);

                          setStatus("failed");
                        } finally {
                          transport?.close().catch(console.log);

                          setAppIsLoading("");
                        }
                      }}
                    />
                    <Button
                      color="secondary"
                      text="Starknet app"
                      isLoading={appIsLoading === "Starknet"}
                      disabled={!!appIsLoading && appIsLoading !== "Starknet"}
                      onClick={async () => {
                        if (appIsLoading) {
                          return;
                        }
                        setAppIsLoading("Starknet");

                        try {
                          const transport = await TransportWebHID.create();

                          try {
                            const starknetApp = new StarknetClient(
                              transport as any
                            );

                            const res = await starknetApp.getPubKey(
                              STARKNET_LEDGER_DERIVATION_PATH,
                              false
                            );
                            switch (res.returnCode) {
                              case LedgerError.NoError:
                                setStatus("success");

                                return;
                              default:
                                setStatus("failed");

                                return;
                            }
                          } catch (e) {
                            console.log(e);
                            // noop
                          } finally {
                            setAppIsLoading("");

                            await transport.close();
                          }
                        } catch (e) {
                          console.log(e);

                          setStatus("failed");
                        } finally {
                          setAppIsLoading("");
                        }
                      }}
                    />
                    <Button
                      color="secondary"
                      text="Bitcoin app"
                      isLoading={appIsLoading === "Bitcoin"}
                      disabled={!!appIsLoading && appIsLoading !== "Bitcoin"}
                      onClick={async () => {
                        if (appIsLoading) {
                          return;
                        }
                        setAppIsLoading("Bitcoin");

                        let transport: Transport | undefined = undefined;
                        try {
                          transport = uiConfigStore.useWebHIDLedger
                            ? await TransportWebHID.create()
                            : await TransportWebUSB.create();

                          let app = new AppClient(transport as any);

                          try {
                            await app.getExtendedPubkey(`m/44'/0'/0'/0/0`);

                            setStatus("success");
                            return;
                          } catch (e) {
                            console.log(e);
                            // noop
                          }

                          transport = await LedgerUtils.tryAppOpen(
                            transport,
                            "Bitcoin"
                          );
                          app = new AppClient(transport as any);

                          await app.getExtendedPubkey(`m/44'/0'/0'/0/0`);
                          setStatus("success");
                          return;
                        } catch (e) {
                          console.log(e);

                          setStatus("failed");
                        } finally {
                          transport?.close().catch(console.log);

                          setAppIsLoading("");
                        }
                      }}
                    />
                    <Button
                      color="secondary"
                      text="Bitcoin Test app"
                      isLoading={appIsLoading === "Bitcoin Test"}
                      disabled={
                        !!appIsLoading && appIsLoading !== "Bitcoin Test"
                      }
                      onClick={async () => {
                        if (appIsLoading) {
                          return;
                        }
                        setAppIsLoading("Bitcoin Test");

                        let transport: Transport | undefined = undefined;
                        try {
                          transport = uiConfigStore.useWebHIDLedger
                            ? await TransportWebHID.create()
                            : await TransportWebUSB.create();

                          let app = new AppClient(transport as any);

                          try {
                            await app.getExtendedPubkey(`m/44'/1'/0'/0/0`);

                            setStatus("success");
                            return;
                          } catch (e) {
                            console.log(e);
                            // noop
                          }

                          transport = await LedgerUtils.tryAppOpen(
                            transport,
                            "Bitcoin Test"
                          );
                          app = new AppClient(transport as any);

                          await app.getExtendedPubkey(`m/44'/1'/0'/0/0`);
                          setStatus("success");
                          return;
                        } catch (e) {
                          console.log(e);

                          setStatus("failed");
                        } finally {
                          transport?.close().catch(console.log);

                          setAppIsLoading("");
                        }
                      }}
                    />
                  </Columns>
                </React.Fragment>
              );
          }
        })()}
      </Box>
    </Box>
  );
});

const AppRouter: FunctionComponent = () => {
  useLoadFonts();

  return (
    <HashRouter>
      <RoutePageAnalytics prefix="/ledger-grant" />
      <Routes>
        <Route path="/" element={<LedgerGrantPage />} />
      </Routes>
    </HashRouter>
  );
};

const App: FunctionComponent = () => {
  return (
    <StoreProvider>
      <AppThemeProvider>
        <AppIntlProvider>
          <ModalRootProvider>
            <ConfirmProvider>
              <GlobalStyle />
              <ScrollBarStyle />
              <AutoLockMonitor />

              <AppRouter />
            </ConfirmProvider>
          </ModalRootProvider>
        </AppIntlProvider>
      </AppThemeProvider>
    </StoreProvider>
  );
};

ReactDOM.render(<App />, document.getElementById("app"));
