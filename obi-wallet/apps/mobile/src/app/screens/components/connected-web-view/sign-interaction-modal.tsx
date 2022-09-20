import { coins } from "@cosmjs/amino";
import { SignDocWrapper } from "@keplr-wallet/cosmos";
import { observer } from "mobx-react-lite";

import { useStore } from "../../../stores";
import { ConfirmMessages } from "../signature-modal/confirm-messages";

export interface SignModalProps {
  onClose: () => void;
}

export const SignInteractionModal = observer<SignModalProps>(({ onClose }) => {
  const { chainStore, signInteractionStore } = useStore();
  const signDocWrapper = signInteractionStore.waitingData?.data.signDocWrapper;

  if (!signDocWrapper) return null;

  return (
    <ConfirmMessages
      messages={signDocWrapper.aminoSignDoc.msgs}
      onConfirm={async () => {
        // TODO: simulate fees
        const newSignDoc = {
          ...signDocWrapper.aminoSignDoc,
          fee: {
            amount: coins(6000, chainStore.currentChainInformation.denom),
            gas: "1280000",
          },
        };

        try {
          await signInteractionStore.approveAndWaitEnd(
            SignDocWrapper.fromAminoSignDoc(newSignDoc)
          );
        } catch (error) {
          console.log(error);
        }
      }}
      onCancel={onClose}
    />
  );
});
