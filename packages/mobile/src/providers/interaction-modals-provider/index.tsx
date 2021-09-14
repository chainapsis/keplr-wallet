import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { SignModal } from "../../modals/sign";
import { UnlockModal } from "../../modals/unlock";
import { LedgerGranterModal } from "../../modals/ledger";
import { WalletConnectApprovalModal } from "../../modals/wallet-connect-approval";
import { WCMessageRequester } from "../../stores/wallet-connect/msg-requester";

export const InteractionModalsProivder: FunctionComponent = observer(
  ({ children }) => {
    const { interactionModalStore, permissionStore } = useStore();

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
        {permissionStore.waitingDatas.map((data) => {
          if (data.data.origins.length === 1) {
            if (WCMessageRequester.isVirtualSessionURL(data.data.origins[0])) {
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
