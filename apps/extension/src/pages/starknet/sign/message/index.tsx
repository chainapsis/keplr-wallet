import React, { FunctionComponent } from "react";
import { useStore } from "../../../../stores";
import { useInteractionInfo } from "../../../../hooks";
import { Splash } from "../../../../components/splash";
import { SignStarknetMessageView } from "./view";
import { observer } from "mobx-react-lite";

export const SignStarknetMessagePage: FunctionComponent = observer(() => {
  const { signStarknetMessageInteractionStore } = useStore();

  useInteractionInfo({
    onWindowClose: () => {
      signStarknetMessageInteractionStore.rejectAll();
    },
  });

  return (
    <React.Fragment>
      {/* CosmosTxView의 주석을 꼭 읽으셈 */}
      {signStarknetMessageInteractionStore.waitingData ? (
        <SignStarknetMessageView
          key={signStarknetMessageInteractionStore.waitingData.id}
          interactionData={signStarknetMessageInteractionStore.waitingData}
        />
      ) : (
        <Splash />
      )}
    </React.Fragment>
  );
});
