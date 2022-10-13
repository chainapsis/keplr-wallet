import { DeliverTxResponse } from "@cosmjs/stargate";
import { isMultisigWallet } from "@obi-wallet/common";
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
    const { interactionStore, walletsStore } = useStore();

    const data = interactionStore.waitingData?.data;
    const wallet = walletsStore.currentWallet;
    const multisig = isMultisigWallet(wallet) ? wallet.currentAdmin : null;

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
