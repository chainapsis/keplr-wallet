import React, { FunctionComponent, useLayoutEffect, useState } from "react";
import { VerticalCollapseTransition } from "../../../components/transition/vertical-collapse";
import { Gutter } from "../../../components/gutter";
import { GuideBox } from "../../../components/guide-box";
import { KeplrError } from "@keplr-wallet/router";
import {
  ErrCodeDeviceLocked,
  ErrFailedGetPublicKey,
  ErrFailedInit,
  ErrFailedSign,
  ErrModuleLedgerSign,
  ErrPublicKeyUnmatched,
  ErrSignRejected,
} from "../utils/ledger-types";
import { PlainObject } from "@keplr-wallet/background";
import { FormattedMessage, useIntl } from "react-intl";

export const LedgerGuideBox: FunctionComponent<{
  data?: {
    keyInsensitive: PlainObject;
    isEthereum: boolean;
  };
  isLedgerInteracting: boolean;
  ledgerInteractingError: Error | undefined;
  isInternal: boolean;
  backgroundColor?: string;
}> = ({
  isLedgerInteracting,
  ledgerInteractingError,
  data,
  isInternal,
  backgroundColor,
}) => {
  const [transportErrorCount, setTransportErrorCount] = useState(0);
  const intl = useIntl();

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
            if (ledgerInteractingError.code === ErrFailedSign) {
              if (
                ledgerInteractingError.message.endsWith(
                  "JSON. Too many tokens"
                ) ||
                ledgerInteractingError.message.endsWith(
                  "Output buffer too small"
                )
              ) {
                if (isInternal) {
                  return (
                    <GuideBox
                      color="warning"
                      title={intl.formatMessage({
                        id: "page.sign.components.ledger-guide.box.error-title",
                      })}
                      paragraph="Tx size too large for Ledger device (This is a Ledger limitation Keplr can't fix)"
                    />
                  );
                }
                return (
                  <GuideBox
                    color="warning"
                    title={intl.formatMessage({
                      id: "page.sign.components.ledger-guide.box.error-title",
                    })}
                    paragraph="Tx size too large for Ledger device (Request the webpage admin to reduce the tx size)"
                  />
                );
              }
            }

            switch (ledgerInteractingError.code) {
              case ErrFailedInit:
                if (transportErrorCount < 3) {
                  return (
                    <GuideBox
                      color="warning"
                      title={intl.formatMessage({
                        id: "page.sign.components.ledger-guide.box.error-title",
                      })}
                      paragraph={intl.formatMessage({
                        id: "page.sign.components.ledger-guide.box.connect-and-unlock-ledger-paragraph",
                      })}
                    />
                  );
                }

                return (
                  <GuideBox
                    color="warning"
                    title={intl.formatMessage({
                      id: "page.sign.components.ledger-guide.box.error-title",
                    })}
                    paragraph={
                      <React.Fragment>
                        <FormattedMessage id="page.sign.components.ledger-guide.box.usb-permission-unknown-paragraph-1" />
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
                          <FormattedMessage id="page.sign.components.ledger-guide.box.usb-permission-unknown-paragraph-2" />
                        </a>{" "}
                        <FormattedMessage id="page.sign.components.ledger-guide.box.usb-permission-unknown-paragraph-3" />
                      </React.Fragment>
                    }
                  />
                );
              case ErrCodeDeviceLocked:
                return (
                  <GuideBox
                    color="warning"
                    title={intl.formatMessage({
                      id: "page.sign.components.ledger-guide.box.error-title",
                    })}
                    paragraph={intl.formatMessage({
                      id: "page.sign.components.ledger-guide.box.unlock-ledger-paragraph",
                    })}
                  />
                );
              case ErrFailedGetPublicKey: {
                let app = "Cosmos";

                const appData = data?.keyInsensitive;
                if (!appData) {
                  throw new Error("Invalid ledger app data");
                }
                if (typeof appData !== "object") {
                  throw new Error("Invalid ledger app data");
                }
                if (appData["Terra"]) {
                  app = "Terra";
                }
                if (appData["Secret"]) {
                  app = "Secret";
                }

                if (data?.isEthereum) {
                  if (appData["Ethereum"]) {
                    app = "Ethereum";
                  } else {
                    return (
                      <GuideBox
                        color="warning"
                        title={intl.formatMessage({
                          id: "page.sign.components.ledger-guide.box.error-title",
                        })}
                        paragraph={intl.formatMessage(
                          {
                            id: "page.sign.components.ledger-guide.box.initialize-app-first-paragraph",
                          },
                          { app }
                        )}
                      />
                    );
                  }
                }

                return (
                  <GuideBox
                    color="warning"
                    title={intl.formatMessage({
                      id: "page.sign.components.ledger-guide.box.error-title",
                    })}
                    paragraph={intl.formatMessage(
                      {
                        id: "page.sign.components.ledger-guide.box.open-app-on-ledger-paragraph",
                      },
                      { app }
                    )}
                  />
                );
              }

              case ErrPublicKeyUnmatched:
                return (
                  <GuideBox
                    color="warning"
                    title={intl.formatMessage({
                      id: "page.sign.components.ledger-guide.box.error-title",
                    })}
                    paragraph={intl.formatMessage({
                      id: "page.sign.components.ledger-guide.box.try-again-with-same-ledger-paragraph",
                    })}
                  />
                );
              case ErrSignRejected:
                return (
                  <GuideBox
                    color="warning"
                    title={intl.formatMessage({
                      id: "page.sign.components.ledger-guide.box.error-title",
                    })}
                    paragraph={intl.formatMessage({
                      id: "page.sign.components.ledger-guide.box.rejected-signing-on-ledger-paragraph",
                    })}
                  />
                );
            }
          }

          return (
            <GuideBox
              color="warning"
              title={intl.formatMessage({
                id: "page.sign.components.ledger-guide.box.unknown-error-title",
              })}
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
            title={intl.formatMessage({
              id: "page.sign.components.ledger-guide.box.sign-on-ledger-title",
            })}
            paragraph={intl.formatMessage({
              id: "page.sign.components.ledger-guide.box.sign-on-ledger-paragraph",
            })}
            backgroundColor={backgroundColor}
          />
        );
      })()}
    </VerticalCollapseTransition>
  );
};
