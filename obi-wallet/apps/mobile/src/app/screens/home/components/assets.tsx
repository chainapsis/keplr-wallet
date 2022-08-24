import { faAngleDoubleLeft } from "@fortawesome/free-solid-svg-icons/faAngleDoubleLeft";
import { faSortAsc } from "@fortawesome/free-solid-svg-icons/faSortAsc";
import { faSortDesc } from "@fortawesome/free-solid-svg-icons/faSortDesc";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { Text } from "@obi-wallet/common";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { useNavigation } from "@react-navigation/native";
import {
  FlatList,
  Image,
  ImageBackground,
  TouchableHighlight,
  View,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Pay from "../assets/pay.svg";
import Receive from "../assets/receive.svg";
import Send from "../assets/send.svg";

export function Assets() {
  return (
    <ImageBackground
      source={require("../assets/background.png")}
      resizeMode="cover"
      imageStyle={{ height: 403 }}
      style={{
        backgroundColor: "#090817",
        flex: 1,
      }}
    >
      <SafeAreaView
        style={{
          flex: 1,
          flexGrow: 1,
        }}
      >
        <AssetsHeader />
        <BalanceAndActions />
        <AssetsList />
      </SafeAreaView>
    </ImageBackground>
  );
}

export function AssetsHeader() {
  const navigation =
    useNavigation<DrawerNavigationProp<Record<string, object>>>();
  return (
    <View
      style={{
        padding: 20,
        flexDirection: "row",
        justifyContent: "space-between",
      }}
    >
      <TouchableHighlight
        style={{
          backgroundColor: "#16152D",
          alignSelf: "flex-start",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          minWidth: 100,
          paddingHorizontal: 20,
          paddingVertical: 10,
          borderRadius: 8,
        }}
        onPress={() => navigation.openDrawer()}
      >
        <>
          <View style={{ alignItems: "center", justifyContent: "center" }}>
            <FontAwesomeIcon
              icon={faAngleDoubleLeft}
              style={{ color: "#7B87A8", marginLeft: 5 }}
            />
          </View>
          <View
            style={{
              paddingHorizontal: 20,
              justifyContent: "center",
              alignItems: "flex-start",
            }}
          >
            <Text
              style={{
                color: "rgba(246, 245, 255, 0.6)",
                fontSize: 12,
                fontWeight: "600",
              }}
            >
              Network
            </Text>
            <Text style={{ color: "white" }}>Juno</Text>
          </View>
        </>
      </TouchableHighlight>

      <TouchableOpacity
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
        }}
        onPress={() => navigation.navigate("AccountsSettings")}
      >
        <View style={{ margin: 10 }}>
          <Text
            style={{
              color: "rgba(246, 245, 255, 0.6)",
              fontSize: 12,
              fontWeight: "600",
              textAlign: "right",
            }}
          >
            Wallet name
          </Text>
          <Text
            style={{
              color: "#F6F5FF",
              fontSize: 14,
              fontWeight: "500",
              textAlign: "right",
            }}
          >
            dungeon_master
          </Text>
        </View>
        <Image
          source={require("../assets/backgroundblue.png")}
          style={{ width: 35, height: 35, borderRadius: 35 }}
        />
      </TouchableOpacity>
    </View>
  );
}

function BalanceAndActions() {
  const navigation =
    useNavigation<DrawerNavigationProp<Record<string, object>>>();
  return (
    <View style={{ justifyContent: "center", alignItems: "center" }}>
      <Text style={{ color: "#787B9C", fontSize: 11, fontWeight: "500" }}>
        Balance
      </Text>
      <Text style={{ color: "#F6F5FF", fontSize: 20, fontWeight: "500" }}>
        $38,166.92
      </Text>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          alignItems: "center",
          width: "70%",
          marginTop: 36,
        }}
      >
        <View style={{ alignItems: "center" }}>
          <TouchableHighlight
            style={{
              width: 56,
              height: 56,
              backgroundColor: "#100F1E",
              borderRadius: 16,
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={() => navigation.navigate("send")}
          >
            <Send width={22} height={22} />
          </TouchableHighlight>
          <Text
            style={{
              color: "#F6F5FF",
              fontSize: 9,
              fontWeight: "500",
              marginTop: 10,
            }}
          >
            SEND
          </Text>
        </View>
        <View style={{ alignItems: "center" }}>
          <TouchableHighlight
            style={{
              width: 56,
              height: 56,
              backgroundColor: "#100F1E",
              borderRadius: 16,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Receive width={22} height={22} />
          </TouchableHighlight>
          <Text
            style={{
              color: "#F6F5FF",
              fontSize: 9,
              fontWeight: "500",
              marginTop: 10,
            }}
          >
            RECEIVE
          </Text>
        </View>
        <View style={{ alignItems: "center" }}>
          <TouchableHighlight
            style={{
              width: 56,
              height: 56,
              backgroundColor: "#100F1E",
              borderRadius: 16,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Pay width={22} height={22} />
          </TouchableHighlight>
          <Text
            style={{
              color: "#F6F5FF",
              fontSize: 9,
              fontWeight: "500",
              marginTop: 10,
            }}
          >
            PAY
          </Text>
        </View>
      </View>
    </View>
  );
}

function AssetsList() {
  return (
    <View
      style={{
        flexGrow: 1,
        marginTop: 20,
        backgroundColor: "#100F1E",
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingHorizontal: 16,
      }}
    >
      <View
        style={{
          height: 20,
          width: "100%",
          marginTop: 30,
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <Text style={{ color: "#787B9C" }}>NAME</Text>
        <View style={{ flexDirection: "row" }}>
          <Text style={{ color: "#787B9C" }}>HOLDINGS</Text>
          <View style={{ justifyContent: "center" }}>
            <FontAwesomeIcon
              icon={faSortAsc}
              style={{ color: "#F6F5FF", marginLeft: 5 }}
            />
            <FontAwesomeIcon
              icon={faSortDesc}
              style={{ color: "#393853", marginLeft: 5, marginTop: -15 }}
            />
          </View>
        </View>
      </View>
      <View>
        <FlatList
          data={[
            { key: "1" },
            { key: "21" },
            { key: "22" },
            { key: "23" },
            { key: "24" },
            { key: "25" },
            { key: "28" },
            { key: "27" },
            { key: "12" },
            { key: "62" },
            { key: "32" },
            { key: "42" },
          ]}
          renderItem={() => <AssetsListItem />}
        />
      </View>
    </View>
  );
}

function AssetsListItem() {
  return (
    <View
      style={{
        height: 40,
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
      }}
    >
      <Image
        source={require("../assets/backgroundblue.png")}
        style={{ width: 36, height: 36, borderRadius: 12 }}
      />
      <View
        style={{
          flex: 1,
          height: "100%",
          flexDirection: "row",
          justifyContent: "space-between",
          paddingLeft: 5,
        }}
      >
        <View>
          <Text style={{ color: "#F6F5FF", fontSize: 14, fontWeight: "500" }}>
            Bitcoin
          </Text>
          <Text
            style={{
              color: "rgba(246, 245, 255, 0.6)",
              fontSize: 12,
              fontWeight: "400",
            }}
          >
            BTC
          </Text>
        </View>
        <View>
          <Text
            style={{
              color: "#F6F5FF",
              fontSize: 14,
              fontWeight: "500",
              textAlign: "right",
            }}
          >
            $575,727,276
          </Text>
          <Text
            style={{
              color: "rgba(246, 245, 255, 0.6);",
              fontSize: 12,
              fontWeight: "400",
              textAlign: "right",
            }}
          >
            0.0034 BTC
          </Text>
        </View>
      </View>
    </View>
  );
}
