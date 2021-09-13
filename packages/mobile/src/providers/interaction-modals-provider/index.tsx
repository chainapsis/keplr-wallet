import React, { FunctionComponent, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { SignModal } from "../../modals/sign";
import { UnlockModal } from "../../modals/unlock";
import { LedgerGranterModal } from "../../modals/ledger";
import { WalletConnectApprovalModal } from "../../modals/wallet-connect-approval";
import { WCMessageRequester } from "../../stores/wallet-connect/msg-requester";

export const InteractionModalsProivder: FunctionComponent = observer(
  ({ children }) => {
    const {
      interactionModalStore,
      walletConnectStore,
      permissionStore,
    } = useStore();

    useEffect(() => {
      // Perhaps, the origin with "keplr_wc_virtual" is for the wallet conenct requests.
      // If this origin is requesting the permission, it is the mistake because such permission should be handled in the wallet connect store.
      // Requests from wallet connect are probably malformed or from mistake.
      for (const data of permissionStore.waitingDatas) {
        if (
          data.data.origins.find((origin) =>
            WCMessageRequester.isVirtualSessionURL(origin)
          )
        ) {
          permissionStore.reject(data.id);
        }
      }
    }, [permissionStore, permissionStore.waitingDatas]);

    // Ensure that only one unlock modal exists
    const unlockInteractionExists =
      interactionModalStore.urlInfos.find((url) => url.url === "/unlock") !=
      null;

    // Ensure that only one ledger grant modal exists
    const grantLedgerNanoExists =
      interactionModalStore.urlInfos.find(
        (url) => url.url === "/ledger-grant"
      ) != null;

    return (
      <React.Fragment>
        {unlockInteractionExists ? (
          <UnlockModal
            isOpen={true}
            close={() => {
              // noop
              // Can't close without unlocking.
            }}
          />
        ) : null}
        {grantLedgerNanoExists ? (
          <LedgerGranterModal
            isOpen={true}
            close={() => interactionModalStore.popUrl()}
          />
        ) : null}
        {walletConnectStore.pendingSessionRequestApprovals.map((approval) => {
          return (
            <WalletConnectApprovalModal
              key={approval.key}
              isOpen={true}
              close={() => approval.reject()}
              approval={approval}
            />
          );
        })}
        {interactionModalStore.urlInfos.map(({ url, key }) => {
          switch (url) {
            case "/sign":
              return (
                <SignModal
                  key={key}
                  interactionKey={key}
                  isOpen={true}
                  close={() => interactionModalStore.popUrl()}
                />
              );
          }

          return null;
        })}
        {children}
      </React.Fragment>
    );
  }
);
