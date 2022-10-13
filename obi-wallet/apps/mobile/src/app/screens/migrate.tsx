import { MsgMigrateContractEncodeObject } from "@cosmjs/cosmwasm-stargate";
import { MsgMigrateContract } from "cosmjs-types/cosmwasm/wasm/v1/tx";
import Long from "long";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import invariant from "tiny-invariant";

import { useMultisigWallet, useStore } from "../stores";
import { Background } from "./components/background";
import {
  SignatureModalMultisig,
  useSignatureModalProps,
} from "./components/signature-modal";

export const MigrateScreen = observer(() => {
  const { chainStore } = useStore();
  const wallet = useMultisigWallet();
  const { currentChainInformation } = chainStore;
  const multisig = wallet.currentAdmin;

  const encodeObjects = useMemo(() => {
    if (!multisig?.multisig?.address || !wallet.proxyAddress?.address)
      return [];

    const rawMessage = {};

    const value: MsgMigrateContract = {
      sender: multisig.multisig.address,
      codeId: Long.fromInt(currentChainInformation.currentCodeId),
      contract: wallet.proxyAddress.address,
      msg: new Uint8Array(Buffer.from(JSON.stringify(rawMessage))),
    };
    const message: MsgMigrateContractEncodeObject = {
      typeUrl: "/cosmwasm.wasm.v1.MsgMigrateContract",
      value,
    };
    return [message];
  }, [currentChainInformation, multisig, wallet]);

  const { signatureModalProps, openSignatureModal } = useSignatureModalProps({
    multisig,
    encodeObjects,
    async onConfirm(response) {
      try {
        invariant(
          wallet.proxyAddress?.address,
          "Expected proxy address to exist."
        );
        console.log(response);
        wallet.finishProxySetup({
          address: wallet.proxyAddress.address,
          codeId: chainStore.currentChainInformation.currentCodeId,
        });
      } catch (e) {
        console.log(response.rawLog);
      }
    },
  });

  useEffect(() => {
    if (encodeObjects.length > 0) {
      openSignatureModal();
    }
  }, [encodeObjects.length, openSignatureModal]);

  if (encodeObjects.length === 0) return null;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <SignatureModalMultisig cancelable={false} {...signatureModalProps} />
      <Background />
    </SafeAreaView>
  );
});
