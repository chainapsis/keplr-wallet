import React, { FunctionComponent } from "react";
import { SignEthereumInteractionStore } from "@keplr-wallet/stores-core";
import { observer } from "mobx-react-lite";
import { EthSignType } from "@keplr-wallet/types";
import { EthereumArbitrarySignView } from "./components/arbitrary-sign-view";
import { EthereumTransactionSignView } from "./components/transaction-sign-view";
import { EthereumEIP5792SignView } from "./components/eip5792-sign-view";

/**
 * EthereumSigningView - Main router component for Ethereum signing
 * Routes to different components based on sign type:
 * - MESSAGE, EIP712 -> EthereumArbitrarySignView
 * - TRANSACTION -> EthereumTransactionSignView
 * - EIP5792 -> EthereumEIP5792SignView
 */
export const EthereumSigningView: FunctionComponent<{
  interactionData: NonNullable<SignEthereumInteractionStore["waitingData"]>;
}> = observer(({ interactionData }) => {
  const { signType } = interactionData.data;

  switch (signType) {
    case EthSignType.MESSAGE:
    case EthSignType.EIP712:
      return <EthereumArbitrarySignView interactionData={interactionData} />;

    case EthSignType.TRANSACTION:
      return <EthereumTransactionSignView interactionData={interactionData} />;

    case EthSignType.EIP5792:
      return <EthereumEIP5792SignView interactionData={interactionData} />;

    default:
      throw new Error(`Unsupported sign type: ${signType}`);
  }
});
