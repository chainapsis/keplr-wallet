import { MsgExecuteContractEncodeObject } from "@cosmjs/cosmwasm-stargate";
import { DeliverTxResponse } from "@cosmjs/stargate";
import { messages, WalletType } from "@obi-wallet/common";
import { MsgExecuteContract } from "cosmjs-types/cosmwasm/wasm/v1/tx";
import { observer } from "mobx-react-lite";
import { useMemo } from "react";

import { useStore } from "../../../stores";
import { SignatureModal, useSignatureModalProps } from "../signature-modal";

export interface InteractionModalProps {
  onClose: () => void;
}

export const InteractionModal = observer<InteractionModalProps>(
  ({ onClose }) => {
    const { multisigStore, interactionStore, walletStore } = useStore();

    const data = interactionStore.waitingData?.data;
    const multisig = multisigStore.currentAdmin;

    const encodeObjects = useMemo(() => {
      if (!walletStore.type) return [];

      switch (walletStore.type) {
        case WalletType.MULTISIG: {
          if (
            !multisig?.multisig?.address ||
            !multisigStore.proxyAddress ||
            !data?.messages
          ) {
            return [];
          }

          const messages = data.messages as MsgExecuteContractEncodeObject[];

          const rawMessage = {
            execute: {
              msgs: messages.map((message) => {
                return {
                  wasm: {
                    execute: {
                      contract_addr: message.value.contract,
                      funds: message.value.funds,
                      msg:
                        message.value.msg &&
                        new Buffer(message.value.msg.buffer).toString("base64"),
                    },
                  },
                };
              }),
            },
          };

          const value: MsgExecuteContract = {
            sender: multisig.multisig.address,
            contract: multisigStore.proxyAddress.address,
            msg: new Uint8Array(Buffer.from(JSON.stringify(rawMessage))),
            funds: [],
          };

          const message: MsgExecuteContractEncodeObject = {
            typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
            value,
          };
          return [message];
        }
        case WalletType.MULTISIG_DEMO:
          return [];
        case WalletType.SINGLESIG: {
          return data?.messages ?? [];
        }
      }
    }, [data, multisig, multisigStore.proxyAddress, walletStore.type]);

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
