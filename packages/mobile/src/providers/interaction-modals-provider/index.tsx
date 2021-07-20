import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { SignModal } from "../../modals/staging/sign";
import { UnlockModal } from "../../modals/staging/unlock";

export const InteractionModalsProivder: FunctionComponent = observer(
  ({ children }) => {
    const { interactionModalStore } = useStore();

    return (
      <React.Fragment>
        {interactionModalStore.urls.map((url) => {
          switch (url) {
            case "/unlock":
              return (
                <UnlockModal
                  isOpen={true}
                  close={() => {
                    // noop
                    // Can't close without unlocking.
                  }}
                />
              );
            case "/sign":
              return (
                <SignModal
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
