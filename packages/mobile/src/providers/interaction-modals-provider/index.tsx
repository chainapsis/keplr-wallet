import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { SignModal } from "../../modals/staging/sign";
import { UnlockModal } from "../../modals/staging/unlock";
import { LedgerGranterModal } from "../../modals/staging/ledger";

export const InteractionModalsProivder: FunctionComponent = observer(
  ({ children }) => {
    const { interactionModalStore } = useStore();

    // Ensure that only one unlock modal exists
    const unlockInteractionExists =
      interactionModalStore.urlInfos.find((url) => url.url === "/unlock") !=
      null;

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
        {interactionModalStore.urlInfos.map(({ url, key }) => {
          switch (url) {
            case "/sign":
              return (
                <SignModal
                  key={key}
                  isOpen={true}
                  close={() => interactionModalStore.popUrl()}
                />
              );
            case "/ledger-grant":
              return (
                <LedgerGranterModal
                  key={key}
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
