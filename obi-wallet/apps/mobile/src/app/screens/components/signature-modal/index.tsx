import { AminoMsg, coins, serializeSignDoc, StdSignDoc } from "@cosmjs/amino";
import { createWasmAminoConverters } from "@cosmjs/cosmwasm-stargate";
import { wasmTypes } from "@cosmjs/cosmwasm-stargate/build/modules";
import { Sha256 } from "@cosmjs/crypto/build/sha";
import {
  EncodeObject,
  Registry,
  TxBodyEncodeObject,
} from "@cosmjs/proto-signing";
import {
  AminoConverters,
  AminoTypes,
  createAuthzAminoConverters,
  createBankAminoConverters,
  createDistributionAminoConverters,
  createFreegrantAminoConverters,
  createGovAminoConverters,
  createIbcAminoConverters,
  createStakingAminoConverters,
  defaultRegistryTypes,
  DeliverTxResponse,
  makeMultisignedTx,
  SigningStargateClient,
} from "@cosmjs/stargate";
import { createVestingAminoConverters } from "@cosmjs/stargate/build/modules";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet/src";
import { Multisig, MultisigKey, Text } from "@obi-wallet/common";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { useMemo, useRef, useState } from "react";
import { Alert, Modal, ModalProps, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { createBiometricSignature } from "../../../biometrics";
import { Button, InlineButton } from "../../../button";
import { TextInput } from "../../../text-input";
import {
  parseSignatureTextMessageResponse,
  sendSignatureTextMessage,
} from "../../../text-message";
import { Background } from "../background";
import { BottomSheet, BottomSheetRef } from "../bottom-sheet";
import { CheckIcon, Key, KeysList } from "../keys-list";
import {
  SecurityQuestionInput,
  useSecurityQuestionInput,
} from "../phone-number/security-question-input";
import { SendMagicSmsButton } from "../phone-number/send-magic-sms-button";
import { VerifyAndProceedButton } from "../phone-number/verify-and-proceed-button";

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
    console.log("before SigningStargateClient");
    const rcp = "https://rpc.uni.junonetwork.io/";
    const client = await SigningStargateClient.connect(rcp);
    console.log("before client.getAccount");

    const account = await client.getAccount(multisig.multisig.address);
    const fee = {
      amount: coins(6000, "ujunox"),
      gas: "200000",
    };
    console.log("before StdSignDoc");

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
    console.log("before alreadySigned");

    const alreadySigned = signatures.has(multisig[id].address);

    return [
      {
        id,
        title,
        right: alreadySigned ? <CheckIcon /> : null,

        async onPress() {
          console.log("before if (alreadySigned)");

          if (alreadySigned) return;

          switch (id) {
            case "biometrics": {
              const message = await getMessage();
              console.log("before createBiometricSignature");

              const { signature } = await createBiometricSignature({
                payload: message,
              });
              console.log("before setSignatures");

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
            <ScrollView
              style={{
                height: 300,
              }}
            >
              <Text style={{ color: "#ffffff" }}>
                {JSON.stringify(messages, null, 2)}
              </Text>
            </ScrollView>
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
                try {
                  onConfirm(signatures);
                } catch (e) {
                  Alert.alert("Error", e.message);
                }
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

function createDefaultTypes(prefix: string): AminoConverters {
  return {
    ...createAuthzAminoConverters(),
    ...createBankAminoConverters(),
    ...createDistributionAminoConverters(),
    ...createGovAminoConverters(),
    ...createStakingAminoConverters(prefix),
    ...createIbcAminoConverters(),
    ...createFreegrantAminoConverters(),
    ...createVestingAminoConverters(),
    ...createWasmAminoConverters(),
  };
}

const aminoTypes = new AminoTypes(createDefaultTypes("juno"));
const registry = new Registry([...defaultRegistryTypes, ...wasmTypes]);

export function useSignatureModalProps({
  multisig,
  encodeObjects,
  onConfirm,
}: {
  multisig?: Multisig;
  encodeObjects: EncodeObject[];
  onConfirm(response: DeliverTxResponse): Promise<void>;
}) {
  const [signatureModalVisible, setSignatureModalVisible] = useState(false);
  const [modalKey, setModalKey] = useState(0);

  const signatureModalProps = useMemo(() => {
    const aminoMessages = encodeObjects.map((encodeObject) => {
      return aminoTypes.toAmino(encodeObject);
    });
    const messages = aminoMessages.map((message) => {
      return aminoTypes.fromAmino(message);
    });
    console.log("before onConfirm(signatures:");

    return {
      key: modalKey.toString(),
      visible: signatureModalVisible,
      messages: aminoMessages,
      rawMessages: messages,
      multisig,
      onCancel() {
        setSignatureModalVisible(false);
        setModalKey((value) => value + 1);
      },

      async onConfirm(signatures: Map<string, Uint8Array>) {
        console.log("before TxBodyEncodeObject");

        const body: TxBodyEncodeObject = {
          typeUrl: "/cosmos.tx.v1beta1.TxBody",
          value: {
            messages,
            memo: "",
          },
        };
        console.log("before bodyBytes");

        const bodyBytes = registry.encode(body);
        console.log("before SigningStargateClient.connect");

        const rcp = "https://rpc.uni.junonetwork.io/";

        const client = await SigningStargateClient.connect(rcp);
        console.log("before await client.getAccount.connect");

        const account = await client.getAccount(multisig.multisig.address);

        const fee = {
          amount: coins(6000, "ujunox"),
          gas: "200000",
        };
        console.log("before makeMultisignedTx");

        const tx = makeMultisignedTx(
          multisig.multisig.publicKey,
          account.sequence,
          fee,
          bodyBytes,
          signatures
        );
        console.log("before await client.broadcastTx");

        const result = await client.broadcastTx(
          Uint8Array.from(TxRaw.encode(tx).finish())
        );
        console.log("before await onConfirm(result);");

        try {
          // getting stuck here in debug mode
          await onConfirm(result);
        } catch (e) {
          Alert.alert("Error", e.message);
        }

        setSignatureModalVisible(false);
        setModalKey((value) => value + 1);
      },
    };
  }, [encodeObjects, modalKey, multisig, onConfirm, signatureModalVisible]);

  return {
    signatureModalProps,
    openSignatureModal() {
      setSignatureModalVisible(true);
    },
  };
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
                await sendSignatureTextMessage({
                  phoneNumber: payload.phoneNumber,
                  securityAnswer,
                  message,
                });
              }}
            />
          </View>
        </View>

        <VerifyAndProceedButton
          onPress={async () => {
            onSuccess(await parseSignatureTextMessageResponse(key));
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

      <SendMagicSmsButton
        onPress={async () => {
          const message = await getMessage();
          await sendSignatureTextMessage({
            phoneNumber: payload.phoneNumber,
            securityAnswer,
            message,
          });
          setSentMessage(true);
        }}
      />
    </View>
  );
}
