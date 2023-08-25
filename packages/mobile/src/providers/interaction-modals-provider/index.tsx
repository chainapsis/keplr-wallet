import React, { FunctionComponent, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { SignModal } from "../../modals/sign";
import { LedgerGranterModal } from "../../modals/ledger";
import { WalletConnectApprovalModal } from "../../modals/wallet-connect-approval";
import { WCMessageRequester } from "../../stores/wallet-connect/msg-requester";
import { WCGoBackToBrowserModal } from "../../modals/wc-go-back-to-browser";
import { BackHandler, Platform } from "react-native";
import { LoadingScreenModal } from "../loading-screen/modal";
import { KeyRingStatus } from "@keplr-wallet/background";
import { AddTokenModal } from "../../modals/add-token";
import { WCV2MessageRequester } from "../../stores/wallet-connect-v2/msg-requester";
import { ADR36SignModal } from "../../modals/sign/adr36";

export const InteractionModalsProivder: FunctionComponent = observer(
  ({ children }) => {
    const {
      keyRingStore,
      ledgerInitStore,
      permissionStore,
      signInteractionStore,
      walletConnectStore,
      walletConnectV2Store,
      tokensStore,
    } = useStore();

    useEffect(() => {
      if (walletConnectStore.needGoBackToBrowser && Platform.OS === "android") {
        BackHandler.exitApp();
      }
    }, [walletConnectStore.needGoBackToBrowser]);

    useEffect(() => {
      if (
        walletConnectV2Store.needGoBackToBrowser &&
        Platform.OS === "android"
      ) {
        BackHandler.exitApp();
      }
    }, [walletConnectV2Store.needGoBackToBrowser]);

    useEffect(() => {
      for (const data of permissionStore.waitingDatas) {
        // Currently, there is no modal to permit the permission of external apps.
        // All apps should be embeded explicitly.
        // If such apps needs the permissions, add these origins to the privileged origins.
        if (
          data.data.origins.length !== 1 ||
          (!WCMessageRequester.isVirtualSessionURL(data.data.origins[0]) &&
            !WCV2MessageRequester.isVirtualURL(data.data.origins[0]))
        ) {
          permissionStore.reject(data.id);
        }
      }
    }, [permissionStore, permissionStore.waitingDatas]);

    return (
      <React.Fragment>
        {/*
         When the wallet connect client from the deep link is creating, show the loading indicator.
         The user should be able to type password to unlock or create the account if there is no account.
         So, we shouldn't show the loading indicator if the keyring is not unlocked.
         */}
        {keyRingStore.status === KeyRingStatus.UNLOCKED &&
        walletConnectStore.isPendingClientFromDeepLink ? (
          <LoadingScreenModal
            isOpen={true}
            close={() => {
              // noop
            }}
          />
        ) : null}
        {keyRingStore.status === KeyRingStatus.UNLOCKED &&
        walletConnectV2Store.isPendingClientFromDeepLink ? (
          <LoadingScreenModal
            isOpen={true}
            close={() => {
              // noop
            }}
          />
        ) : null}
        {walletConnectStore.needGoBackToBrowser && Platform.OS === "ios" ? (
          <WCGoBackToBrowserModal
            isOpen={walletConnectStore.needGoBackToBrowser}
            close={() => {
              walletConnectStore.clearNeedGoBackToBrowser();
            }}
          />
        ) : null}
        {walletConnectV2Store.needGoBackToBrowser && Platform.OS === "ios" ? (
          <WCGoBackToBrowserModal
            isOpen={walletConnectStore.needGoBackToBrowser}
            close={() => {
              walletConnectStore.clearNeedGoBackToBrowser();
            }}
          />
        ) : null}
        {/*unlockInteractionExists ? (
          <UnlockModal
            isOpen={true}
            close={() => {
              // noop
              // Can't close without unlocking.
            }}
          />
        ) : null*/}
        {ledgerInitStore.isInitNeeded ? (
          <LedgerGranterModal
            isOpen={true}
            close={() => ledgerInitStore.abortAll()}
          />
        ) : null}
        {permissionStore.waitingDatas.map((data) => {
          let isWC = false;

          if (data.data.origins.length === 1) {
            if (WCV2MessageRequester.isVirtualURL(data.data.origins[0])) {
              isWC = true;
            }

            if (
              WCMessageRequester.isVirtualSessionURL(data.data.origins[0]) &&
              walletConnectStore.getSession(
                WCMessageRequester.getSessionIdFromVirtualURL(
                  data.data.origins[0]
                )
              )
            ) {
              isWC = true;
            }
          }

          if (isWC) {
            return (
              <WalletConnectApprovalModal
                key={data.id}
                isOpen={true}
                close={() => permissionStore.reject(data.id)}
                id={data.id}
                data={data.data}
              />
            );
          }

          return null;
        })}
        {signInteractionStore.waitingData &&
        !signInteractionStore.waitingData.data.signDocWrapper.isADR36SignDoc ? (
          <SignModal
            isOpen={true}
            close={() => signInteractionStore.rejectAll()}
          />
        ) : null}
        {signInteractionStore.waitingData &&
        signInteractionStore.waitingData.data.signDocWrapper.isADR36SignDoc ? (
          <ADR36SignModal
            isOpen={true}
            close={() => signInteractionStore.rejectAll()}
          />
        ) : null}
        {tokensStore.waitingSuggestedToken ? (
          <AddTokenModal
            isOpen={true}
            close={() => tokensStore.rejectAllSuggestedTokens()}
          />
        ) : null}
        {children}
      </React.Fragment>
    );
  }
);
