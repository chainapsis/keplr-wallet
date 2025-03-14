import React, { FunctionComponent } from "react";
import { Splash } from "../../../../components/splash";
import { observer } from "mobx-react-lite";
import { useInteractionInfo } from "../../../../hooks";
import { useStore } from "../../../../stores";
import { SignBitcoinTxView } from "./view";

export const SignBitcoinTxPage: FunctionComponent = observer(() => {
  const { signBitcoinTxInteractionStore } = useStore();

  useInteractionInfo({
    onWindowClose: () => {
      signBitcoinTxInteractionStore.rejectAll();
    },
  });

  return (
    <React.Fragment>
      {/* CosmosTxView의 주석을 꼭 읽으셈 */}
      {signBitcoinTxInteractionStore.waitingData ? (
        <SignBitcoinTxView
          key={signBitcoinTxInteractionStore.waitingData.id}
          interactionData={signBitcoinTxInteractionStore.waitingData}
        />
      ) : (
        <Splash />
      )}
    </React.Fragment>
  );
});
