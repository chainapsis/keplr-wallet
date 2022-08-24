import {
  coins,
  pubkeyToAddress,
  pubkeyType,
  Secp256k1Wallet,
} from "@cosmjs/amino";
import {
  createWasmAminoConverters,
  MsgInstantiateContractEncodeObject,
} from "@cosmjs/cosmwasm-stargate";
import { wasmTypes } from "@cosmjs/cosmwasm-stargate/build/modules";
import { Registry, TxBodyEncodeObject } from "@cosmjs/proto-signing";
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
  makeMultisignedTx,
  SigningStargateClient,
  StargateClient,
} from "@cosmjs/stargate";
import { createVestingAminoConverters } from "@cosmjs/stargate/build/modules";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons/faChevronLeft";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { CURRENT_CODE_ID } from "@obi-wallet/common";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { MsgInstantiateContract } from "cosmjs-types/cosmwasm/wasm/v1/tx";
import Long from "long";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getBiometricsKeyPair } from "../../../biometrics";
import { Button, IconButton } from "../../../button";
import { useStore } from "../../../stores";
import { Background } from "../../components/background";
import { SignatureModal } from "../../components/signature-modal";
import { StackParamList } from "../stack";

export type Onboarding5Props = NativeStackScreenProps<
  StackParamList,
  "onboarding4"
>;

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

async function getBalances(address: string) {
  const rcp = "https://rpc.uni.junonetwork.io/";
  const client = await StargateClient.connect(rcp);
  return await client.getAllBalances(address);
}

export const Onboarding5 = observer<Onboarding5Props>(({ navigation }) => {
  const { multisigStore } = useStore();
  const [signatureModalVisible, setSignatureModalVisible] = useState(false);
  const [modalKey, setModalKey] = useState(0);

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

  const messages = useMemo(() => {
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
    const aminoTypes = new AminoTypes(createDefaultTypes("juno"));
    return [aminoTypes.toAmino(message)];
  }, [multisig]);

  if (messages.length === 0) return null;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <SignatureModal
        key={modalKey}
        visible={signatureModalVisible}
        messages={messages}
        rawMessages={messages.map((msg) => {
          const aminoTypes = new AminoTypes(createDefaultTypes("juno"));
          return aminoTypes.fromAmino(msg);
        })}
        multisig={multisig}
        onCancel={() => {
          setSignatureModalVisible(false);
          setModalKey((value) => value + 1);
        }}
        onConfirm={async (signatures) => {
          const body: TxBodyEncodeObject = {
            typeUrl: "/cosmos.tx.v1beta1.TxBody",
            value: {
              messages: messages.map((msg) => {
                const aminoTypes = new AminoTypes(createDefaultTypes("juno"));
                return aminoTypes.fromAmino(msg);
              }),
              memo: "",
            },
          };
          const reg = new Registry([...defaultRegistryTypes, ...wasmTypes]);
          const bodyBytes = reg.encode(body);

          const rcp = "https://rpc.uni.junonetwork.io/";
          const client = await SigningStargateClient.connect(rcp);
          const account = await client.getAccount(multisig.multisig.address);

          const fee = {
            amount: coins(6000, "ujunox"),
            gas: "200000",
          };
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
          const rawLog = JSON.parse(result.rawLog) as [
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

          setSignatureModalVisible(false);
          setModalKey((value) => value + 1);
        }}
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
        <View>
          <Button
            flavor="green"
            label="Prepare Multisig Wallet"
            onPress={async () => {
              const rcp = "https://rpc.uni.junonetwork.io/";
              const { publicKey, privateKey } = await getBiometricsKeyPair();
              const wallet = await Secp256k1Wallet.fromKey(
                new Uint8Array(Buffer.from(privateKey, "base64")),
                "juno"
              );
              const biometricsAddress = pubkeyToAddress(
                {
                  type: pubkeyType.secp256k1,
                  value: publicKey,
                },
                "juno"
              );
              const client = await SigningStargateClient.connectWithSigner(
                rcp,
                wallet
              );

              const fee = {
                amount: coins(6000, "ujunox"),
                gas: "200000",
              };

              const result = await client.sendTokens(
                biometricsAddress,
                multisig.multisig.address,
                coins(10000, "ujunox"),
                fee,
                ""
              );
              console.log({ result });
            }}
          />
          <Button
            flavor="blue"
            label="Create Multisig Wallet"
            style={{
              marginVertical: 20,
            }}
            onPress={() => {
              setSignatureModalVisible(true);
            }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
});
