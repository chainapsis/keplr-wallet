import {
  AminoMsg,
  coins,
  Secp256k1Wallet,
  serializeSignDoc,
  StdSignDoc,
} from "@cosmjs/amino";
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
import {
  createStargateClient,
  isAnyMultisigWallet,
  isMultisigDemoWallet,
  isSinglesigWallet,
  Multisig,
  MultisigKey,
  MultisigWallet,
  RequestObiSignAndBroadcastPayload,
  SinglesigWallet,
  Text,
  WalletType,
} from "@obi-wallet/common";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { Alert, ModalProps, View } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import invariant from "tiny-invariant";

import { createBiometricSignature } from "../../biometrics";
import { InlineButton } from "../../button";
import { createSigningCosmWasmClient } from "../../clients";
import { lendFees } from "../../fee-lender-worker";
import {
  BottomSheet,
  BottomSheetRef,
} from "../../screens/components/bottom-sheet";
import { CheckIcon, Key, KeysList } from "../../screens/components/keys-list";
import {
  SecurityQuestionInput,
  useSecurityQuestionInput,
} from "../../screens/components/phone-number/security-question-input";
import { SendMagicSmsButton } from "../../screens/components/phone-number/send-magic-sms-button";
import { VerifyAndProceedButton } from "../../screens/components/phone-number/verify-and-proceed-button";
import { useStore } from "../../stores";
import { TextInput } from "../../text-input";
import {
  parseSignatureTextMessageResponse,
  sendSignatureTextMessage,
} from "../../text-message";
import { ConfirmMessages } from "./confirm-messages";
import { wrapMessages } from "./wrap-messages";

export interface SignatureModalProps extends ModalProps {
  wallet: MultisigWallet | SinglesigWallet;
  innerMessages: AminoMsg[];
  messages: AminoMsg[];
  rawMessages: EncodeObject[];
  multisig?: Multisig | null;
  cancelable?: boolean;
  hiddenKeyIds?: MultisigKey[];
  isOnboarding?: boolean;

  onCancel(): void;

  onConfirm(signatures: Map<string, Uint8Array>): void;
}

export const SignatureModal = observer<SignatureModalProps>((props) => {
  if (!props.wallet.type) return null;

  switch (props.wallet.type) {
    case WalletType.Multisig:
      return <SignatureModalMultisig {...props} />;
    case WalletType.Singlesig:
      return <SignatureModalSinglesig {...props} />;
  }
});

export const SignatureModalSinglesig = observer<SignatureModalProps>(
  ({
    messages,
    rawMessages,
    multisig,
    onCancel,
    onConfirm,
    isOnboarding,
    ...props
  }) => {
    const [loading, setLoading] = useState(false);
    const intl = useIntl();

    return (
      <ConfirmMessages
        {...props}
        isOnboarding={isOnboarding}
        loading={loading}
        messages={messages}
        onCancel={onCancel}
        onConfirm={async () => {
          try {
            setLoading(true);
            await onConfirm(new Map());
            setLoading(false);
          } catch (e) {
            const error = e as Error;
            setLoading(false);
            console.error(error);
            Alert.alert(
              intl.formatMessage({
                id: "signature.error.confirmingtx",
                defaultMessage: "Error Confirming Transaction",
              }),
              error.message
            );
          }
        }}
      />
    );
  }
);

export const SignatureModalMultisig = observer<SignatureModalProps>(
  function SignatureModal({
    wallet,
    messages,
    rawMessages,
    multisig,
    onCancel,
    onConfirm,
    hiddenKeyIds,
    isOnboarding,
    ...props
  }: SignatureModalProps) {
    const intl = useIntl();
    const [signatures, setSignatures] = useState(new Map<string, Uint8Array>());
    const phoneNumberBottomSheetRef = useRef<BottomSheetRef>(null);
    const { chainStore } = useStore();
    const { currentChainInformation } = chainStore;
    const [settingBiometrics, setSettingBiometrics] = useState(false);

    const numberOfSignatures = signatures.size;
    const threshold = multisig?.multisig?.publicKey.value.threshold;
    const enoughSignatures = threshold
      ? numberOfSignatures >= parseInt(threshold, 10)
      : false;

    const getMessage = useCallback(async () => {
      const address = multisig?.multisig?.address;

      const fee = {
        amount: coins(6000, currentChainInformation.denom),
        gas: "1280000",
      };

      invariant(address, "Expected `address` to exist.");

      const client = await createStargateClient(
        currentChainInformation.chainId
      );

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

      client.disconnect();
      return new Sha256(serializeSignDoc(signDoc)).digest();
    }, [
      multisig,
      currentChainInformation.denom,
      currentChainInformation.chainId,
      messages,
    ]);

    function getKey({ id, title }: { id: MultisigKey; title: string }): Key[] {
      const factor = multisig?.[id];
      if (!factor) return [];

      const alreadySigned = signatures.has(factor.address);
      const onPress = async () => {
        if (alreadySigned) return;

        switch (id) {
          case "biometrics": {
            const message = await getMessage();
            const { signature } = await createBiometricSignature({
              payload: message,
              demoMode: isMultisigDemoWallet(wallet),
            });
            const biometrics = multisig?.biometrics;
            invariant(biometrics, "Expected device key to exist.");

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
      };

      return [
        {
          id,
          title,
          signed: alreadySigned,
          right: alreadySigned ? <CheckIcon /> : null,
          onPress,
        },
      ];
    }

    const data: Key[] = [
      ...getKey({
        id: "biometrics",
        title: intl.formatMessage({
          id: "signature.modal.biometricsignature",
          defaultMessage: "Biometrics Signature",
        }),
      }),
      ...getKey({
        id: "phoneNumber",
        title: intl.formatMessage({
          id: "signature.modal.phonesignature",
          defaultMessage: "Phone Number Signature",
        }),
      }),
    ].filter((key) => {
      return hiddenKeyIds ? !hiddenKeyIds.includes(key.id) : true;
    });
    const [loading, setLoading] = useState(false);

    const didAutosign = useRef(false);
    useEffect(() => {
      (async () => {
        if (props.visible && !didAutosign.current) {
          didAutosign.current = true;
          const biometrics = data.find((key) => key.id === "biometrics");
          if (biometrics && typeof biometrics.onPress === "function") {
            try {
              setSettingBiometrics(true);
              await biometrics.onPress();
            } catch (e) {
              // noop
            }
            setSettingBiometrics(false);
          }
        }
      })();
      // We really only want to do this once
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.visible]);

    if (!threshold) return null;

    const getSignaturePercentage = () => {
      const percentage = (numberOfSignatures / parseInt(threshold, 10)) * 100;
      if (percentage > 100) return "100%";
      return `${percentage}%`;
    };
    return (
      <ConfirmMessages
        {...props}
        loading={loading}
        isOnboarding={isOnboarding}
        disabled={!enoughSignatures}
        messages={messages}
        onCancel={onCancel}
        onConfirm={async () => {
          try {
            setLoading(true);
            await onConfirm(signatures);
            setLoading(false);
          } catch (e) {
            const error = e as Error;
            setLoading(false);
            console.error(error);
            Alert.alert("Error confirming signature", error.message);
          }
        }}
        footer={
          multisig?.phoneNumber ? (
            <BottomSheet bottomSheetRef={phoneNumberBottomSheetRef}>
              <PhoneNumberBottomSheetContent
                payload={multisig.phoneNumber}
                wallet={wallet}
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
          ) : null
        }
      >
        <View
          style={{
            height: 10,
            backgroundColor: "#1E1D3A",
            borderRadius: 10,
          }}
        >
          <LinearGradient
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            colors={["#FCCFF7", "#E659D6", "#8877EA", "#86E2EE"]}
            style={{
              flex: 1,
              width: getSignaturePercentage(),
              borderRadius: 10,
            }}
          />
        </View>
        <View>
          <Text
            style={{
              textAlign: "center",
              color: "#F6F5FF",
              fontSize: 12,
              fontWeight: "600",
              opacity: 0.6,
              marginTop: 5,
            }}
          >
            <FormattedMessage
              id="signature.keysrequired"
              defaultMessage="Keys Required"
            />
            : {numberOfSignatures}/
            {multisig.multisig?.publicKey.value.threshold}{" "}
          </Text>
        </View>
        {settingBiometrics ? (
          <View
            style={{
              marginVertical: 10,
              backgroundColor: "#130F23",
              borderRadius: 12,
              justifyContent: "center",
              alignItems: "center",
              paddingVertical: 50,
            }}
          >
            <Text style={{ color: "white", fontSize: 16, fontWeight: "700" }}>
              Preparing…
            </Text>
          </View>
        ) : (
          <KeysList
            data={data}
            tiled
            style={{
              marginVertical: 10,
              backgroundColor: "#130F23",
              borderRadius: 12,
            }}
          />
        )}
      </ConfirmMessages>
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
  data,
  onConfirm,
}: {
  data: RequestObiSignAndBroadcastPayload;
  onConfirm(response: DeliverTxResponse): Promise<void>;
}): {
  signatureModalProps: SignatureModalProps;
  openSignatureModal: () => void;
} {
  const [signatureModalVisible, setSignatureModalVisible] = useState(false);
  const [modalKey, setModalKey] = useState(0);
  const { chainStore, walletsStore } = useStore();
  const { currentChainInformation } = chainStore;

  const { id, multisig } = data;
  const wallet = walletsStore.getWallet(id);

  const wrappedEncodeObjects = getWrappedEncodeObjects();
  const innerEncodeObjects = data.encodeObjects;

  const signatureModalProps = useMemo(() => {
    const innerAminoMessages = innerEncodeObjects.map((encodeObject) => {
      return aminoTypes.toAmino(encodeObject);
    });
    const aminoMessages = wrappedEncodeObjects.map((encodeObject) => {
      return aminoTypes.toAmino(encodeObject);
    });
    const messages = aminoMessages.map((message) => {
      return aminoTypes.fromAmino(message);
    });

    return {
      key: modalKey.toString(),
      wallet,
      visible: signatureModalVisible,
      innerMessages: innerAminoMessages,
      messages: aminoMessages,
      rawMessages: messages,
      multisig,
      cancelable: data.cancelable,
      hiddenKeyIds: data.hiddenKeyIds,
      isOnboarding: data.isOnboarding,
      onCancel() {
        setSignatureModalVisible(false);
        setModalKey((value) => value + 1);
      },
      async onConfirm(signatures: Map<string, Uint8Array>) {
        async function handleMultisig() {
          if (!multisig?.multisig) return;

          const client = await createStargateClient(
            currentChainInformation.chainId
          );

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
          const feeAmount = 6000;
          const fee = {
            amount: coins(feeAmount, denom),
            gas: "1280000",
          };

          if (!(await client.getAccount(address))) {
            await lendFees({ chainId, address });
          }
          async function hasEnoughForFees() {
            const balance = await client?.getBalance(address, denom);
            return balance && parseInt(balance.amount, 10) >= feeAmount;
          }

          while (!(await hasEnoughForFees())) {
            await lendFees({ chainId, address });
          }

          const account = await client.getAccount(address);
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

          client.disconnect();
          await onConfirm(result);
        }

        switch (wallet.type) {
          case WalletType.Multisig:
            await handleMultisig();
            break;
          case WalletType.Singlesig: {
            invariant(
              isSinglesigWallet(wallet),
              "Expected `wallet` to be singlesig wallet."
            );

            invariant(
              wallet.privateKey,
              "Expected `wallet.privateKey` to exist."
            );

            const signer = await Secp256k1Wallet.fromKey(
              wallet.privateKey,
              currentChainInformation.prefix
            );
            const client = await createSigningCosmWasmClient({
              chainId: currentChainInformation.chainId,
              signer,
            });

            invariant(wallet.address, "Expected `wallet.address` to exist.");

            const result = await client.signAndBroadcast(
              wallet.address,
              messages,
              "auto"
            );

            client.disconnect();
            await onConfirm(result);
          }
        }

        setSignatureModalVisible(false);
        setModalKey((value) => value + 1);
      },
    };
  }, [
    innerEncodeObjects,
    wrappedEncodeObjects,
    modalKey,
    signatureModalVisible,
    multisig,
    wallet,
    currentChainInformation,
    onConfirm,
  ]);

  return {
    signatureModalProps,
    openSignatureModal() {
      setSignatureModalVisible(true);
    },
  };

  function getWrappedEncodeObjects(): EncodeObject[] {
    if (isAnyMultisigWallet(wallet) && data.wrap) {
      const multisig = data.multisig;
      if (!multisig?.multisig?.address || !wallet.proxyAddress) {
        return [];
      }
      return [
        wrapMessages({
          messages: data.encodeObjects,
          sender: multisig.multisig.address,
          contract: wallet.proxyAddress.address,
        }),
      ];
    } else {
      if (!wallet?.address) return [];
      return data.encodeObjects;
    }
  }
}

interface PhoneNumberBottomSheetContentProps {
  payload: Multisig["phoneNumber"];
  wallet: MultisigWallet | SinglesigWallet;

  getMessage(): Promise<Uint8Array>;

  onSuccess(signature: Uint8Array): void;
}

const PhoneNumberBottomSheetContent =
  observer<PhoneNumberBottomSheetContentProps>(
    ({ payload, wallet, getMessage, onSuccess }) => {
      const intl = useIntl();
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
                <FormattedMessage
                  id="signature.pasteresponse"
                  defaultMessage="Paste in the response you received."
                />
              </Text>
              <TextInput
                placeholder={intl.formatMessage({
                  id: "signature.smscodelabel",
                  defaultMessage: "8-Digits SMS-Code",
                })}
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
                  <FormattedMessage
                    id="signature.noresponselabel"
                    defaultMessage="Didn't receive a response?"
                  />
                </Text>

                <InlineButton
                  label={intl.formatMessage({
                    id: "signature.sendagain",
                    defaultMessage: "Resend",
                  })}
                  onPress={async () => {
                    const message = await getMessage();
                    await sendSignatureTextMessage({
                      phoneNumber: payload.phoneNumber,
                      securityAnswer,
                      message,
                      demoMode: isMultisigDemoWallet(wallet),
                    });
                  }}
                />
              </View>
            </View>

            <VerifyAndProceedButton
              onPress={async () => {
                try {
                  setVerifyButtonDisabledDoubleclick(true);
                  const response = await parseSignatureTextMessageResponse({
                    key,
                    demoMode: isMultisigDemoWallet(wallet),
                  });
                  if (response) onSuccess(response);
                  setVerifyButtonDisabledDoubleclick(false);
                } catch (e) {
                  const error = e as Error;
                  setVerifyButtonDisabledDoubleclick(false);
                  console.error(error);
                  Alert.alert(
                    intl.formatMessage({
                      id: "general.error",
                      defaultMessage: "Error",
                    }) + "VerifyAndProceedButton (1)",
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
                const message = await getMessage();
                await sendSignatureTextMessage({
                  phoneNumber: payload.phoneNumber,
                  securityAnswer,
                  message,
                  demoMode: isMultisigDemoWallet(wallet),
                });
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
