import React, { FunctionComponent } from "react";
import { VerticalCollapseTransition } from "../../../components/transition/vertical-collapse";
import { Gutter } from "../../../components/gutter";
import { GuideBox } from "../../../components/guide-box";
import { KeplrError } from "@keplr-wallet/router";
import {
  ErrCodeDeviceLocked,
  ErrFailedGetPublicKey,
  ErrFailedInit,
  ErrModule,
  ErrPublicKeyUnmatched,
  ErrSignRejected,
} from "../utils/cosmos-ledger-sign";
import { SignInteractionStore } from "@keplr-wallet/stores";

export const LedgerGuideBox: FunctionComponent<{
  interactionData: NonNullable<SignInteractionStore["waitingData"]>;
  isLedgerInteracting: boolean;
  ledgerInteractingError: Error | undefined;
}> = ({ isLedgerInteracting, ledgerInteractingError, interactionData }) => {
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
            ledgerInteractingError.module === ErrModule
          ) {
            switch (ledgerInteractingError.code) {
              case ErrFailedInit:
                return (
                  <GuideBox
                    color="warning"
                    title="Error"
                    paragraph="Connect and unlock your Ledger device."
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

                const appData = interactionData.data.keyInsensitive;
                if (!appData) {
                  throw new Error("Invalid ledger app data");
                }
                if (typeof appData !== "object") {
                  throw new Error("Invalid ledger app data");
                }
                if (appData["Terra"]) {
                  app = "Terra";
                }

                if (appData["Ethereum"]) {
                  app = "Ethereum";
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
                    paragraph="You've selected wrong account on Ledger. Please try again with the account that you've used to create this wallet."
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
