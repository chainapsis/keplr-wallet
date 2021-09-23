import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { SignModal } from "../../modals/sign";
import { LedgerGranterModal } from "../../modals/ledger";
import { WalletConnectApprovalModal } from "../../modals/wallet-connect-approval";
import { WCMessageRequester } from "../../stores/wallet-connect/msg-requester";

export const InteractionModalsProivder: FunctionComponent = observer(
  ({ children }) => {
    const {
      ledgerInitStore,
      permissionStore,
      signInteractionStore,
    } = useStore();

    return (
      <React.Fragment>
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
        {signInteractionStore.waitingData ? (
          <SignModal
            isOpen={true}
            close={() => signInteractionStore.rejectAll()}
          />
        ) : null}
        {children}
      </React.Fragment>
    );
  }
);
