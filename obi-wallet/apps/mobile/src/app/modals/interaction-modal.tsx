import { DeliverTxResponse } from "@cosmjs/stargate";
import { RequestObiSignAndBroadcastPayload } from "@obi-wallet/common";
import { observer } from "mobx-react-lite";

import { useStore } from "../stores";
import { SignatureModal, useSignatureModalProps } from "./signature-modal";

export const InteractionModal = observer(() => {
  const { interactionStore } = useStore();

  const data = interactionStore.waitingData?.data;

  if (!data) return null;

  return <InteractionModalInner data={data} />;
});

const InteractionModalInner = observer(
  ({ data }: { data: RequestObiSignAndBroadcastPayload }) => {
    const { interactionStore } = useStore();

    const { signatureModalProps } = useSignatureModalProps({
      data,
      async onConfirm(response: DeliverTxResponse): Promise<void> {
        await interactionStore.approveAndWaitEnd(response);
      },
    });

    return (
      <SignatureModal
        {...signatureModalProps}
        visible
        onCancel={() => {
          interactionStore.rejectAll();
        }}
      />
    );
  }
);
