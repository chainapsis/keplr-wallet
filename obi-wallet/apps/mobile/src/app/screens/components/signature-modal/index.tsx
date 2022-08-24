import { AminoMsg, serializeSignDoc, StdSignDoc } from "@cosmjs/amino";
import { Sha256 } from "@cosmjs/crypto/build/sha";
import { coins } from "@cosmjs/launchpad";
import { EncodeObject } from "@cosmjs/proto-signing";
import { SigningStargateClient } from "@cosmjs/stargate";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet/src";
import { Multisig, MultisigKey, Text } from "@obi-wallet/common";
import { useRef, useState } from "react";
import { Modal, ModalProps, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { createBiometricSignature } from "../../../biometrics";
import { Button, InlineButton } from "../../../button";
import { TextInput } from "../../../text-input";
import { getSignature, sendSignMessageText } from "../../../text-message";
// TODO:
import SMS from "../../onboarding/onboarding2/assets/sms.svg";
// TODO:
import ShieldCheck from "../../onboarding/onboarding3/assets/shield-check.svg";
import { Background } from "../background";
import { BottomSheet, BottomSheetRef } from "../bottom-sheet";
import { CheckIcon, Key, KeysList } from "../keys-list";
import {
  SecurityQuestionInput,
  useSecurityQuestionInput,
} from "../phone-number/security-question-input";

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
  const phoneNumberBottomSheetRef = useRef<BottomSheetRef>();

  const numberOfSignatures = signatures.size;
  const enoughSignatures =
    numberOfSignatures >=
    parseInt(multisig.multisig.publicKey.value.threshold, 10);

  console.log(
    `-- SIGNATURES: ${numberOfSignatures} / ${multisig.multisig.publicKey.value.threshold}`
  );

  async function getMessage() {
    const rcp = "https://rpc.uni.junonetwork.io/";
    const client = await SigningStargateClient.connect(rcp);

    const account = await client.getAccount(multisig.multisig.address);
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
    return new Sha256(serializeSignDoc(signDoc)).digest();
  }

  function getKey({ id, title }: { id: MultisigKey; title: string }): Key[] {
    if (!multisig[id]) return [];

    const alreadySigned = signatures.has(multisig[id].address);

    return [
      {
        id,
        title,
        right: alreadySigned ? <CheckIcon /> : null,
        async onPress() {
          if (alreadySigned) return;

          switch (id) {
            case "biometrics": {
              const message = await getMessage();
              const { signature } = await createBiometricSignature({
                payload: message,
              });

              setSignatures((signatures) => {
                return new Map(
                  signatures.set(multisig.biometrics.address, signature)
                );
              });
              break;
            }
            case "phoneNumber":
              phoneNumberBottomSheetRef.current.snapToIndex(0);
              break;
            case "cloud":
              console.log("Not implemented yet");
              break;
          }
        },
      },
    ];
  }

  const data: Key[] = [
    ...getKey({ id: "biometrics", title: "Biometrics Signature" }),
    ...getKey({ id: "phoneNumber", title: "Phone Number Signature" }),
  ];

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
          <KeysList data={data} />
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
              style={{
                marginVertical: 20,
              }}
              onPress={async () => {
                onConfirm(signatures);
              }}
            />
          </View>
        </View>
        <BottomSheet bottomSheetRef={phoneNumberBottomSheetRef}>
          <PhoneNumberBottomSheetContent
            payload={multisig.phoneNumber}
            getMessage={getMessage}
            onSuccess={(signature) => {
              setSignatures((signatures) => {
                return new Map(
                  signatures.set(multisig.phoneNumber.address, signature)
                );
              });

              phoneNumberBottomSheetRef.current.close();
            }}
          />
        </BottomSheet>
      </SafeAreaView>
    </Modal>
  );
}

interface PhoneNumberBottomSheetContentProps {
  payload: Multisig["phoneNumber"];

  getMessage(): Promise<Uint8Array>;

  onSuccess(signature: Uint8Array): void;
}

function PhoneNumberBottomSheetContent({
  payload,
  getMessage,
  onSuccess,
}: PhoneNumberBottomSheetContentProps) {
  const { securityAnswer, setSecurityAnswer } = useSecurityQuestionInput();

  const [sentMessage, setSentMessage] = useState(false);
  const [key, setKey] = useState("");

  if (sentMessage) {
    return (
      <View
        style={{
          flexGrow: 1,
          flex: 1,
          paddingHorizontal: 20,
          justifyContent: "space-between",
        }}
      >
        <View>
          <Text
            style={{
              color: "#999CB6",
              fontSize: 14,
              marginTop: 10,
            }}
          >
            Paste in the response you received.
          </Text>
          <TextInput
            placeholder="nuvicasonu"
            textContentType="oneTimeCode"
            keyboardType="number-pad"
            style={{ marginTop: 25 }}
            value={key}
            onChangeText={setKey}
            CustomTextInput={BottomSheetTextInput}
          />
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 24,
            }}
          >
            <Text style={{ color: "rgba(246, 245, 255, 0.6)", fontSize: 12 }}>
              Didn’t receive a response?
            </Text>

            <InlineButton
              label="Resend"
              onPress={async () => {
                const message = await getMessage();
                await sendSignMessageText({
                  phoneNumber: payload.phoneNumber,
                  securityAnswer,
                  message,
                });
              }}
            />
          </View>
        </View>

        <Button
          label="Verify & Proceed"
          LeftIcon={ShieldCheck}
          flavor="blue"
          onPress={async () => {
            onSuccess(await getSignature(key));
          }}
        />
      </View>
    );
  }

  return (
    <View
      style={{
        flexGrow: 1,
        flex: 1,
        paddingHorizontal: 20,
        justifyContent: "space-between",
      }}
    >
      <SecurityQuestionInput
        disabled
        securityQuestion={payload.securityQuestion}
        securityAnswer={securityAnswer}
        onSecurityAnswerChange={setSecurityAnswer}
      />

      <View>
        <Button
          label="Send Magic SMS"
          LeftIcon={SMS}
          flavor="blue"
          style={{
            marginVertical: 20,
          }}
          onPress={async () => {
            const message = await getMessage();
            await sendSignMessageText({
              phoneNumber: payload.phoneNumber,
              securityAnswer,
              message,
            });
            setSentMessage(true);
          }}
        />
      </View>
    </View>
  );
}
