import {
  coins,
  pubkeyToAddress,
  pubkeyType,
  Secp256k1Wallet,
} from "@cosmjs/amino";
import { MsgInstantiateContractEncodeObject } from "@cosmjs/cosmwasm-stargate";
import { SigningStargateClient, StargateClient } from "@cosmjs/stargate";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons/faChevronLeft";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { CURRENT_CODE_ID } from "@obi-wallet/common";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MsgInstantiateContract } from "cosmjs-types/cosmwasm/wasm/v1/tx";
import Long from "long";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useState } from "react";
import { Alert, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getBiometricsKeyPair } from "../../../biometrics";
import { Button, IconButton } from "../../../button";
import { Loader } from "../../../loader";
import { useStore } from "../../../stores";
import { Background } from "../../components/background";
import {
  SignatureModal,
  useSignatureModalProps,
} from "../../components/signature-modal";
import { StackParamList } from "../stack";

export type Onboarding5Props = NativeStackScreenProps<
  StackParamList,
  "onboarding4"
>;

async function getBalances(address: string) {
  const rcp = "https://rpc.uni.junonetwork.io/";
  const client = await StargateClient.connect(rcp);
  return await client.getAllBalances(address);
}

export const Onboarding5 = observer<Onboarding5Props>(({ navigation }) => {
  const { multisigStore } = useStore();
  const multisig = multisigStore.getNextAdmin("juno");

  useEffect(() => {
    (async () => {
      async function hydrateBalances(address: string | null) {
        if (address) {
          return { address, balances: await getBalances(address) };
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
  });

  const encodeObjects = useMemo(() => {
    if (!multisig.multisig?.address) return [];

    const rawMessage = {
      admin: multisig.multisig.address,
      hot_wallets: [],
    };

    const value: MsgInstantiateContract = {
      sender: multisig.multisig.address,
      admin: multisig.multisig.address,
      codeId: Long.fromInt(CURRENT_CODE_ID),
      label: "Obi Proxy",
      msg: new Uint8Array(Buffer.from(JSON.stringify(rawMessage))),
      funds: [],
    };
    const message: MsgInstantiateContractEncodeObject = {
      typeUrl: "/cosmwasm.wasm.v1.MsgInstantiateContract",
      value,
    };
    return [message];
  }, [multisig]);

  const { signatureModalProps, openSignatureModal } = useSignatureModalProps({
    multisig,
    encodeObjects,
    async onConfirm(response) {
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
        codeId: CURRENT_CODE_ID,
      });
    },
  });

  if (encodeObjects.length === 0) return null;

  const [loading, setLoading] = useState(false);

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

        {loading ? <Loader loadingText="Preparing Wallet..." /> : null}

        <View>
          <Button
            flavor="green"
            label="Prepare Multisig Wallet"
            disabled={loading}
            onPress={async () => {
              setLoading(true);

              try {
                const rcp = "https://rpc.uni.junonetwork.io/";

                console.log("before getBiometricsKeyPair");
                const { publicKey, privateKey } = await getBiometricsKeyPair();
                console.log("pubkey:", publicKey);
                console.log("privateKey:", privateKey);

                const wallet = await Secp256k1Wallet.fromKey(
                  new Uint8Array(Buffer.from(privateKey, "base64")),
                  "juno"
                );
                console.log("########### const Wallet: ", wallet);
                console.log("after Secp256k1Wallet");
                const biometricsAddress = pubkeyToAddress(
                  {
                    type: pubkeyType.secp256k1,
                    value: publicKey,
                  },
                  "juno"
                );
                console.log(
                  "########### const biometricsAddress: ",
                  biometricsAddress
                );

                console.log("after biometricsAddress");



                const client = await SigningStargateClient.connectWithSigner(
                  rcp,
                  wallet,
                  { prefix: 'juno' }
                );
                console.log('########### const client: ', client)
                console.log("after SigningStargateClient");

                const fee = {
                  amount: coins(6000, "ujunox"),
                  gas: "200000",
                };

                console.log("before client.sendTokens");
                console.log(
                  "######### multisig.multisig.address",
                  multisig.multisig.address
                );
                console.log("######### biometricsAddress", biometricsAddress);

                // ######### multisig.multisig.address  juno16t8kqgsdl49z2sxt4an2u9vx5g89zr0x3ps5xp
                // ######### biometricsAddress          juno1sf8gzpuxrunwyldw68wxc7jdrp67crrfq779ff

                const result = await client.sendTokens(
                  biometricsAddress,
                  multisig.multisig.address,
                  coins(10000, "ujunox"),
                  fee,
                  ""
                );
                console.log("after client.sendTokens");
                console.log({ result });
                setLoading(false);
              } catch (e) {
                setLoading(false);
                console.log(e);
                Alert.alert("Error PrepareWallet", e.message);
              }
            }}
          />
          <Button
            flavor="blue"
            label="Create Multisig Wallet"
            style={{
              marginVertical: 20,
            }}
            disabled={loading}
            onPress={() => {
              try {
                openSignatureModal();
              } catch (e) {
                Alert.alert("Error Multisig", e.message);
              }
            }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
});
