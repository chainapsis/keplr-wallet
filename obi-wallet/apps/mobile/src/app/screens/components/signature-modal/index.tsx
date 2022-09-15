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
  createFeegrantAminoConverters,
  createGovAminoConverters,
  createIbcAminoConverters,
  createStakingAminoConverters,
  defaultRegistryTypes,
  DeliverTxResponse,
  makeMultisignedTx,
} from "@cosmjs/stargate";
import { createVestingAminoConverters } from "@cosmjs/stargate/build/modules";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet/src";
import { Multisig, MultisigKey, Text } from "@obi-wallet/common";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Modal, ModalProps, ScrollView, View } from "react-native";
import { TouchableOpacity } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import invariant from "tiny-invariant";

import { createBiometricSignature } from "../../../biometrics";
import { Button, InlineButton } from "../../../button";
import { useStargateClient } from "../../../clients";
import { lendFees } from "../../../fee-lender-worker";
import { Loader } from "../../../loader";
import { useStore } from "../../../stores";
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
import ArrowUpIcon from "./assets/arrowUpIcon.svg";
export interface SignatureModalProps extends ModalProps {
  messages: AminoMsg[];
  rawMessages: EncodeObject[];
  multisig?: Multisig | null;

  onCancel(): void;

  onConfirm(signatures: Map<string, Uint8Array>): void;
}
// const tabs = ["txDetails", "data"]
enum tabs {
  txDetails,
  data,
}
export const SignatureModal = observer<SignatureModalProps>(
  ({
    messages,
    rawMessages,
    multisig,
    onCancel,
    onConfirm,
    ...props
  }: SignatureModalProps) => {
    const client = useStargateClient();
    const [signatures, setSignatures] = useState(new Map<string, Uint8Array>());
    const safeArea = useSafeAreaInsets();
    const phoneNumberBottomSheetRef = useRef<BottomSheetRef>(null);
    const { demoStore, multisigStore } = useStore();
    const [selectedTab, setSelectedTab] = useState(tabs.txDetails);
    const { currentChainInformation } = multisigStore;

    const numberOfSignatures = signatures.size;
    const threshold = multisig?.multisig?.publicKey.value.threshold;
    const enoughSignatures = threshold
      ? numberOfSignatures >= parseInt(threshold, 10)
      : false;

    const getMessage = useCallback(async () => {
      const address = multisig?.multisig?.address;

      const fee = {
        amount: coins(6000, currentChainInformation.denom),
        gas: "200000",
      };

      if (demoStore.demoMode) {
        const signDoc: StdSignDoc = {
          memo: "",
          account_number: "0",
          chain_id: currentChainInformation.chainId,
          fee: fee,
          msgs: messages,
          sequence: "0",
        };
        return new Sha256(serializeSignDoc(signDoc)).digest();
      }

      invariant(address, "Expected `address` to exist.");
      invariant(client, "Expected `client` to be connected.");
      if (!(await client.getAccount(address))) {
        await lendFees({ chainId: currentChainInformation.chainId, address });
      }

      const account = await client.getAccount(address);
      invariant(account, "Expected `account` to be ready.");

      const signDoc: StdSignDoc = {
        memo: "",
        account_number: account.accountNumber.toString(),
        chain_id: currentChainInformation.chainId,
        fee: fee,
        msgs: messages,
        sequence: account.sequence.toString(),
      };
      return new Sha256(serializeSignDoc(signDoc)).digest();
    }, [demoStore, multisig, client, currentChainInformation, messages]);

    function getKey({ id, title }: { id: MultisigKey; title: string }): Key[] {
      const factor = multisig?.[id];
      if (!factor) return [];

      const alreadySigned = signatures.has(factor.address);

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
                const { signature } = demoStore.demoMode
                  ? { signature: new Uint8Array() }
                  : await createBiometricSignature({
                      payload: message,
                    });

                const biometrics = multisig?.biometrics;
                invariant(biometrics, "Expected biometrics key to exist.");

                setSignatures((signatures) => {
                  return new Map(signatures.set(biometrics.address, signature));
                });
                break;
              }
              case "phoneNumber":
                phoneNumberBottomSheetRef.current?.snapToIndex(0);
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
    const renderMSGs = (msgs: AminoMsg[]) => {
      if (msgs.length === 0) {
        return null;
      }
      return msgs.map((msg) => (
        <View
          style={{
            height: 50,
            flexDirection: "row",
            borderBottomColor: "rgba(255,255,255, 0.6)",
            borderBottomWidth: 1,
          }}
        >
          <View style={{ justifyContent: "center", alignItems: "center" }}>
            <ArrowUpIcon />
          </View>
          <View
            style={{ flex: 1, justifyContent: "space-around", paddingLeft: 10 }}
          >
            <Text style={{ color: "white", fontWeight: "600", fontSize: 16 }}>
              Create Obi Wallet
              {/* {renderDirectMessage(msg)} */}
            </Text>
            <Text style={{ color: "white", opacity: 0.6 }}>Value</Text>
          </View>
        </View>
      ));
    };
    const [showLoader, setShowLoader] = useState(false);
    if (!client || !threshold) return null;
    return (
      // TODO: use useSafeArea thingy instead.
      <Modal {...props}>
        <SafeAreaView style={{ flex: 1 }}>
          {showLoader && (
            <Loader
              loadingText="Loading..."
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                zIndex: 999,
                position: "absolute",
                backgroundColor: "#100F1D",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
            />
          )}
          <Background />
          <View
            style={{
              height: 50,
              flexDirection: "row",
              marginTop: safeArea.top,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "white", fontSize: 16, fontWeight: "500" }}>
              Confirm Transaction{" "}
            </Text>
            <Text style={{ position: "absolute", right: 10, color: "white" }}>
              {numberOfSignatures}/2
            </Text>
          </View>
          <View
            style={{
              height: 4,
              backgroundColor: "#1E1D3A",
            }}
          >
            <LinearGradient
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              colors={["#FCCFF7", "#E659D6", "#8877EA", "#86E2EE", "#1E1D3A"]}
              style={{
                flex: 1,
                width: `${(numberOfSignatures / 2) * 100}%`,
                borderRadius: 4,
              }}
            />
          </View>
          <View style={{ height: 30, flexDirection: "row", paddingTop: 10 }}>
            <View style={{ flex: 1 }}>
              <TouchableOpacity
                onPress={() => {
                  setSelectedTab(tabs.txDetails);
                }}
                style={{
                  flex: 1,
                  width: "100%",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: selectedTab === tabs.txDetails ? "#89F5C2" : "white",
                    textDecorationLine:
                      selectedTab === tabs.txDetails ? "underline" : "none",
                  }}
                >
                  Tx Details
                </Text>
              </TouchableOpacity>
            </View>
            <View style={{ flex: 1 }}>
              <TouchableOpacity
                onPress={() => {
                  setSelectedTab(tabs.data);
                }}
                style={{
                  flex: 1,
                  width: "100%",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: selectedTab === tabs.data ? "#89F5C2" : "white",
                    textDecorationLine:
                      selectedTab === tabs.data ? "underline" : "none",
                  }}
                >
                  {" "}
                  DATA
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <View
            style={{
              flex: 1,
              paddingHorizontal: 20,
              justifyContent: "space-between",
            }}
          >
            <View
              style={{
                marginTop: 10,
              }}
            >
              <ScrollView
                style={{
                  height: 250,
                  padding: 10,
                }}
              >
                {selectedTab === tabs.data ? (
                  <Text style={{ color: "#ffffff" }}>
                    {JSON.stringify(messages, null, 2)}
                  </Text>
                ) : (
                  renderMSGs(messages)
                )}
              </ScrollView>
              <Text style={{ color: "#ffffff" }}>
                Signatures: {numberOfSignatures} /{" "}
                {multisig?.multisig?.publicKey.value.threshold}
              </Text>
            </View>

            <KeysList
              data={data}
              style={{
                marginVertical: 10,
              }}
            />

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
                    setShowLoader(true);
                    await onConfirm(signatures);
                    setShowLoader(false);
                  } catch (e) {
                    const error = e as Error;
                    setShowLoader(false);
                    console.error(error);
                    Alert.alert("Error confirming signature", error.message);
                  }
                }}
              />
            </View>
          </View>
          {multisig?.phoneNumber ? (
            <BottomSheet bottomSheetRef={phoneNumberBottomSheetRef}>
              <PhoneNumberBottomSheetContent
                payload={multisig.phoneNumber}
                getMessage={getMessage}
                onSuccess={(signature) => {
                  setSignatures((signatures) => {
                    const { phoneNumber } = multisig;
                    invariant(
                      phoneNumber,
                      "Expected phone number key to exist."
                    );
                    return new Map(
                      signatures.set(phoneNumber.address, signature)
                    );
                  });

                  phoneNumberBottomSheetRef.current?.close();
                }}
              />
            </BottomSheet>
          ) : null}
        </SafeAreaView>
      </Modal>
    );
  }
);

function createDefaultTypes(prefix: string): AminoConverters {
  return {
    ...createAuthzAminoConverters(),
    ...createBankAminoConverters(),
    ...createDistributionAminoConverters(),
    ...createGovAminoConverters(),
    ...createStakingAminoConverters(prefix),
    ...createIbcAminoConverters(),
    ...createFeegrantAminoConverters(),
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
  multisig?: Multisig | null;
  encodeObjects: EncodeObject[];
  onConfirm(response: DeliverTxResponse): Promise<void>;
}): {
  signatureModalProps: SignatureModalProps;
  openSignatureModal: () => void;
} {
  const [signatureModalVisible, setSignatureModalVisible] = useState(false);
  const [modalKey, setModalKey] = useState(0);
  const { demoStore, multisigStore } = useStore();
  const { currentChainInformation } = multisigStore;

  const client = useStargateClient();

  const signatureModalProps = useMemo(() => {
    const aminoMessages = encodeObjects.map((encodeObject) => {
      return aminoTypes.toAmino(encodeObject);
    });
    const messages = aminoMessages.map((message) => {
      return aminoTypes.fromAmino(message);
    });

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
        if (demoStore.demoMode) {
          await onConfirm({
            code: 0,
            gasUsed: 0,
            gasWanted: 0,
            height: 0,
            transactionHash: "",
          });
          return;
        }

        if (!client || !multisig?.multisig) return;

        const { chainId, denom } = currentChainInformation;
        const body: TxBodyEncodeObject = {
          typeUrl: "/cosmos.tx.v1beta1.TxBody",
          value: {
            messages,
            memo: "",
          },
        };
        const bodyBytes = registry.encode(body);

        const address = multisig.multisig.address;

        const fee = {
          amount: coins(6000, denom),
          gas: "200000",
        };

        if (!(await client.getAccount(address))) {
          await lendFees({ chainId, address });
        }

        const account = await client.getAccount(multisig.multisig.address);
        invariant(account, "Expected `account` to be ready.");

        const tx = makeMultisignedTx(
          multisig.multisig.publicKey,
          account.sequence,
          fee,
          bodyBytes,
          signatures
        );

        const result = await client.broadcastTx(
          Uint8Array.from(TxRaw.encode(tx).finish())
        );
        await onConfirm(result);
      },
    };
  }, [
    encodeObjects,
    modalKey,
    signatureModalVisible,
    multisig,
    demoStore,
    client,
    currentChainInformation,
    onConfirm,
  ]);

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

const PhoneNumberBottomSheetContent =
  observer<PhoneNumberBottomSheetContentProps>(
    ({ payload, getMessage, onSuccess }) => {
      const { demoStore } = useStore();
      const { securityAnswer, setSecurityAnswer } = useSecurityQuestionInput();

      const [sentMessage, setSentMessage] = useState(false);
      const [key, setKey] = useState("");

      const [magicButtonDisabled, setMagicButtonDisabled] = useState(true); // Magic Button disabled by default
      const [
        magicButtonDisabledDoubleclick,
        setMagicButtonDisabledDoubleclick,
      ] = useState(false); // Magic Button disabled on button-click to prevent double-click

      const [verifyButtonDisabled, setVerifyButtonDisabled] = useState(true); // Magic Button disabled by default
      const [
        verifyButtonDisabledDoubleclick,
        setVerifyButtonDisabledDoubleclick,
      ] = useState(false); // Magic Button disable on button-click

      const minInputCharsSecurityAnswer = 3;
      const minInputCharsSMSCode = 8;

      useEffect(() => {
        if (securityAnswer.length >= minInputCharsSecurityAnswer) {
          setMagicButtonDisabled(false); // Enable Magic Button if checks are okay
        } else {
          setMagicButtonDisabled(true);
        }
      }, [magicButtonDisabled, setMagicButtonDisabled, securityAnswer]);

      useEffect(() => {
        if (key.length >= minInputCharsSMSCode) {
          setVerifyButtonDisabled(false); // Enable Magic Button if checks are okay
        } else {
          setVerifyButtonDisabled(true);
          setVerifyButtonDisabledDoubleclick(false);
        }
      }, [verifyButtonDisabled, setVerifyButtonDisabled, key]);

      if (!payload) return null;

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
                placeholder="8-Digits SMS-Code"
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
                <Text
                  style={{ color: "rgba(246, 245, 255, 0.6)", fontSize: 12 }}
                >
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
                try {
                  setVerifyButtonDisabledDoubleclick(true);
                  if (demoStore.demoMode) {
                    onSuccess(new Uint8Array());
                  } else {
                    const response = await parseSignatureTextMessageResponse(
                      key
                    );
                    if (response) onSuccess(response);
                  }
                  setVerifyButtonDisabledDoubleclick(false);
                } catch (e) {
                  const error = e as Error;
                  setVerifyButtonDisabledDoubleclick(false);
                  console.error(error);
                  Alert.alert(
                    "Error VerifyAndProceedButton (1)",
                    error.message
                  );
                }
              }}
              disabled={
                verifyButtonDisabledDoubleclick
                  ? verifyButtonDisabledDoubleclick
                  : verifyButtonDisabled
              }
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
            CustomTextInput={BottomSheetTextInput}
          />

          <SendMagicSmsButton
            onPress={async () => {
              setMagicButtonDisabledDoubleclick(true);

              try {
                if (!demoStore.demoMode) {
                  const message = await getMessage();
                  await sendSignatureTextMessage({
                    phoneNumber: payload.phoneNumber,
                    securityAnswer,
                    message,
                  });
                }

                setSentMessage(true);

                setMagicButtonDisabledDoubleclick(false);
              } catch (e) {
                const error = e as Error;
                setMagicButtonDisabledDoubleclick(false);
                console.error(error);
                Alert.alert("Sending SMS failed.", error.message);
              }
            }}
            disabled={
              magicButtonDisabledDoubleclick
                ? magicButtonDisabledDoubleclick
                : magicButtonDisabled
            }
          />
        </View>
      );
    }
  );
