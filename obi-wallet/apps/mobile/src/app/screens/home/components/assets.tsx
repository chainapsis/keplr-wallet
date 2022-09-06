import { Coin } from "@cosmjs/stargate";
import { faAngleDoubleLeft } from "@fortawesome/free-solid-svg-icons/faAngleDoubleLeft";
import { faSortAsc } from "@fortawesome/free-solid-svg-icons/faSortAsc";
import { faSortDesc } from "@fortawesome/free-solid-svg-icons/faSortDesc";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { Text } from "@obi-wallet/common";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { useNavigation } from "@react-navigation/native";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import {
  FlatList,
  Image,
  ImageBackground,
  ListRenderItemInfo,
  TouchableHighlight,
  TouchableOpacity,
  View,
} from "react-native";
import { Dimensions, Platform, PixelRatio } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { formatCoin, useBalances } from "../../../balances";
import { IconButton } from "../../../button";
import Receive from "../assets/receive.svg";
import Send from "../assets/send.svg";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const scale = SCREEN_WIDTH / 428; // based on iphone 13 Pro Max's scale
export function responsive(size: number) {
  const newSize = size * scale;
  if (Platform.OS === "ios") {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  } else {
    return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
  }
}

export type AssetsProps = BottomTabScreenProps<
  Record<string, { currentNetwork: string }>
>;

export function Assets({ route }: AssetsProps) {
  const { currentNetwork } = route.params;

  return (
    <ImageBackground
      source={require("../assets/background.png")}
      resizeMode="cover"
      imageStyle={{ height: responsive(403) }}
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
        edges={["top", "left", "right"]}
      >
        <AssetsHeader currentNetwork={currentNetwork} />
        <BalanceAndActions />
        <AssetsList />
      </SafeAreaView>
    </ImageBackground>
  );
}

export function AssetsHeader({ currentNetwork }: { currentNetwork: string }) {
  const navigation =
    useNavigation<DrawerNavigationProp<Record<string, object>>>();

  const walletName = "dungeon_master";

  return (
    <View
      style={{
        padding: responsive(20),
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
          minWidth: responsive(100),
          paddingHorizontal: responsive(20),
          paddingVertical: responsive(10),
          borderRadius: responsive(8),
        }}
        onPress={() => navigation.openDrawer()}
      >
        <>
          <View style={{ alignItems: "center", justifyContent: "center" }}>
            <FontAwesomeIcon
              icon={faAngleDoubleLeft}
              style={{ color: "#7B87A8", marginLeft: responsive(5) }}
            />
          </View>
          <View
            style={{
              paddingHorizontal: responsive(20),
              justifyContent: "center",
              alignItems: "flex-start",
            }}
          >
            <Text
              style={{
                color: "rgba(246, 245, 255, 0.6)",
                fontSize: responsive(12),
                fontWeight: "600",
              }}
            >
              Network
            </Text>
            <Text style={{ color: "white" }}>{currentNetwork}</Text>
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
        <View style={{ margin: responsive(10) }}>
          <Text
            style={{
              color: "rgba(246, 245, 255, 0.6)",
              fontSize: responsive(12),
              fontWeight: "600",
              textAlign: "right",
            }}
          >
            Wallet Name
          </Text>
          <Text
            style={{
              color: "#F6F5FF",
              fontSize: responsive(14),
              fontWeight: "500",
              textAlign: "right",
            }}
          >
            {walletName.length > 14
              ? walletName.substring(0, 11) + "..."
              : walletName}
          </Text>
        </View>
        <Image
          source={require("../assets/backgroundblue.png")}
          style={{
            width: responsive(35),
            height: responsive(35),
            borderRadius: responsive(35),
          }}
        />
      </TouchableOpacity>
    </View>
  );
}

const BalanceAndActions = observer(() => {
  const balances = useBalances();
  const balanceInUsd = balances.reduce(
    (acc, coin) => acc + formatCoin(coin).valueInUsd,
    0
  );

  const navigation =
    useNavigation<DrawerNavigationProp<Record<string, object>>>();
  return (
    <View style={{ justifyContent: "center", alignItems: "center" }}>
      <Text
        style={{
          color: "#787B9C",
          fontSize: responsive(10),
          fontWeight: "600",
          marginBottom: responsive(5),
        }}
      >
        Balance
      </Text>
      <Text
        style={{
          color: "#F6F5FF",
          fontSize: responsive(20),
          fontWeight: "500",
        }}
      >
        $ {balanceInUsd.toFixed(2)}
      </Text>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          alignItems: "center",
          width: responsive(200),
          marginTop: responsive(36),
        }}
      >
        <View style={{ alignItems: "center" }}>
          <TouchableHighlight
            style={{
              width: responsive(56),
              height: responsive(56),
              backgroundColor: "#100F1E",
              borderRadius: responsive(16),
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={() => navigation.navigate("send")}
          >
            <Send width={responsive(22)} height={responsive(22)} />
          </TouchableHighlight>
          <Text
            style={{
              // Different color in comparison to "Recieve" to avoid optical illusion (looks less bold/smaller)
              color: "#FFFFFF",
              fontSize: responsive(10),
              fontWeight: "600",
              marginTop: responsive(10),
              letterSpacing: responsive(0.5),
            }}
          >
            SEND
          </Text>
        </View>
        <View style={{ alignItems: "center" }}>
          <TouchableHighlight
            style={{
              width: responsive(56),
              height: responsive(56),
              backgroundColor: "#100F1E",
              borderRadius: responsive(16),
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={() => navigation.navigate("receive")}
          >
            <Receive width={responsive(22)} height={responsive(22)} />
          </TouchableHighlight>
          <Text
            style={{
              color: "#F6F5FF",
              fontSize: responsive(10),
              fontWeight: "600",
              marginTop: responsive(10),
              letterSpacing: responsive(0.5),
            }}
          >
            RECEIVE
          </Text>
        </View>
        {/*<View style={{ alignItems: "center" }}>*/}
        {/*  <TouchableHighlight*/}
        {/*    style={{*/}
        {/*      width: 56,*/}
        {/*      height: 56,*/}
        {/*      backgroundColor: "#100F1E",*/}
        {/*      borderRadius: 16,*/}
        {/*      justifyContent: "center",*/}
        {/*      alignItems: "center",*/}
        {/*    }}*/}
        {/*  >*/}
        {/*    <Pay width={22} height={22} />*/}
        {/*  </TouchableHighlight>*/}
        {/*  <Text*/}
        {/*    style={{*/}
        {/*      color: "#F6F5FF",*/}
        {/*      fontSize: 9,*/}
        {/*      fontWeight: "500",*/}
        {/*      marginTop: 10,*/}
        {/*    }}*/}
        {/*  >*/}
        {/*    PAY*/}
        {/*  </Text>*/}
        {/*</View>*/}
      </View>
    </View>
  );
});

const AssetsList = observer(() => {
  const [sortAscending, setSortAscending] = useState(true);
  const [...balances] = useBalances();
  balances.sort((a, b) => {
    const [first, second] = sortAscending ? [b, a] : [a, b];
    return formatCoin(first).valueInUsd - formatCoin(second).valueInUsd;
  });

  return (
    <View
      style={{
        flexGrow: 1,
        flexDirection: "row",
        justifyContent: "center",
        marginTop: responsive(20),
        backgroundColor: "#100F1E", //////////////////////////////////
        borderTopLeftRadius: responsive(30),
        borderTopRightRadius: responsive(30),
        paddingHorizontal: responsive(16),
      }}
    >
      <View
        style={{
          width: "97%",
          //backgroundColor: "red", //////////////////////////////////////////
        }}
      >
        <View
          style={{
            height: responsive(20),
            width: "100%",
            marginTop: responsive(30),
            flexDirection: "row",
            justifyContent: "space-between",
            //backgroundColor: "pink" //////////////////////////////////////////
          }}
        >
          <Text style={{ color: "#787B9C" }}>NAME</Text>
          <View style={{ flexDirection: "row" }}>
            <IconButton
              style={{ justifyContent: "center" }}
              onPress={() => {
                setSortAscending((value) => !value);
              }}
            >
              <FontAwesomeIcon
                icon={faSortAsc}
                style={{
                  color: sortAscending ? "#F6F5FF" : "#393853",
                  marginRight: responsive(5),
                }}
              />
              <FontAwesomeIcon
                icon={faSortDesc}
                style={{
                  color: sortAscending ? "#393853" : "#F6F5FF",
                  marginRight: responsive(5),
                  marginTop: responsive(-15),
                }}
              />
            </IconButton>
            <Text style={{ color: "#787B9C" }}>HOLDINGS</Text>
          </View>
        </View>

        <View>
          <FlatList
            keyExtractor={(coin) => coin.denom}
            data={balances}
            renderItem={(props) => <AssetsListItem {...props} />}
            style={{
              marginTop: responsive(15),
              //backgroundColor: "red", ///////////////////////////////////////////////
            }}
          />
        </View>
      </View>
    </View>
  );
});

function AssetsListItem({ item }: ListRenderItemInfo<Coin>) {
  const { icon, denom, label, amount, valueInUsd } = formatCoin(item);

  return (
    <View
      style={{
        height: responsive(40),
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: responsive(10),
        marginHorizontal: responsive(0),
        //backgroundColor: "blue",  ////////////////////////////
      }}
    >
      {icon}
      <View
        style={{
          flex: 1,
          height: "100%",
          flexDirection: "row",
          justifyContent: "space-between",
          //paddingLeft: 0,
          //backgroundColor: "green" //////////////////////////////////////////
        }}
      >
        <View>
          <Text
            style={{
              color: "#F6F5FF",
              fontSize: responsive(14),
              fontWeight: "500",
            }}
          >
            {label}
          </Text>
          <Text
            style={{
              color: "rgba(246, 245, 255, 0.6)",
              fontSize: responsive(12),
              fontWeight: "400",
            }}
          >
            {denom}
          </Text>
        </View>
        <View>
          <Text
            style={{
              color: "#F6F5FF",
              fontSize: responsive(14),
              fontWeight: "500",
              textAlign: "right",
            }}
          >
            $ {valueInUsd.toFixed(2)}
          </Text>
          <Text
            style={{
              color: "rgba(246, 245, 255, 0.6);",
              fontSize: responsive(12),
              fontWeight: "400",
              textAlign: "right",
            }}
          >
            {amount} {denom}
          </Text>
        </View>
      </View>
    </View>
  );
}
