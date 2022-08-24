import { faAngleDoubleRight } from "@fortawesome/free-solid-svg-icons/faAngleDoubleRight";
import { faAngleDown } from "@fortawesome/free-solid-svg-icons/faAngleDown";
import { faTimes } from "@fortawesome/free-solid-svg-icons/faTimes";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import BottomSheet, {
  BottomSheetView,
  TouchableOpacity,
} from "@gorhom/bottom-sheet/src";
import { FC, useRef } from "react";
import { useState } from "react";
import { Text, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "../../button";
import { TextInput } from "../../text-input";
import { Back } from "../components/back";
import { BottomSheetBackdrop } from "../components/bottomSheetBackdrop";


const coins = [
  {
    key: "bitcoin",
    name: "Bitcoin",
    value: "BTC",
    balance: "100",
  },
  {
    key: "ethereum",
    name: "Ethereum",
    value: "ETH",
    balance: "100",
  },
  {
    key: "juno",
    name: "Juno",
    value: "JUNO",
    balance: "100",
  },
  {
    key: "atom",
    name: "Atom",
    value: "ATOM",
    balance: "100",
  },
  {
    key: "luna",
    name: "Luna",
    value: "LUNA",
    balance: "100",
  },
  {
    key: "usdc",
    name: "USDC",
    value: "USDC",
    balance: "100",
  },
  {
    key: "ust",
    name: "UST",
    value: "UST",
    balance: "100",
  },
  {
    key: "kuji",
    name: "Kuji",
    value: "KUJI",
    balance: "100",
  },
];

export function SendScreen() {
  const [selectedCoin, setSelectedCoin] = useState(coins[0]);
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

  return (
    <SafeAreaView
      style={{
        backgroundColor: "rgba(9, 8, 23, 1);",
        flex: 1,
        paddingHorizontal: 20,
        justifyContent: "space-between",
      }}
    >
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
          />
          {/* <View style={{ width: 64, height: 64, backgroundColor: 'red' }} /> */}
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
                    {selectedCoin.name}
                  </Text>
                  <Text style={{ color: "#999CB6" }}>{selectedCoin.value}</Text>
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
            />
          </View>
        </View>
      </View>
      <Button flavor="blue" label="Next" />
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
            data={coins}
            renderItem={(props) => (
              <Coin
                {...props}
                selected={props.item.value === selectedCoin.value}
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
}

function Coin({ item, selected, onPress }) {
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
          <Text style={{ color: "#f6f5ff", fontWeight: "500" }}>
            {item.name}
          </Text>
          <Text
            style={{
              color: "#f6f5ff",
              fontWeight: "500",
              fontSize: 12,
              opacity: 0.6,
            }}
          >
            {item.value}
          </Text>
        </View>
      </View>
      <View style={{ alignItems: "flex-end" }}>
        <Text style={{ color: "#f6f5ff", fontWeight: "500" }}>
          ${item.balance * 100}
        </Text>
        <Text
          style={{
            color: "#f6f5ff",
            fontWeight: "500",
            fontSize: 12,
            opacity: 0.6,
          }}
        >
          {item.balance} {item.value}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
