import { pubkeyToAddress } from "@cosmjs/amino";
import { MsgExecuteContractEncodeObject } from "@cosmjs/cosmwasm-stargate";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons/faChevronLeft";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MsgExecuteContract } from "cosmjs-types/cosmwasm/wasm/v1/tx";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import invariant from "tiny-invariant";

import { IconButton } from "../../../button";
import { useMultisigWallet, useStore } from "../../../stores";
import { Background } from "../../components/background";
import {
  SignatureModalMultisig,
  useSignatureModalProps,
} from "../../components/signature-modal";
import { OnboardingStackParamList } from "../onboarding-stack";

export type RecoverMultisigProps = NativeStackScreenProps<
  OnboardingStackParamList,
  "recover-multisig"
>;

export const RecoverMultisig = observer<RecoverMultisigProps>(
  ({ navigation }) => {
    const { chainStore, demoStore } = useStore();
    const wallet = useMultisigWallet();
    const { currentChainInformation } = chainStore;

    const multisig = wallet.currentAdmin;
    const nextMultisig = wallet.nextAdmin;

    const sender = wallet.updateProposed ? nextMultisig : multisig;

    const encodeObjects = useMemo(() => {
      if (!multisig?.multisig?.address) return [];
      if (!nextMultisig.multisig?.address) return [];
      if (!sender?.multisig?.address) return [];

      const contract = wallet.walletInRecovery?.contract;
      if (!contract) return [];

      const rawMessage = wallet.updateProposed
        ? {
            confirm_update_admin: {
              signers: nextMultisig.multisig.publicKey.value.pubkeys.map(
                (pubkey) => {
                  return pubkeyToAddress(
                    pubkey,
                    currentChainInformation.prefix
                  );
                }
              ),
            },
          }
        : {
            propose_update_admin: {
              new_admin: nextMultisig.multisig.address,
            },
          };

      const value: MsgExecuteContract = {
        sender: sender.multisig.address,
        contract,
        msg: new Uint8Array(Buffer.from(JSON.stringify(rawMessage))),
        funds: [],
      };
      const message: MsgExecuteContractEncodeObject = {
        typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
        value,
      };
      return [message];
    }, [
      multisig,
      wallet,
      nextMultisig,
      sender?.multisig?.address,
      currentChainInformation,
    ]);

    const { signatureModalProps, openSignatureModal } = useSignatureModalProps({
      multisig: sender,
      encodeObjects,
      async onConfirm(response) {
        if (demoStore.demoMode) {
          return;
        }

        try {
          invariant(response.rawLog, "Expected `response` to have `rawLog`.");
          const rawLog = JSON.parse(response.rawLog) as [
            {
              events: [
                {
                  type: string;
                  attributes: { key: string; value: string }[];
                }
              ];
            }
          ];
          const executeEvent = rawLog[0].events.find((e) => {
            return e.type === "execute";
          });
          invariant(
            executeEvent,
            "Expected `rawLog` to contain `execute` event."
          );
          const contractAddress = executeEvent.attributes.find((a) => {
            return a.key === "_contract_address";
          });
          invariant(
            contractAddress,
            "Expected `executeEvent` to contain `_contract_address` attribute."
          );
          if (wallet.updateProposed) {
            wallet.finishProxySetup({
              address: contractAddress.value,
              codeId: chainStore.currentChainInformation.currentCodeId,
            });
          } else {
            wallet.updateProposed = true;
          }
        } catch (e) {
          console.log(response.rawLog);
        }
      },
    });

    useEffect(() => {
      if (encodeObjects.length > 0) {
        openSignatureModal();
      }
    }, [encodeObjects.length, openSignatureModal, wallet]);

    if (encodeObjects.length === 0) return null;

    return (
      <SafeAreaView style={{ flex: 1 }}>
        <SignatureModalMultisig
          {...signatureModalProps}
          hiddenKeyIds={wallet.updateProposed ? [] : ["biometrics"]}
        />
        <Background />

        <View
          style={{
            flex: 1,
            paddingHorizontal: 20,
            justifyContent: "space-between",
          }}
        >
          <View>
            <IconButton
              style={{
                marginTop: 20,
                marginLeft: -5,
                padding: 5,
                width: 25,
              }}
              onPress={() => {
                navigation.goBack();
              }}
            >
              <FontAwesomeIcon
                icon={faChevronLeft}
                style={{ color: "#7B87A8" }}
              />
            </IconButton>
          </View>
        </View>
      </SafeAreaView>
    );
  }
);
