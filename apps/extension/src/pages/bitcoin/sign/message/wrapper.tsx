import React, { FunctionComponent } from "react";
import { Splash } from "../../../../components/splash";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";
import { useInteractionInfo } from "../../../../hooks";
import { SignBitcoinMessageView } from "./view";

export const SignBitcoinMessagePage: FunctionComponent = observer(() => {
  const { signBitcoinMessageInteractionStore } = useStore();

  useInteractionInfo({
    onWindowClose: () => {
      signBitcoinMessageInteractionStore.rejectAll();
    },
  });

  return (
    <React.Fragment>
      {/* CosmosTxView의 주석을 꼭 읽으셈 */}
      {signBitcoinMessageInteractionStore.waitingData ? (
        <SignBitcoinMessageView
          key={signBitcoinMessageInteractionStore.waitingData.id}
          interactionData={signBitcoinMessageInteractionStore.waitingData}
        />
      ) : (
        <Splash />
      )}
    </React.Fragment>
  );
});
