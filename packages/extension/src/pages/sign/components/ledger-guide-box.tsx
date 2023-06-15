import React, { FunctionComponent, useLayoutEffect, useState } from "react";
import { VerticalCollapseTransition } from "../../../components/transition/vertical-collapse";
import { Gutter } from "../../../components/gutter";
import { GuideBox } from "../../../components/guide-box";
import { KeplrError } from "@keplr-wallet/router";
import {
  ErrCodeDeviceLocked,
  ErrFailedGetPublicKey,
  ErrFailedInit,
  ErrModuleLedgerSign,
  ErrPublicKeyUnmatched,
  ErrSignRejected,
} from "../utils/ledger-types";
import { PlainObject } from "@keplr-wallet/background";

export const LedgerGuideBox: FunctionComponent<{
  data: {
    keyInsensitive: PlainObject;
    isEthereum: boolean;
  };
  isLedgerInteracting: boolean;
  ledgerInteractingError: Error | undefined;
}> = ({ isLedgerInteracting, ledgerInteractingError, data }) => {
  const [transportErrorCount, setTransportErrorCount] = useState(0);

  useLayoutEffect(() => {
    if (ledgerInteractingError) {
      if (
        ledgerInteractingError instanceof KeplrError &&
        ledgerInteractingError.module === ErrModuleLedgerSign
      ) {
        switch (ledgerInteractingError.code) {
          case ErrFailedInit:
            setTransportErrorCount((c) => c + 1);
            break;
          default:
            setTransportErrorCount(0);
        }
      }
    }
  }, [ledgerInteractingError]);

  return (
    <VerticalCollapseTransition
      collapsed={!isLedgerInteracting && ledgerInteractingError == null}
      transitionAlign="bottom"
    >
      <Gutter size="0.75rem" />
      {(() => {
        if (ledgerInteractingError) {
          if (
            ledgerInteractingError instanceof KeplrError &&
            ledgerInteractingError.module === ErrModuleLedgerSign
          ) {
            switch (ledgerInteractingError.code) {
              case ErrFailedInit:
                if (transportErrorCount < 3) {
                  return (
                    <GuideBox
                      color="warning"
                      title="Error"
                      paragraph="Connect and unlock your Ledger device."
                    />
                  );
                }

                return (
                  <GuideBox
                    color="warning"
                    title="Error"
                    paragraph={
                      <React.Fragment>
                        Keplr may have lost its USB permission by an unknown
                        reason. Visit{" "}
                        <a
                          style={{
                            cursor: "pointer",
                            fontWeight: "bold",
                          }}
                          onClick={async (e) => {
                            e.preventDefault();

                            await browser.tabs.create({
                              url: "/ledger-grant.html",
                            });

                            window.close();
                            return;
                          }}
                        >
                          this page
                        </a>{" "}
                        to regain the permission.
                      </React.Fragment>
                    }
                  />
                );
              case ErrCodeDeviceLocked:
                return (
                  <GuideBox
                    color="warning"
                    title="Error"
                    paragraph="Unlock your Ledger device."
                  />
                );
              case ErrFailedGetPublicKey: {
                let app = "Cosmos";

                const appData = data.keyInsensitive;
                if (!appData) {
                  throw new Error("Invalid ledger app data");
                }
                if (typeof appData !== "object") {
                  throw new Error("Invalid ledger app data");
                }
                if (appData["Terra"]) {
                  app = "Terra";
                }

                if (data.isEthereum) {
                  if (appData["Ethereum"]) {
                    app = "Ethereum";
                  } else {
                    return (
                      <GuideBox
                        color="warning"
                        title="Error"
                        paragraph="Please initialize ethereum app first"
                      />
                    );
                  }
                }

                return (
                  <GuideBox
                    color="warning"
                    title="Error"
                    paragraph={`Open the ${app} app on Ledger and try again.`}
                  />
                );
              }

              case ErrPublicKeyUnmatched:
                return (
                  <GuideBox
                    color="warning"
                    title="Error"
                    paragraph="Please try again with the same ledger device/account that you've connected with this wallet."
                  />
                );
              case ErrSignRejected:
                return (
                  <GuideBox
                    color="warning"
                    title="Error"
                    paragraph="You've rejected signing the transaction on Ledger."
                  />
                );
            }
          }

          return (
            <GuideBox
              color="warning"
              title="Unknown error"
              paragraph={
                ledgerInteractingError.message ||
                ledgerInteractingError.toString()
              }
            />
          );
        }

        return (
          <GuideBox
            color="default"
            title="Sign on Ledger"
            paragraph="To proceed, please review and approve the transaction on your Ledger device."
          />
        );
      })()}
    </VerticalCollapseTransition>
  );
};
