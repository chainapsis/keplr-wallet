import { MsgExecuteContractEncodeObject } from "@cosmjs/cosmwasm-stargate";
import { faAngleDown } from "@fortawesome/free-solid-svg-icons/faAngleDown";
import { faQrcode } from "@fortawesome/free-solid-svg-icons/faQrcode";
import { faTimes } from "@fortawesome/free-solid-svg-icons/faTimes";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import BottomSheet, {
  BottomSheetView,
  TouchableOpacity,
} from "@gorhom/bottom-sheet/src";
import { MsgExecuteContract } from "cosmjs-types/cosmwasm/wasm/v1/tx";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useRef, useState } from "react";
import { Text, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

import { ExtendedCoin, formatCoin, useBalances } from "../../balances";
import { Button } from "../../button";
import { useStore } from "../../stores";
import { TextInput } from "../../text-input";
import { Back } from "../components/back";
import { BottomSheetBackdrop } from "../components/bottomSheetBackdrop";
import {
  SignatureModal,
  useSignatureModalProps,
} from "../components/signature-modal";

export const SendScreen = observer(() => {
  const balances = useBalances();
  const [selectedCoin, setSelectedCoin] = useState<ExtendedCoin | undefined>(
    balances[0]
  );
  const [denominationOpened, setDenominationOpened] = useState(false);
  const refBottomSheet = useRef(null);
  const triggerBottomSheet = (open) => {
    if (!open) {
      refBottomSheet.current.close();
    } else {
      setDenominationOpened(true);
      refBottomSheet.current.snapToIndex(0);
    }
  };

  useEffect(() => {
    if (!selectedCoin) {
      setSelectedCoin(balances[0]);
    }
  }, [balances, selectedCoin]);

  const hydratedSelectedCoin = selectedCoin ? formatCoin(selectedCoin) : null;

  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");

  const { multisigStore } = useStore();
  const { prefix } = multisigStore.currentChainInformation;
  const multisig = multisigStore.getCurrentAdmin(prefix);

  const encodeObjects = useMemo(() => {
    if (!selectedCoin) return [];

    const { digits } = formatCoin(selectedCoin);
    const normalizedAmount =
      parseFloat(amount.replace(",", ".")) * Math.pow(10, digits);
    const rawMessage = {
      execute: {
        msgs: [
          {
            bank: {
              send: {
                amount: [
                  {
                    denom: selectedCoin.denom,
                    amount: normalizedAmount.toFixed(0).toString(),
                  },
                ],
                to_address: address,
              },
            },
          },
        ],
      },
    };

    const value: MsgExecuteContract = {
      sender: multisig.multisig.address,
      contract: multisigStore.proxyAddress.address,
      msg: new Uint8Array(Buffer.from(JSON.stringify(rawMessage))),
      funds: [],
    };

    const message: MsgExecuteContractEncodeObject = {
      typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
      value,
    };
    return [message];
  }, [address, amount, multisig.multisig.address, multisigStore, selectedCoin]);

  const { signatureModalProps, openSignatureModal } = useSignatureModalProps({
    multisig,
    encodeObjects,
    async onConfirm(response) {
      console.log(response);
    },
  });

  return (
    <SafeAreaView
      style={{
        backgroundColor: "rgba(9, 8, 23, 1);",
        flex: 1,
        paddingHorizontal: 20,
        justifyContent: "space-between",
      }}
    >
      <SignatureModal {...signatureModalProps} />
      <View>
        <View style={{ flexDirection: "row" }}>
          <Back style={{ alignSelf: "flex-start", zIndex: 2 }} />
          <Text
            style={{
              width: "100%",
              textAlign: "center",
              marginLeft: -20,
              color: "#F6F5FF",
              fontWeight: "600",
            }}
          >
            Send
          </Text>
        </View>
        <View
          style={{
            marginTop: 55,
            flexDirection: "row",
            alignItems: "flex-end",
          }}
        >
          <TextInput
            label="to"
            placeholder="Wallet Address"
            style={{ flex: 1 }}
            inputStyle={{
              borderTopRightRadius: 0,
              borderBottomRightRadius: 0,
              borderRightWidth: 0,
            }}
            value={address}
            onChangeText={setAddress}
          />
          <TouchableOpacity
            style={{
              width: 56,
              height: 56,
              justifyContent: "center",
              alignItems: "center",
              padding: 5,
              borderTopRightRadius: 12,
              borderBottomRightRadius: 12,
              borderWidth: 1,
              borderColor: "#2F2B4C",
              borderLeftWidth: 0,
            }}
          >
            <View
              style={{
                position: "absolute",
                width: 1,
                backgroundColor: "#2F2B4C",
                height: "100%",
                left: 0,
              }}
            />
            <FontAwesomeIcon
              icon={faQrcode}
              style={{ color: "#887CEB" }}
              size={32}
            />
          </TouchableOpacity>
        </View>
        <View style={{ marginTop: 35 }}>
          <Text style={{ color: "#787B9C", fontSize: 10, marginBottom: 12 }}>
            AMOUNT
          </Text>
          <View
            style={{
              borderWidth: 1,
              borderRadius: 12,
              borderColor: "#2F2B4C",
              padding: 4,
              flexDirection: "row",
            }}
          >
            <TouchableOpacity
              style={{
                borderRadius: 12,
                flex: 2,
                backgroundColor: "#17162C",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingVertical: 12,
                paddingLeft: 12,
              }}
              onPress={() => triggerBottomSheet(true)}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "flex-start",
                  flex: 3,
                }}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    backgroundColor: "orange",
                    marginRight: 12,
                    borderRadius: 44,
                  }}
                />
                <View style={{ justifyContent: "center" }}>
                  <Text
                    style={{
                      color: "#F6F5FF",
                      fontWeight: "500",
                      fontSize: 14,
                    }}
                  >
                    {hydratedSelectedCoin?.denom}
                  </Text>
                  <Text style={{ color: "#999CB6" }}>
                    {hydratedSelectedCoin?.amount}
                  </Text>
                </View>
              </View>
              <View style={{ flex: 1, alignItems: "center" }}>
                <FontAwesomeIcon
                  icon={faAngleDown}
                  style={{ color: "#7B87A8" }}
                />
              </View>
            </TouchableOpacity>
            <TextInput
              keyboardType="numeric"
              style={{
                alignSelf: "center",
                borderColor: "transparent",
                flex: 1,
                paddingLeft: 20,
                paddingRight: 10,
              }}
              inputStyle={{
                borderColor: "transparent",
                textAlign: "right",
                fontSize: 18,
                fontWeight: "500",
              }}
              placeholder="0"
              value={amount}
              onChangeText={setAmount}
            />
          </View>
        </View>
      </View>
      <Button
        flavor="blue"
        label="Next"
        disabled={!address || !amount || !selectedCoin}
        onPress={() => {
          openSignatureModal();
        }}
      />
      <BottomSheetBackdrop
        onPress={() => triggerBottomSheet(false)}
        visible={denominationOpened}
      />
      <BottomSheet
        handleIndicatorStyle={{ backgroundColor: "white" }}
        backgroundStyle={{ backgroundColor: "#100F1E" }}
        handleStyle={{ backgroundColor: "transparent" }}
        snapPoints={["60"]}
        enablePanDownToClose={true}
        ref={refBottomSheet}
        index={-1}
        backdropComponent={(props) => null}
        onClose={() => {
          setDenominationOpened(false);
        }}
      >
        <BottomSheetView
          style={{
            flex: 1,
            backgroundColor: "transparent",
            position: "relative",
            paddingHorizontal: 20,
          }}
        >
          <View
            style={{
              marginBottom: 56,
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <View>
              <Text
                style={{ fontSize: 16, fontWeight: "600", color: "#f6f5ff" }}
              >
                Denomination
              </Text>
              <Text style={{ fontSize: 12, color: "#f6f5ff", opacity: 0.6 }}>
                Select the coin you'd like to send
              </Text>
            </View>
            <TouchableOpacity onPress={() => triggerBottomSheet(false)}>
              <FontAwesomeIcon icon={faTimes} style={{ color: "#F6F5FF" }} />
            </TouchableOpacity>
          </View>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text style={{ fontSize: 12, color: "#f6f5ff", opacity: 0.6 }}>
              NAME
            </Text>
            <Text style={{ fontSize: 12, color: "#f6f5ff", opacity: 0.6 }}>
              HOLDINGS
            </Text>
          </View>
          <FlatList
            data={balances}
            keyExtractor={(item) => item.denom}
            renderItem={(props) => (
              <CoinRenderer
                {...props}
                selected={props.item.denom === selectedCoin?.denom}
                onPress={() => {
                  triggerBottomSheet(false);
                  setSelectedCoin(props.item);
                }}
              />
            )}
          />
        </BottomSheetView>
      </BottomSheet>
    </SafeAreaView>
  );
});

interface CoinRendererProps {
  item: ExtendedCoin;
  selected: boolean;
  onPress: () => void;
}

function CoinRenderer({ item, selected, onPress }: CoinRendererProps) {
  const { denom, label, amount, valueInUsd } = formatCoin(item);

  return (
    <TouchableOpacity
      style={{
        backgroundColor: selected ? "#17162C" : "#100F1E",
        marginVertical: 10,
        padding: 10,
        flexDirection: "row",
        justifyContent: "space-between",
      }}
      onPress={onPress}
    >
      <View style={{ flexDirection: "row" }}>
        <View
          style={{
            width: 36,
            height: 36,
            backgroundColor: "red",
            marginRight: 10,
            borderRadius: 12,
          }}
        />
        <View>
          <Text style={{ color: "#f6f5ff", fontWeight: "500" }}>{label}</Text>
          <Text
            style={{
              color: "#f6f5ff",
              fontWeight: "500",
              fontSize: 12,
              opacity: 0.6,
            }}
          >
            {denom}
          </Text>
        </View>
      </View>
      <View style={{ alignItems: "flex-end" }}>
        <Text style={{ color: "#f6f5ff", fontWeight: "500" }}>
          ${valueInUsd.toFixed(2)}
        </Text>
        <Text
          style={{
            color: "#f6f5ff",
            fontWeight: "500",
            fontSize: 12,
            opacity: 0.6,
          }}
        >
          {amount} {denom}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
