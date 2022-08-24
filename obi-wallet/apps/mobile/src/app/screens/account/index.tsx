import { faCheckCircle } from "@fortawesome/free-solid-svg-icons/faCheckCircle";
import { faGear } from "@fortawesome/free-solid-svg-icons/faGear";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet/src";
import { Text } from "@obi-wallet/common";
import { useRef, useState } from "react";
import {
  FlatList,
  Image,
  ImageBackground,
  TouchableHighlight,
  View,
} from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import LinearGradient from "react-native-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Back } from "../components/back";
import { Background } from "../components/background";
import { BottomSheetBackdrop } from "../components/bottomSheetBackdrop";
import { useNavigation } from "../settings/stack";
import InheritanceIcon from "./assets/inheritanceIcon.svg";
import SpendingIcon from "./assets/spendingIcon.svg";
import { Inheritance } from "./inheritance";
import { Spending } from "./spending";

export function Account() {
  const safeArea = useSafeAreaInsets();
  const navigation = useNavigation();
  const refBottomSheet = useRef(null);
  const [SelectedMenu, setSelectedMenu] = useState("");

  const triggerBottomSheet = (selection) => {
    if (!selection) {
      refBottomSheet.current.close();
    } else {
      setSelectedMenu(selection.name);
      refBottomSheet.current.snapToIndex(0);
    }
  };
  const renderSelectionContent = () => {
    switch (SelectedMenu) {
      case "spending":
        return <Spending />;
      case "inheritance":
        return <Inheritance />;
    }
  };

  return (
    <View style={{ flex: 1, paddingHorizontal: 20, position: "relative" }}>
      <Background />
      <View style={{ flexDirection: "row", top: safeArea.top }}>
        <Back style={{ zIndex: 2 }} />
        <Text
          style={{
            fontSize: 14,
            fontWeight: "600",
            color: "#F6F5FF",
            textAlign: "center",
            flex: 1,
            marginLeft: -16,
          }}
        >
          Account
        </Text>
      </View>
      <View
        style={{
          height: 165,
          marginTop: safeArea.top + 34,
          backgroundColor: "#1C0C3F",
          borderRadius: 16,
        }}
      >
        <ImageBackground
          source={require("./assets/accountbg.png")}
          style={{ flex: 1, padding: 20, position: "relative" }}
          resizeMode="cover"
          borderRadius={16}
        >
          {/* <TouchableHighlight
            style={{
              position: "absolute",
              top: 20,
              right: 20,
              backgroundColor: "rgba(255,255,255,.12)",
              padding: 5,
              borderRadius: 20,
            }}
          >
            <FontAwesomeIcon icon={faGear} style={{ color: "#F6F5FF" }} />
          </TouchableHighlight> */}
          <Text
            style={{
              color: "#787B9C",
              marginTop: 8,
              fontSize: 11,
              fontWeight: "500",
            }}
          >
            BALANCE
          </Text>
          <Text
            style={{
              color: "#F6F5FF",
              marginTop: 10,
              fontSize: 20,
              fontWeight: "500",
            }}
          >
            $38,166.92
          </Text>
          {/* <TouchableHighlight
            style={{
              height: 29,
              backgroundColor: "rgba(255,255,255,.12)",
              alignSelf: "flex-start",
              justifyContent: "center",
              paddingHorizontal: 20,
              borderRadius: 40,
              marginTop: 40,
            }}
            onPress={() => {
              navigation.navigate("AddSubAccount");
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: "500", color: "white" }}>
              +Add sub-account
            </Text>
          </TouchableHighlight> */}
        </ImageBackground>
      </View>
      <View
        style={{
          backgroundColor: "#16152D",
          marginTop: 34,
          borderRadius: 12,
          padding: 20,
        }}
      >
        <View style={{ flexDirection: "row" }}>
          <Image
            source={require("./assets/avatars/avatars-3.png")}
            style={{ height: 42, width: 42, borderRadius: 42 }}
          />
          <View style={{ paddingLeft: 10, flex: 1 }}>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text
                style={{ color: "#F6F5FF", fontSize: 14, fontWeight: "500" }}
              >
                $4,582
              </Text>
              {/* <FontAwesomeIcon
                icon={faCheckCircle}
                style={{ width: 16, height: 16, color: "#7AD6AE" }}
              /> */}
            </View>
            <Text
              style={{
                color: "rgba(246, 245, 255, 0.6);",
                fontSize: 12,
                fontWeight: "400",
              }}
            >
              dungeon_master
            </Text>
          </View>
        </View>
        <View>
          <View
            style={{
              height: 6,
              backgroundColor: "#1E1D3A",
              borderRadius: 4,
              marginTop: 20,
              marginBottom: 8,
            }}
          >
            <LinearGradient
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              colors={["#FCCFF7", "#E659D6", "#8877EA", "#86E2EE", "#1E1D3A"]}
              style={{ flex: 1, width: "60%", borderRadius: 4 }}
            />
          </View>
          <View
            style={{ justifyContent: "space-between", flexDirection: "row" }}
          >
            <Text
              style={{
                fontSize: 11,
                fontWeight: "400",
                color: "rgba(246, 245, 255, 0.6);",
              }}
            >
              Daily Balance
            </Text>
            <View style={{ flexDirection: "row" }}>
              <Text
                style={{ fontSize: 11, fontWeight: "400", color: "#f6f5ff" }}
              >
                $80
              </Text>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "400",
                  color: "#f6f5ff",
                  opacity: 0.6,
                }}
              >
                /100
              </Text>
            </View>
          </View>
          <View>
            <FlatList
              data={options}
              horizontal
              renderItem={(props) => (
                <Option
                  item={props.item}
                  onPress={() => triggerBottomSheet(props.item)}
                />
              )}
              style={{ marginTop: 20 }}
            />
          </View>
        </View>
      </View>

      <View
        style={{
          flex: 3,
          justifyContent: "flex-end",
          paddingBottom: 20,
          marginBottom: safeArea.bottom / 2,
          marginTop: 10,
        }}
      >
        {/* <FlatList
          data={[
            { key: "1", amount: 231, name: "My_personal_wallet" },
            { key: "2", amount: 8293, name: "Hot_wallet" },
            { key: "3", amount: 8293, name: "Captain_Private" },
            { key: "4", amount: 8293, name: "other_one" },
          ]}
          renderItem={({ item }) => {
            const images = [
              require("./assets/avatars/avatars-1.png"),
              require("./assets/avatars/avatars-2.png"),
              require("./assets/avatars/avatars-3.png"),
              require("./assets/avatars/avatars-4.png"),
            ];

            return (
              <View
                style={{
                  backgroundColor: "#0F0E20",
                  borderRadius: 12,
                  marginVertical: 10,
                  flexDirection: "row",
                  padding: 20,
                  flex: 1,
                }}
              >
                <Image
                  source={images[Number(item.key) - 1]}
                  style={{ height: 42, width: 42, borderRadius: 42 }}
                />
                <View style={{ paddingLeft: 10, flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "400",
                      color: "#f6f5ff",
                    }}
                  >
                    {item.amount}
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "400",
                      color: "rgba(246, 245, 255, 0.6);",
                    }}
                  >
                    {item.name}
                  </Text>
                </View>
                <View style={{ justifyContent: "center" }}>
                  <View
                    style={{
                      width: 16,
                      height: 16,
                      borderColor: "rgba(255,255,255,.4)",
                      borderWidth: 1,
                      borderRadius: 16,
                    }}
                  ></View>
                </View>
              </View>
            );
          }}
        /> */}
      </View>
      <BottomSheetBackdrop
        onPress={() => triggerBottomSheet(false)}
        visible={Boolean(SelectedMenu)}
      />
      <BottomSheet
        handleIndicatorStyle={{ backgroundColor: "white" }}
        backgroundStyle={{ backgroundColor: "#100F1E" }}
        handleStyle={{ backgroundColor: "transparent" }}
        snapPoints={SelectedMenu === "inheritance" ? ["70%"] : ["40"]}
        enablePanDownToClose={true}
        ref={refBottomSheet}
        index={-1}
        backdropComponent={(props) => null}
        onClose={() => setSelectedMenu("")}
      >
        <BottomSheetView
          style={{
            flex: 1,
            backgroundColor: "transparent",
            position: "relative",
          }}
        >
          {renderSelectionContent()}
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}
const options = [
  {
    key: 0,
    name: "spending",
    icon: SpendingIcon,
  },
  // {
  //   key: 1,
  //   name: "inheritance",
  //   icon: InheritanceIcon,
  // },
];

function Option({ item, onPress }) {
  console.log({ item });
  return (
    <TouchableOpacity
      style={{ height: 60, justifyContent: "center", alignItems: "center" }}
      onPress={onPress}
    >
      <>
        <item.icon
          style={{
            width: 40,
            height: 40,

            marginHorizontal: 10,
            marginBottom: 10,
          }}
        />
        <Text style={{ fontSize: 12, color: "white", opacity: 0.6 }}>
          {item.name}
        </Text>
      </>
    </TouchableOpacity>
  );
}
