import { BACKGROUND_PORT } from "@keplr-wallet/router";
import { InExtensionMessageRequester } from "@keplr-wallet/router-extension";
import React, { FunctionComponent, useState } from "react";
import {
  Ledger,
  LedgerApp,
  LedgerGetWebHIDFlagMsg,
  LedgerWebHIDIniter,
  LedgerWebUSBIniter,
} from "@keplr-wallet/background";
import ReactDOM from "react-dom";
import style from "./style.module.scss";
import { Buffer } from "buffer/";
import { CosmosApp } from "@keplr-wallet/ledger-cosmos";
import delay from "delay";

const PrimaryLoading: FunctionComponent = () => {
  return (
    <svg
      className={style.spin}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle cx="12.5" cy="5.5" r="1.5" fill="#2C47CD" />
      <circle cx="12.5" cy="19.5" r="1.5" fill="#8E9FF2" />
      <circle
        cx="19.5"
        cy="12.5"
        r="1.5"
        fill="#E2E8FF"
        transform="rotate(90 19.5 12.5)"
      />
      <circle
        cx="5.5"
        cy="12.5"
        r="1.5"
        fill="#4762E7"
        transform="rotate(90 5.5 12.5)"
      />
      <circle
        cx="17.45"
        cy="7.55"
        r="1.5"
        fill="#F1F3FC"
        transform="rotate(45 17.45 7.55)"
      />
      <circle
        cx="7.55"
        cy="17.45"
        r="1.5"
        fill="#5B74F2"
        transform="rotate(45 7.55 17.45)"
      />
      <circle
        cx="17.45"
        cy="17.45"
        r="1.5"
        fill="#B3BEF7"
        transform="rotate(135 17.45 17.45)"
      />
      <circle
        cx="7.551"
        cy="7.55"
        r="1.5"
        fill="#3550D8"
        transform="rotate(135 7.55 7.55)"
      />
    </svg>
  );
};

const FailedLoading: FunctionComponent = () => {
  return (
    <svg
      className={style.spin}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle cx="12.5" cy="5.5" r="1.5" fill="#5B0A1A" />
      <circle cx="12.5" cy="19.5" r="1.5" fill="#FB486C" />
      <circle
        cx="19.5"
        cy="12.5"
        r="1.5"
        fill="#FFD8E0"
        transform="rotate(90 19.5 12.5)"
      />
      <circle
        cx="5.5"
        cy="12.5"
        r="1.5"
        fill="#A61F3A"
        transform="rotate(90 5.5 12.5)"
      />
      <circle
        cx="17.45"
        cy="7.55"
        r="1.5"
        fill="#FFF7F8"
        transform="rotate(45 17.45 7.55)"
      />
      <circle
        cx="7.55"
        cy="17.45"
        r="1.5"
        fill="#F0224B"
        transform="rotate(45 7.55 17.45)"
      />
      <circle
        cx="17.45"
        cy="17.45"
        r="1.5"
        fill="#FC91A6"
        transform="rotate(135 17.45 17.45)"
      />
      <circle
        cx="7.551"
        cy="7.55"
        r="1.5"
        fill="#771A2D"
        transform="rotate(135 7.55 7.55)"
      />
    </svg>
  );
};

export const LedgerGrantFullScreenPage: FunctionComponent = () => {
  const request: {
    app: LedgerApp;
    cosmosLikeApp: string;
  } = (() => {
    const r = new URLSearchParams(window.location.search).get("request");
    if (!r) {
      return {
        app: LedgerApp.Cosmos,
        cosmosLikeApp: "Cosmos",
      };
    }

    return JSON.parse(Buffer.from(r, "base64").toString());
  })();

  const [isLoading, setIsLoading] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);
  const [succeded, setSucceded] = useState(false);

  const getPermission = async () => {
    setIsLoading(true);

    try {
      const msgRequester = new InExtensionMessageRequester();
      const isWebHID = await msgRequester.sendMessage(
        BACKGROUND_PORT,
        new LedgerGetWebHIDFlagMsg()
      );
      const transportIniter = isWebHID
        ? LedgerWebHIDIniter
        : LedgerWebUSBIniter;
      const transport = await transportIniter();

      try {
        await CosmosApp.openApp(
          transport,
          (() => {
            if (request.app === LedgerApp.Ethereum) {
              return "Ethereum";
            }
            return request.cosmosLikeApp || "Cosmos";
          })()
        );
      } catch (e) {
        console.log(e);
      } finally {
        await transport.close();

        await delay(500);

        let ledger: Ledger | undefined;
        try {
          ledger = await Ledger.init(
            transportIniter,
            undefined,
            request.app,
            request.cosmosLikeApp
          );
        } finally {
          await ledger?.close();
        }

        setSucceded(true);
      }
    } catch (e) {
      console.log(e);

      setHasFailed(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={style.container}>
      <div className={style.inner}>
        <div>
          <img
            style={{
              width: "58px",
              height: "58px",
              marginRight: "12px",
            }}
            src={require("../../public/assets/logo-256.svg")}
            alt="logo"
          />
          <img
            style={{
              height: "58px",
            }}
            src={require("../../public/assets/brand-text.png")}
            alt="logo"
          />
        </div>
        <div>
          <h1 className={style.title}>Allow Browser to Connect to Ledger</h1>
          <p className={style.description}>
            We’ve identified a Chrome related bug where attempting to connect a
            hardware wallet in a popup may cause browser to crash. As a
            temporary measure, you can give Ledger permission in this page.
            Click the button below then try again.
          </p>
          {!succeded ? (
            <button
              className={style.buttonText}
              style={{
                color: hasFailed ? "#F0224B" : "#314FDF",
                opacity: isLoading ? 0.5 : 1,
                cursor: isLoading ? "progress" : "pointer",
              }}
              onClick={(e) => {
                e.preventDefault();

                if (isLoading) {
                  return;
                }

                getPermission();
              }}
            >
              {hasFailed ? "Failed - Try Again" : "Connect browser to Ledger"}
              <div
                style={{
                  marginLeft: "4px",
                  display: "flex",
                  alignItems: "center",
                  height: "1px",
                }}
              >
                {isLoading ? (
                  hasFailed ? (
                    <FailedLoading />
                  ) : (
                    <PrimaryLoading />
                  )
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="25"
                    fill="none"
                    viewBox="0 0 24 25"
                  >
                    <path
                      stroke={hasFailed ? "#F0224B" : "#314FDF"}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12.563 5.75l6.75 6.75-6.75 6.75m5.812-6.75H4.687"
                    />
                  </svg>
                )}
              </div>
            </button>
          ) : (
            <div
              className={style.buttonText}
              style={{
                color: "#22AC71",
                cursor: "auto",
              }}
            >
              Success! You can close this web page.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

ReactDOM.render(<LedgerGrantFullScreenPage />, document.getElementById("app"));
