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
    const {
      chainStore,
      demoStore,
      multisigStore,
      pendingMultisigStore,
      walletStore,
    } = useStore();
    const [signatures, setSignatures] = useState(new Map<string, Uint8Array>());

    const multisig = demoStore.demoMode
      ? demoModeMultisig
      : multisigStore.nextAdmin;

    const pendingMultisig = demoStore.demoMode
      ? demoModeMultisig
      : pendingMultisigStore.nextAdmin;

    const encodeObjects = useMemo(() => {
      if (!multisig.multisig?.address) return [];
      if (!walletStore.address) return [];
      if (!pendingMultisig.multisig?.address) return [];

      let rawMessage;
      if (!multisigStore.getUpdateProposed) {
        rawMessage = {
          propose_update_admin: {
            new_admin: pendingMultisig.multisig.address,
          },
        };
        setSignatures(new Map<string, Uint8Array>());
      } else {
        rawMessage = {
          confirm_update_admin: {},
        };
        const address = pendingMultisigStore.currentAdmin?.multisig?.address;
        if (address !== null && address !== undefined) {
          lendFees({
            chainId: chainStore.currentChainInformation.chainId,
            address: address,
          });
        }
      }

      const value: MsgExecuteContract = {
        sender: multisigStore.getUpdateProposed
          ? pendingMultisig.multisig.address
          : multisig.multisig.address,
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
      chainStore,
      pendingMultisigStore,
      multisigStore.getUpdateProposed,
      pendingMultisig,
      walletStore.address,
    ]);

    const { signatureModalProps, openSignatureModal } = useSignatureModalProps({
      multisig,
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
          if (!multisigStore.getUpdateProposed) {
            multisigStore.setUpdateProposed(true);
          } else {
            multisigStore.replace(pendingMultisigStore);
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
