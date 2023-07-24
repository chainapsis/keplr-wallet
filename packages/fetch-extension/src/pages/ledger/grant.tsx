import React, {
  ChangeEvent,
  FunctionComponent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";

import { Button } from "reactstrap";

import {
  Ledger,
  LedgerApp,
  LedgerInitErrorOn,
  LedgerWebHIDIniter,
  LedgerWebUSBIniter,
} from "@keplr-wallet/background";

import style from "./style.module.scss";
import { EmptyLayout } from "@layouts/empty-layout";

import classnames from "classnames";
import { FormattedMessage, useIntl } from "react-intl";
import { useNotification } from "@components/notification";
import delay from "delay";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { CosmosApp } from "@keplr-wallet/ledger-cosmos";
import { ledgerUSBVendorId } from "@ledgerhq/devices";
import { Buffer } from "buffer/";

export const LedgerGrantPage: FunctionComponent = observer(() => {
  useLayoutEffect(() => {
    // XXX: Temporal solution for fitting the popup window.
    //      Even though this is noy proper way to adjust style,
    //      it is safe because this page only can be open on popup.
    document.documentElement.style.height = "100%";
    document.body.style.height = "100%";
    const app = document.getElementById("app");
    if (app) {
      app.style.height = "100%";
    }
  }, []);

  const { ledgerInitStore } = useStore();

  const intl = useIntl();

  const notification = useNotification();

  const [showWebHIDWarning, setShowWebHIDWarning] = useState(false);
  // TODO: Show link to full-screen grant permission page to ensure usb permission.
  const [showPermissionLink, setShowPermissionLink] = useState(false);

  const testUSBDevices = useCallback(async (isWebHID: boolean) => {
    const anyNavigator = navigator as any;
    let protocol: any;
    if (isWebHID) {
      protocol = anyNavigator.hid;
    } else {
      protocol = anyNavigator.usb;
    }

    const devices = await protocol.getDevices();

    const exist = devices.find((d: any) => d.vendorId === ledgerUSBVendorId);
    return !!exist;
  }, []);

  const toggleWebHIDFlag = async (e: ChangeEvent) => {
    e.preventDefault();

    if (!ledgerInitStore.isWebHID && !(await Ledger.isWebHIDSupported())) {
      setShowWebHIDWarning(true);
      return;
    }
    setShowWebHIDWarning(false);

    await ledgerInitStore.setWebHID(!ledgerInitStore.isWebHID);
  };

  useEffect(() => {
    if (ledgerInitStore.isSignCompleted) {
      setTimeout(window.close, 3000);
    }

    if (ledgerInitStore.isGetPubKeySucceeded) {
      // Don't need to delay to close because this event probably occurs only in the register page in tab.
      // So, don't need to consider the window refocusing.
      window.close();
    }

    if (ledgerInitStore.isInitAborted) {
      // If ledger init is aborted due to the timeout on the background, just close the window.
      window.close();
    }
  }, [
    ledgerInitStore.isGetPubKeySucceeded,
    ledgerInitStore.isSignCompleted,
    ledgerInitStore.isInitAborted,
  ]);

  const [initTryCount, setInitTryCount] = useState(0);
  const [initErrorOn, setInitErrorOn] = useState<LedgerInitErrorOn | undefined>(
    undefined
  );
  const [tryInitializing, setTryInitializing] = useState(false);
  const [initSucceed, setInitSucceed] = useState(false);

  const tryInit = async () => {
    setTryInitializing(true);

    let deviceSelected = false;

    let initErrorOn: LedgerInitErrorOn | undefined;

    try {
      if (!(await testUSBDevices(ledgerInitStore.isWebHID))) {
        throw new Error("There is no device selected");
      }

      const transportIniter = ledgerInitStore.isWebHID
        ? LedgerWebHIDIniter
        : LedgerWebUSBIniter;
      const transport = await transportIniter();
      try {
        if (ledgerInitStore.requestedLedgerApp === LedgerApp.Cosmos) {
          await CosmosApp.openApp(
            transport,
            ledgerInitStore.cosmosLikeApp || "Cosmos"
          );
        } else if (ledgerInitStore.requestedLedgerApp === LedgerApp.Ethereum) {
          await CosmosApp.openApp(transport, "Ethereum");
        }
      } catch (e) {
        // Ignore error
        console.log(e);
      } finally {
        await transport.close();

        await delay(500);
      }

      // I don't know the reason exactly.
      // However, we sometimes should wait for some until actually app opened.
      // It is hard to set exact delay. So, just wait for 500ms 5 times.
      let tempSuccess = false;
      for (let i = 0; i < 5; i++) {
        // Test again to ensure usb permission after interaction.
        if (await testUSBDevices(ledgerInitStore.isWebHID)) {
          tempSuccess = true;
          break;
        }

        await delay(500);
      }
      if (!tempSuccess) {
        throw new Error("There is no device selected");
      }

      deviceSelected = true;

      const ledger = await Ledger.init(
        ledgerInitStore.isWebHID ? LedgerWebHIDIniter : LedgerWebUSBIniter,
        undefined,
        // requestedLedgerApp should be set if ledger init needed.
        ledgerInitStore.requestedLedgerApp!,
        ledgerInitStore.cosmosLikeApp || "Cosmos"
      );
      await ledger.close();
      // Unfortunately, closing ledger blocks the writing to Ledger on background process.
      // I'm not sure why this happens. But, not closing reduce this problem if transport is webhid.
      if (!ledgerInitStore.isWebHID) {
        delay(1000);
      } else {
        delay(500);
      }
    } catch (e) {
      console.log(e);

      if (e.errorOn != null) {
        initErrorOn = e.errorOn;
      } else {
        initErrorOn = LedgerInitErrorOn.Unknown;
      }
    }

    setInitTryCount(initTryCount + 1);
    setInitErrorOn(initErrorOn);
    setTryInitializing(false);
    setShowPermissionLink(!deviceSelected);

    if (initErrorOn === undefined) {
      setInitSucceed(true);

      await ledgerInitStore.resume();
    }
  };

  return (
    <EmptyLayout className={style["container"]}>
      {ledgerInitStore.isSignCompleted ? (
        <SignCompleteDialog rejected={ledgerInitStore.isSignRejected} />
      ) : initSucceed ? (
        <ConfirmLedgerDialog />
      ) : (
        <div className={style["instructions"]}>
          <Instruction
            icon={
              <img
                src={require("@assets/img/icons8-usb-2.svg")}
                style={{ height: "50px" }}
                alt="usb"
              />
            }
            title={intl.formatMessage({ id: "ledger.step1" })}
            paragraph={intl.formatMessage({ id: "ledger.step1.paragraph" })}
            pass={initTryCount > 0 && initErrorOn === LedgerInitErrorOn.App}
          />
          <Instruction
            icon={
              <img
                src={(() => {
                  switch (ledgerInitStore.requestedLedgerApp) {
                    case "ethereum":
                      return require("../../public/assets/img/ethereum.svg");
                    case "cosmos":
                      if (ledgerInitStore.cosmosLikeApp === "Terra") {
                        return require("../../public/assets/img/ledger-terra.svg");
                      }
                      return require("../../public/assets/img/atom-o.svg");
                    default:
                      return require("@assets/img/atom-o.svg");
                  }
                })()}
                style={{ height: "34px" }}
                alt="atom"
              />
            }
            title={intl.formatMessage({ id: "ledger.step2" })}
            paragraph={intl.formatMessage(
              {
                id: "ledger.step2.paragraph",
              },
              {
                ledgerApp: (() => {
                  switch (ledgerInitStore.requestedLedgerApp) {
                    case "ethereum":
                      return "Ethereum";
                    case "cosmos":
                      return ledgerInitStore.cosmosLikeApp || "Cosmos";
                    default:
                      return "Cosmos";
                  }
                })(),
              }
            )}
            pass={initTryCount > 0 && initErrorOn == null}
          />
          <div style={{ flex: 1 }} />
          {showPermissionLink ? (
            <div
              style={{
                fontSize: "13px",
                lineHeight: "120%",
                letterSpacing: "0.15px",
                color: "#172B4D",
                marginBottom: "0.5rem",
              }}
            >
              If your Ledger is connected, but your browser {`doesn't`} detect
              your wallet,{" "}
              <a
                style={{
                  color: "#314FDF",
                  textDecoration: "underline",
                  cursor: "pointer",
                }}
                onClick={(e) => {
                  e.preventDefault();

                  browser.tabs
                    .create({
                      url: `/ledger-grant.html?request=${Buffer.from(
                        JSON.stringify({
                          app: ledgerInitStore.requestedLedgerApp,
                          cosmosLikeApp: ledgerInitStore.cosmosLikeApp,
                        })
                      ).toString("base64")}`,
                    })
                    .then(() => {
                      window.close();
                    });
                }}
              >
                click here
              </a>{" "}
              to grant permission from your browser.
            </div>
          ) : null}
          <div className="custom-control custom-checkbox mb-2">
            <input
              className="custom-control-input"
              id="use-webhid"
              type="checkbox"
              checked={ledgerInitStore.isWebHID}
              onChange={toggleWebHIDFlag}
            />
            <label
              className="custom-control-label"
              htmlFor="use-webhid"
              style={{ color: "#666666", paddingTop: "1px" }}
            >
              <FormattedMessage id="ledger.option.webhid.checkbox" />
            </label>
          </div>
          {showWebHIDWarning ? (
            <div
              style={{
                fontSize: "14px",
                marginBottom: "20px",
                color: "#777777",
              }}
            >
              <FormattedMessage
                id="ledger.option.webhid.warning"
                values={{
                  link: (
                    <a
                      href="chrome://flags/#enable-experimental-web-platform-features"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        navigator.clipboard
                          .writeText(
                            "chrome://flags/#enable-experimental-web-platform-features"
                          )
                          .then(() => {
                            notification.push({
                              placement: "top-center",
                              type: "success",
                              duration: 2,
                              content: intl.formatMessage({
                                id: "ledger.option.webhid.link.copied",
                              }),
                              canDelete: true,
                              transition: {
                                duration: 0.25,
                              },
                            });
                          });
                      }}
                    >
                      chrome://flags/#enable-experimental-web-platform-features
                    </a>
                  ),
                }}
              />
            </div>
          ) : null}
          <div className={style["buttons"]}>
            <Button
              color="primary"
              className={style["button"]}
              onClick={async (e) => {
                e.preventDefault();
                await tryInit();
              }}
              data-loading={tryInitializing}
            >
              <FormattedMessage id="ledger.button.next" />
            </Button>
            <Button
              color="danger"
              className={style["button"]}
              onClick={async (e) => {
                e.preventDefault();
                ledgerInitStore.abortAll();
              }}
              data-loading={ledgerInitStore.isLoading}
              outline
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </EmptyLayout>
  );
});

const ConfirmLedgerDialog: FunctionComponent = () => {
  return (
    <div className={style["confirmLedgerDialog"]}>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
        }}
      >
        <img src={require("@assets/img/icons8-pen.svg")} alt="pen" />
      </div>
      <p>
        <FormattedMessage id="ledger.confirm.waiting.paragraph" />
      </p>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
        }}
      >
        <i className="fa fa-spinner fa-spin fa-2x fa-fw" />
      </div>
    </div>
  );
};

const SignCompleteDialog: FunctionComponent<{
  rejected: boolean;
}> = ({ rejected }) => {
  const intl = useIntl();

  return (
    <div className={style["signCompleteDialog"]}>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
        }}
      >
        {!rejected ? (
          <img src={require("@assets/img/icons8-checked.svg")} alt="success" />
        ) : (
          <img src={require("@assets/img/icons8-cancel.svg")} alt="rejected" />
        )}
      </div>
      <p>
        {!rejected
          ? intl.formatMessage({ id: "ledger.confirm.success" })
          : intl.formatMessage({ id: "ledger.confirm.rejected" })}
      </p>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
        }}
      >
        <div className={style["subParagraph"]}>
          {!rejected
            ? intl.formatMessage({ id: "ledger.confirm.success.paragraph" })
            : intl.formatMessage({ id: "ledger.confirm.rejected.paragraph" })}
        </div>
      </div>
    </div>
  );
};

const Instruction: FunctionComponent<{
  icon: React.ReactElement;
  title: string;
  paragraph: string;
  pass: boolean;
}> = ({ icon, title, paragraph, children, pass }) => {
  return (
    <div
      className={classnames(style["instruction"], { [style["pass"]]: pass })}
    >
      <div className={style["icon"]}>{icon}</div>
      <div className={style["inner"]}>
        <h1>
          {title}
          {pass ? (
            <i
              className="fas fa-check"
              style={{ marginLeft: "10px", color: "#2dce89" }}
            />
          ) : null}
        </h1>
        <p>{paragraph}</p>
        {children}
      </div>
    </div>
  );
};
