import React, { FunctionComponent } from "react";
import { useStore } from "../../../../stores";
import { useInteractionInfo } from "../../../../hooks";
import { Splash } from "../../../../components/splash";
import { SignStarknetTxView } from "./view";
import { observer } from "mobx-react-lite";

export const SignStarknetTxPage: FunctionComponent = observer(() => {
  const { signStarknetTxInteractionStore } = useStore();

  useInteractionInfo(() => {
    signStarknetTxInteractionStore.rejectAll();
  });

  return (
    <React.Fragment>
      {/* CosmosTxView의 주석을 꼭 읽으셈 */}
      {signStarknetTxInteractionStore.waitingData ? (
        <SignStarknetTxView
          key={signStarknetTxInteractionStore.waitingData.id}
          interactionData={signStarknetTxInteractionStore.waitingData}
        />
      ) : (
        <Splash />
      )}
    </React.Fragment>
  );
});
