import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { useInteractionInfo } from "../../../hooks";
import { Splash } from "../../../components/splash";
import { EthSignType } from "@keplr-wallet/types";
import { EthereumSignTxView } from "./views/sign-tx-view";
import { EthereumSignEIP712View } from "./views/sign-eip712-view";
import { EthereumSignMessageView } from "./views/sign-message-view";

export const SignEthereumTxPage: FunctionComponent = observer(() => {
  const { signEthereumInteractionStore } = useStore();

  useInteractionInfo({
    onWindowClose: () => {
      signEthereumInteractionStore.rejectAll();
    },
  });

  if (signEthereumInteractionStore.waitingData === undefined) {
    return <Splash />;
  }

  switch (signEthereumInteractionStore.waitingData.data.signType) {
    case EthSignType.TRANSACTION:
      return (
        <EthereumSignTxView
          key={signEthereumInteractionStore.waitingData.id}
          interactionData={signEthereumInteractionStore.waitingData}
        />
      );
    case EthSignType.EIP712:
      return (
        <EthereumSignEIP712View
          key={signEthereumInteractionStore.waitingData.id}
          interactionData={signEthereumInteractionStore.waitingData}
        />
      );
    case EthSignType.MESSAGE:
      return (
        <EthereumSignMessageView
          key={signEthereumInteractionStore.waitingData.id}
          interactionData={signEthereumInteractionStore.waitingData}
        />
      );
    default:
      throw new Error(
        `Unknown sign type: ${signEthereumInteractionStore.waitingData.data.signType}`
      );
  }
});
