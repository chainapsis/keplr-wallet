import { AminoMsg, serializeSignDoc, StdSignDoc } from "@cosmjs/amino";
import { Sha256 } from "@cosmjs/crypto/build/sha";
import { coins } from "@cosmjs/launchpad";
import { EncodeObject } from "@cosmjs/proto-signing";
import { SigningStargateClient } from "@cosmjs/stargate";
import { Multisig, Text } from "@obi-wallet/common";
import { useState } from "react";
import { Modal, ModalProps, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { createBiometricSignature } from "../../../biometrics";
import { Button } from "../../../button";
import { Background } from "../background";

export interface SignatureModalProps extends ModalProps {
  messages: AminoMsg[];
  rawMessages: EncodeObject[];
  multisig: Multisig;

  onCancel(): void;

  onConfirm(signatures: Map<string, Uint8Array>): void;
}

export function SignatureModal({
  messages,
  rawMessages,
  multisig,
  onCancel,
  onConfirm,
  ...props
}: SignatureModalProps) {
  const [signatures, setSignatures] = useState(new Map<string, Uint8Array>());
  const numberOfSignatures = signatures.size;
  const enoughSignatures =
    numberOfSignatures >=
    parseInt(multisig.multisig.publicKey.value.threshold, 10);

  console.log(
    `-- SIGNATURES: ${numberOfSignatures} / ${multisig.multisig.publicKey.value.threshold}`
  );

  return (
    // TODO: use useSafeArea thingy instead.
    <Modal {...props}>
      <SafeAreaView style={{ flex: 1 }}>
        <Background />
        <View
          style={{
            flex: 1,
            paddingHorizontal: 20,
            justifyContent: "space-between",
          }}
        >
          <View
            style={{
              marginTop: 50,
            }}
          >
            <Text style={{ color: "#ffffff" }}>
              Do you want to sign the following messages?
            </Text>
            <Text style={{ color: "#ffffff" }}>
              {JSON.stringify(messages, null, 2)}
            </Text>
            <Text style={{ color: "#ffffff" }}>
              Signatures: {numberOfSignatures} /{" "}
              {multisig.multisig.publicKey.value.threshold}
            </Text>
          </View>
          <View>
            {multisig.biometrics ? (
              <Button
                flavor="blue"
                label="Create Biometrics Signature"
                // disabled={signatures.has()}
                onPress={async () => {
                  const rcp = "https://rpc.uni.junonetwork.io/";
                  const client = await SigningStargateClient.connect(rcp);

                  const account = await client.getAccount(
                    multisig.multisig.address
                  );
                  const fee = {
                    amount: coins(6000, "ujunox"),
                    gas: "200000",
                  };

                  const signDoc: StdSignDoc = {
                    memo: "",
                    account_number: account.accountNumber.toString(),
                    chain_id: "uni-3",
                    fee: fee,
                    msgs: messages,
                    sequence: account.sequence.toString(),
                  };
                  const message = new Sha256(
                    serializeSignDoc(signDoc)
                  ).digest();

                  const { signature } = await createBiometricSignature({
                    payload: message,
                  });

                  setSignatures((signatures) => {
                    return new Map(
                      signatures.set(multisig.biometrics.address, signature)
                    );
                  });
                }}
              />
            ) : null}
            {multisig.phoneNumber ? (
              <Button
                flavor="blue"
                label="Create Phone Number Signature"
                disabled
                onPress={async () => {
                  console.warn("Not implemented yet");
                }}
              />
            ) : null}
          </View>
          <View>
            <Button
              flavor="blue"
              label="Cancel"
              onPress={() => {
                onCancel();
              }}
            />
            <Button
              disabled={!enoughSignatures}
              flavor="green"
              label="Confirm"
              onPress={async () => {
                onConfirm(signatures);
              }}
            />
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
