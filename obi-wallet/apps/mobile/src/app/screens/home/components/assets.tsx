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
import { SafeAreaView } from "react-native-safe-area-context";

import { formatCoin, useBalances } from "../../../balances";
import { IconButton } from "../../../button";
import Receive from "../assets/receive.svg";
import Send from "../assets/send.svg";

export type AssetsProps = BottomTabScreenProps<
  Record<string, { currentNetwork: string }>
>;

export function Assets({ route }: AssetsProps) {
  const { currentNetwork } = route.params;

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
          fontSize: 11,
          fontWeight: "600",
          marginBottom: 5,
        }}
      >
        Balance
      </Text>
      <Text style={{ color: "#F6F5FF", fontSize: 20, fontWeight: "500" }}>
        ${balanceInUsd.toFixed(2)}
      </Text>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          alignItems: "center",
          width: 200,
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
              fontSize: 11,
              fontWeight: "700",
              marginTop: 10,
              letterSpacing: 0.5,
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
            onPress={() => navigation.navigate("receive")}
          >
            <Receive width={22} height={22} />
          </TouchableHighlight>
          <Text
            style={{
              color: "#F6F5FF",
              fontSize: 11,
              fontWeight: "600",
              marginTop: 10,
              letterSpacing: 0.5,
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
        marginTop: 20,
        backgroundColor: "#100F1E", //////////////////////////////////
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingHorizontal: 16,
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
            height: 20,
            width: "100%",
            marginTop: 30,
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
                  marginRight: 5,
                }}
              />
              <FontAwesomeIcon
                icon={faSortDesc}
                style={{
                  color: sortAscending ? "#393853" : "#F6F5FF",
                  marginRight: 5,
                  marginTop: -15,
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
              marginTop: 15,
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
        height: 40,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
        marginHorizontal: 0,
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
          <Text style={{ color: "#F6F5FF", fontSize: 14, fontWeight: "500" }}>
            {label}
          </Text>
          <Text
            style={{
              color: "rgba(246, 245, 255, 0.6)",
              fontSize: 12,
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
              fontSize: 14,
              fontWeight: "500",
              textAlign: "right",
            }}
          >
            ${valueInUsd.toFixed(2)}
          </Text>
          <Text
            style={{
              color: "rgba(246, 245, 255, 0.6);",
              fontSize: 12,
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
