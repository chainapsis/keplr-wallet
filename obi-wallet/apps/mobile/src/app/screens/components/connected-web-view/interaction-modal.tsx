import { DeliverTxResponse } from "@cosmjs/stargate";
import { observer } from "mobx-react-lite";

import { useStore } from "../../../stores";
import {
  SignatureModal,
  useSignatureModalProps,
  useWrapEncodeObjects,
} from "../signature-modal";

export interface InteractionModalProps {
  onClose: () => void;
}

export const InteractionModal = observer<InteractionModalProps>(
  ({ onClose }) => {
    const { multisigStore, interactionStore } = useStore();

    const data = interactionStore.waitingData?.data;
    const multisig = multisigStore.currentAdmin;

    const encodeObjects = useWrapEncodeObjects(() => {
      return data?.messages ?? [];
    });
    const { signatureModalProps } = useSignatureModalProps({
      multisig,
      encodeObjects,
      async onConfirm(response: DeliverTxResponse): Promise<void> {
        await interactionStore.approveAndWaitEnd(response);
      },
    });

    if (!data) return null;

    return (
      <SignatureModal {...signatureModalProps} visible onCancel={onClose} />
    );
  }
);
