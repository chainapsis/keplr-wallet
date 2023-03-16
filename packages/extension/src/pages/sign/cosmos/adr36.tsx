import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { useInteractionInfo } from "../../../hooks";
import { Button } from "../../../components/button";

export const SignCosmosADR36Page: FunctionComponent = observer(() => {
  const { signInteractionStore } = useStore();

  const interactionInfo = useInteractionInfo(() => {
    signInteractionStore.rejectAll();
  });

  if (signInteractionStore.waitingData == null) {
    return <div>TODO: Perparing view?</div>;
  }
  if (!signInteractionStore.waitingData.data.signDocWrapper.isADR36SignDoc) {
    throw new Error("Sign doc is not for adr36");
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
