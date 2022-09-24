import { pubkeyType } from "@cosmjs/amino";
import { MsgExecuteContractEncodeObject } from "@cosmjs/cosmwasm-stargate";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons/faChevronLeft";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { Multisig } from "@obi-wallet/common";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MsgExecuteContract } from "cosmjs-types/cosmwasm/wasm/v1/tx";
import Long from "long";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import invariant from "tiny-invariant";

import { IconButton } from "../../../button";
import { lendFees } from "../../../fee-lender-worker";
import { useStore } from "../../../stores";
import { Background } from "../../components/background";
import {
  SignatureModalMultisig,
  useSignatureModalProps,
} from "../../components/signature-modal";
import { OnboardingStackParamList } from "../onboarding-stack";

const demoModeMultisig: Multisig = {
  multisig: {
    address: "demo-create-multisig",
    publicKey: {
      type: pubkeyType.multisigThreshold,
      value: {
        threshold: "1",
        pubkeys: [],
      },
    },
  },
  biometrics: {
    address: "demo-biometrics",
    publicKey: {
      type: pubkeyType.secp256k1,
      value: "demo-biometrics",
    },
  },
  phoneNumber: {
    address: "demo-phone-number",
    phoneNumber: "demo-phone-number",
    securityQuestion: "birthplace",
    publicKey: {
      type: pubkeyType.secp256k1,
      value: "demo-phone-number",
    },
  },
  social: {
    address: "demo-social",
    publicKey: {
      type: pubkeyType.secp256k1,
      value: "demo-social",
    },
  },
  cloud: null,
  email: null,
};

export type ReplaceMultisigProps = NativeStackScreenProps<
  OnboardingStackParamList,
  "replace-multisig" | "replace-multisig-confirm"
>;

export const ReplaceMultisig = observer<ReplaceMultisigProps>(
  ({ navigation }) => {
    const { chainStore, demoStore, multisigStore, walletStore } = useStore();

    const multisig = demoStore.demoMode
      ? demoModeMultisig
      : multisigStore.currentAdmin;

    const nextMultisig = demoStore.demoMode
      ? demoModeMultisig
      : multisigStore.nextAdmin;

    const sender = multisigStore.getUpdateProposed ? nextMultisig : multisig;

    const encodeObjects = useMemo(() => {
      if (!multisig?.multisig?.address) return [];
      if (!nextMultisig.multisig?.address) return [];
      if (!sender?.multisig?.address) return [];
      if (!walletStore.address) return [];

      const rawMessage = multisigStore.getUpdateProposed
        ? {
            confirm_update_admin: {},
          }
        : {
            propose_update_admin: {
              new_admin: nextMultisig.multisig.address,
            },
          };

      const value: MsgExecuteContract = {
        sender: sender.multisig.address,
        contract: walletStore.address,
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
      multisigStore.getUpdateProposed,
      nextMultisig,
      walletStore.address,
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
          if (multisigStore.getUpdateProposed) {
            multisigStore.finishProxySetup({
              address: contractAddress.value,
              codeId: chainStore.currentChainInformation.currentCodeId,
            });
          } else {
            multisigStore.setUpdateProposed(true);
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
    }, [encodeObjects.length, openSignatureModal, multisigStore]);

    if (encodeObjects.length === 0) return null;

    return (
      <SafeAreaView style={{ flex: 1 }}>
        <SignatureModalMultisig {...signatureModalProps} />
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
