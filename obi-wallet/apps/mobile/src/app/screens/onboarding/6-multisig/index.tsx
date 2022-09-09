import { MsgInstantiateContractEncodeObject } from "@cosmjs/cosmwasm-stargate";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons/faChevronLeft";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MsgInstantiateContract } from "cosmjs-types/cosmwasm/wasm/v1/tx";
import Long from "long";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { IconButton } from "../../../button";
import { useStargateClient } from "../../../clients";
import { useStore } from "../../../stores";
import { Background } from "../../components/background";
import {
  SignatureModal,
  useSignatureModalProps,
} from "../../components/signature-modal";
import { StackParamList } from "../stack";

export type MultisigOnboardingProps = NativeStackScreenProps<
  StackParamList,
  "onboarding5"
>;

export const MultisigOnboarding = observer<MultisigOnboardingProps>(
  ({ navigation }) => {
    const { multisigStore } = useStore();
    const { currentChainInformation } = multisigStore;
    const multisig = multisigStore.nextAdmin;

    const client = useStargateClient();

    useEffect(() => {
      (async () => {
        async function hydrateBalances(address: string | null) {
          if (address && client) {
            return { address, balances: await client.getAllBalances(address) };
          } else {
            return null;
          }
        }

        const balances = {
          multisig: await hydrateBalances(multisig.multisig?.address),
          biometrics: await hydrateBalances(multisig.biometrics?.address),
          phoneNumber: await hydrateBalances(multisig.phoneNumber?.address),
        };

        console.log("-- BALANCE MULTISIG", balances.multisig);
        console.log("-- BALANCE BIOMETRICS", balances.biometrics);
        console.log("-- BALANCE PHONE NUMBER", balances.phoneNumber);
      })();
    }, [
      client,
      multisig.biometrics?.address,
      multisig.multisig?.address,
      multisig.phoneNumber?.address,
    ]);

    const encodeObjects = useMemo(() => {
      if (!multisig.multisig?.address) return [];

      const rawMessage = {
        admin: multisig.multisig.address,
        hot_wallets: [],
        uusd_fee_debt: currentChainInformation.startingUsdDebt,
        fee_lend_repay_wallet: currentChainInformation.debtRepayAddress,
        home_network: currentChainInformation.chainId,
      };

      const value: MsgInstantiateContract = {
        sender: multisig.multisig.address,
        admin: multisig.multisig.address,
        codeId: Long.fromInt(currentChainInformation.currentCodeId),
        label: "Obi Proxy",
        msg: new Uint8Array(Buffer.from(JSON.stringify(rawMessage))),
        funds: [],
      };
      const message: MsgInstantiateContractEncodeObject = {
        typeUrl: "/cosmwasm.wasm.v1.MsgInstantiateContract",
        value,
      };
      return [message];
    }, [currentChainInformation, multisig.multisig.address]);

    const { signatureModalProps, openSignatureModal } = useSignatureModalProps({
      multisig,
      encodeObjects,
      async onConfirm(response) {
        try {
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
          const instantiateEvent = rawLog[0].events.find((e) => {
            return e.type === "instantiate";
          });
          const contractAddress = instantiateEvent.attributes.find((a) => {
            return a.key === "_contract_address";
          });

          multisigStore.finishProxySetup({
            address: contractAddress.value,
            codeId: multisigStore.currentChainInformation.currentCodeId,
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
        <SignatureModal {...signatureModalProps} />
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
