import { pubkeyToAddress } from "@cosmjs/amino";
import { MsgInstantiateContractEncodeObject } from "@cosmjs/cosmwasm-stargate";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons/faChevronLeft";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { RequestObiSignAndBroadcastMsg } from "@obi-wallet/common";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MsgInstantiateContract } from "cosmjs-types/cosmwasm/wasm/v1/tx";
import Long from "long";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import invariant from "tiny-invariant";

import { IconButton } from "../../../button";
import { useMultisigWallet, useStore } from "../../../stores";
import { Background } from "../../components/background";
import { OnboardingStackParamList } from "../onboarding-stack";

export type MultisigInitProps = NativeStackScreenProps<
  OnboardingStackParamList,
  "create-multisig-init"
>;

export const MultisigInit = observer<MultisigInitProps>(({ navigation }) => {
  const { chainStore } = useStore();
  const wallet = useMultisigWallet();
  const { currentChainInformation } = chainStore;
  const multisig = wallet.nextAdmin;

  const encodeObjects = useMemo(() => {
    if (!multisig.multisig?.address) return [];

    const rawMessage = {
      admin: multisig.multisig.address,
      hot_wallets: [],
      uusd_fee_debt: currentChainInformation.startingUsdDebt,
      fee_lend_repay_wallet: currentChainInformation.debtRepayAddress,
      home_network: currentChainInformation.chainId,
      signers: multisig.multisig.publicKey.value.pubkeys.map((pubkey) => {
        return pubkeyToAddress(pubkey, currentChainInformation.prefix);
      }),
    };

    const value: MsgInstantiateContract = {
      sender: multisig.multisig.address,
      admin: multisig.multisig.address,
      // @ts-expect-error
      codeId: Long.fromInt(currentChainInformation.currentCodeId).toString(),
      label: "Obi Proxy",
      msg: new Uint8Array(Buffer.from(JSON.stringify(rawMessage))),
      funds: [],
    };
    const message: MsgInstantiateContractEncodeObject = {
      typeUrl: "/cosmwasm.wasm.v1.MsgInstantiateContract",
      value,
    };
    return [message];
  }, [currentChainInformation, multisig]);

  useEffect(() => {
    if (encodeObjects.length > 0) {
      (async () => {
        const response = await RequestObiSignAndBroadcastMsg.send({
          id: wallet.id,
          encodeObjects,
          multisig,
          cancelable: false,
          isOnboarding: true,
        });

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
          const instantiateEvent = rawLog[0].events.find((e) => {
            return e.type === "instantiate";
          });
          invariant(
            instantiateEvent,
            "Expected `rawLog` to contain `instantiate` event."
          );
          const contractAddress = instantiateEvent.attributes.find((a) => {
            return a.key === "_contract_address";
          });
          invariant(
            contractAddress,
            "Expected `instantiateEvent` to contain `_contract_address` attribute."
          );
          await wallet.finishProxySetup({
            address: contractAddress.value,
            codeId: chainStore.currentChainInformation.currentCodeId,
          });
        } catch (e) {
          console.log(response.rawLog);
        }
      })();
    }
  }, [chainStore, encodeObjects, multisig, wallet]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
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
});
