import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { useInteractionInfo } from "../../../hooks";
import { EthereumSigningView } from "./view";
import { Splash } from "../../../components/splash";

export const SignEthereumTxPage: FunctionComponent = observer(() => {
  const { signEthereumInteractionStore } = useStore();

  useInteractionInfo({
    onWindowClose: () => {
      signEthereumInteractionStore.rejectAll();
    },
  });

  return (
    <React.Fragment>
      {signEthereumInteractionStore.waitingData ? (
        <EthereumSigningView
          key={signEthereumInteractionStore.waitingData.id}
          interactionData={signEthereumInteractionStore.waitingData}
        />
      ) : (
        <Splash />
      )}
    </React.Fragment>
  );
});
