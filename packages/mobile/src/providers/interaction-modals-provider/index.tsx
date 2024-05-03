import React, { FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "stores/index";
import { SignModal } from "modals/sign";
import { LedgerGranterModal } from "modals/ledger";
import { WalletConnectApprovalModal } from "modals/wallet-connect-approval";
import { WCMessageRequester } from "stores/wallet-connect/msg-requester";
import { WCGoBackToBrowserModal } from "modals/wc-go-back-to-browser";
import { BackHandler, Platform } from "react-native";
import { LoadingScreenModal } from "../loading-screen/modal";
import { KeyRingStatus } from "@keplr-wallet/background";
import { NetworkErrorModal } from "modals/network";
import { useNetInfo } from "@react-native-community/netinfo";
import { LedgerTransectionGuideModel } from "modals/ledger/ledger-transection";

export const InteractionModalsProivder: FunctionComponent = observer(
  ({ children }) => {
    const {
      keyRingStore,
      ledgerInitStore,
      permissionStore,
      signInteractionStore,
      walletConnectStore,
    } = useStore();

    const netInfo = useNetInfo();

    const [openNetworkModel, setIsNetworkModel] = useState(false);
    const [showLedgerGuide, setShowLedgerGuide] = useState(false);

    useEffect(() => {
      setShowLedgerGuide(ledgerInitStore.isShowSignTxnGuide);
    }, [ledgerInitStore.isShowSignTxnGuide]);

    useEffect(() => {
      const networkIsConnected =
        typeof netInfo.isConnected !== "boolean" || netInfo.isConnected;
      setIsNetworkModel(!networkIsConnected);
    }, [netInfo.isConnected]);

    useEffect(() => {
      if (walletConnectStore.needGoBackToBrowser && Platform.OS === "android") {
        BackHandler.exitApp();
      }
    }, [walletConnectStore.needGoBackToBrowser]);

    useEffect(() => {
      for (const data of permissionStore.waitingDatas) {
        // Currently, there is no modal to permit the permission of external apps.
        // All apps should be embedded explicitly.
        // If such apps need the permissions, add these origins to the privileged origins.
        if (
          data.data.origins.length !== 1 ||
          !WCMessageRequester.isVirtualSessionURL(data.data.origins[0])
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
        {walletConnectStore.needGoBackToBrowser && Platform.OS === "ios" ? (
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
        {permissionStore.waitingDatas.map((data) => {
          if (data.data.origins.length === 1) {
            if (
              WCMessageRequester.isVirtualSessionURL(data.data.origins[0]) &&
              walletConnectStore.getSession(
                WCMessageRequester.getSessionIdFromVirtualURL(
                  data.data.origins[0]
                )
              )
            ) {
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
          }

          return null;
        })}
        {
          <SignModal
            isOpen={signInteractionStore.waitingData !== undefined}
            close={() => {
              signInteractionStore.rejectAll();
            }}
          />
        }
        {
          <LedgerGranterModal
            isOpen={ledgerInitStore.isInitNeeded}
            close={() => ledgerInitStore.abortAll()}
          />
        }
        {
          <LedgerTransectionGuideModel
            isOpen={showLedgerGuide}
            close={() => setShowLedgerGuide(false)}
          />
        }
        {
          <NetworkErrorModal
            isOpen={openNetworkModel}
            close={() => {
              setIsNetworkModel(false);
            }}
          />
        }
        {children}
      </React.Fragment>
    );
  }
);
