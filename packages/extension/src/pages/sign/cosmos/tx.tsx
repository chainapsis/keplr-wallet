import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { Button } from "../../../components/button";
import { useInteractionInfo } from "../../../hooks";

export const SignCosmosTxPage: FunctionComponent = observer(() => {
  const { signInteractionStore } = useStore();

  const interactionInfo = useInteractionInfo(() => {
    signInteractionStore.rejectAll();
  });

  if (signInteractionStore.waitingData == null) {
    return <div>TODO: Perparing view?</div>;
  }
  return (
    <div>
      <div>{JSON.stringify(signInteractionStore.waitingData.data)}</div>
      <Button
        text="Approve"
        onClick={async () => {
          if (signInteractionStore.waitingData) {
            await signInteractionStore.approveAndWaitEnd(
              signInteractionStore.waitingData.data.signDocWrapper
            );

            if (
              interactionInfo.interaction &&
              !interactionInfo.interactionInternal
            ) {
              window.close();
            }
          }
        }}
      />
    </div>
  );
});
