import { faAngleDoubleLeft } from "@fortawesome/free-solid-svg-icons/faAngleDoubleLeft";
import { faSortAsc } from "@fortawesome/free-solid-svg-icons/faSortAsc";
import { faSortDesc } from "@fortawesome/free-solid-svg-icons/faSortDesc";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { Text } from "@obi-wallet/common";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { FormattedMessage } from "react-intl";
import {
  FlatList,
  ImageBackground,
  ListRenderItemInfo,
  RefreshControl,
  TouchableHighlight,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  ExtendedCoin,
  formatExtendedCoin,
  useBalances,
} from "../../../balances";
import { IconButton } from "../../../button";
import { RootStackParamList } from "../../../root-stack";
import { useStore } from "../../../stores";
import { CoinIcon } from "../../components/coin-icon";
import {
  isSmallScreenNumber,
  isSmallScreenSubstr,
} from "../../components/screen-size";
import ObiLogo from "../../settings/assets/obi-logo.svg";
import Receive from "../assets/receive.svg";
import Send from "../assets/send.svg";

export const Assets = observer(function Assets() {
  const { chainStore } = useStore();
  const currentNetwork = chainStore.currentChainInformation.label;

  return (
    <ImageBackground
      source={require("../assets/background.png")}
      resizeMode="cover"
      imageStyle={{
        height: 403,
        marginTop: isSmallScreenNumber(0, 60),
      }}
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
});

export function AssetsHeader({ currentNetwork }: { currentNetwork: string }) {
  const navigation =
    useNavigation<DrawerNavigationProp<Record<string, object>>>();

  const walletName = "My Obi Wallet";

  return (
    <View
      style={{
        padding: 16,
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
          paddingHorizontal: 13,
          paddingVertical: 10,
          borderRadius: 8,
        }}
        onPress={() => navigation.openDrawer()}
      >
        <>
          <View style={{ alignItems: "center", justifyContent: "center" }}>
            <FontAwesomeIcon
              icon={faAngleDoubleLeft}
              style={{ color: "#7B87A8" }}
            />
          </View>
          <View
            style={{
              paddingLeft: 10,
              justifyContent: "center",
              alignItems: "flex-start",
            }}
          >
            <Text
              style={{
                color: "rgba(246, 245, 255, 0.6)",
                fontSize: 9,
                fontWeight: "500",
              }}
            >
              <FormattedMessage id="assets.network" defaultMessage="Network" />
            </Text>
            <Text style={{ color: "#F6F5FF", fontSize: 14 }}>
              {isSmallScreenSubstr(currentNetwork, "...", 15, 16)}
            </Text>
          </View>
        </>
      </TouchableHighlight>

      {/** <TouchableOpacity  // Disabled navigation due to decision - account-screen should not be accessable currently */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
        }}
        // Disabled navigation due to decision - account-screen should not be accessible currently
        // onPress={() => navigation.navigate("AccountsSettings")}
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
            <FormattedMessage
              id="assets.walletname"
              defaultMessage="Wallet name"
            />
          </Text>
          <Text
            style={{
              color: "#F6F5FF",
              fontSize: 14,
              fontWeight: "500",
              textAlign: "right",
            }}
          >
            {isSmallScreenSubstr(walletName, "...", 15, 18)}
          </Text>
        </View>
        <TouchableOpacity
          style={{
            borderRadius: 17.5,
            backgroundColor: "#ffffff",
          }}
        >
          <ObiLogo
            style={{
              width: 35,
              height: 35,
            }}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const BalanceAndActions = observer(() => {
  const { balances } = useBalances();
  const balanceInUsd = balances.reduce(
    (acc, coin) => acc + formatExtendedCoin(coin).valueInUsd,
    0
  );

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  return (
    <View
      style={{
        justifyContent: "center",
        alignItems: "center",
        marginTop: isSmallScreenNumber(5, 15),
      }}
    >
      <Text
        style={{
          color: "#787B9C",
          fontSize: 11,
          fontWeight: "500",
          marginBottom: 10,
          textTransform: "uppercase",
          letterSpacing: 0.7,
        }}
      >
        <FormattedMessage id="assets.balance" defaultMessage="Balance" />
      </Text>

      <View
        style={{
          flexDirection: "row",
        }}
      >
        <Text
          style={{
            color: "#F6F5FF",
            fontSize: 20,
            fontWeight: "500",
            alignSelf: "flex-end",
            marginBottom: 2,
          }}
        >
          $
        </Text>
        <Text
          style={{
            color: "#F6F5FF",
            fontSize: 28,
            fontWeight: "500",
          }}
        >
          {balanceInUsd.toFixed(2).split(".")[0]}.
        </Text>
        <Text
          style={{
            color: "#F6F5FF",
            fontSize: 28,
            fontWeight: "normal",
          }}
        >
          {balanceInUsd.toFixed(2).split(".")[1]}
        </Text>
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          alignItems: "center",
          width: 200,
          marginTop: isSmallScreenNumber(10, 36),
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
            <Send width={25} height={25} />
          </TouchableHighlight>
          <Text
            style={{
              color: "#F6F5FF",
              fontSize: 9,
              fontWeight: "500",
              marginTop: 10,
              letterSpacing: 0.09,
              textTransform: "uppercase",
            }}
          >
            <FormattedMessage id="assets.send" defaultMessage="Send" />
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
            <Receive width={25} height={25} />
          </TouchableHighlight>
          <Text
            style={{
              color: "#F6F5FF",
              fontSize: 9,
              fontWeight: "500",
              marginTop: 10,
              letterSpacing: 0.09,
              textTransform: "uppercase",
            }}
          >
            <FormattedMessage id="assets.receive" defaultMessage="Receive" />
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
        {/*      letterSpacing: 0.09,*/}
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
  const {
    balances: unsortedBalances,
    refreshBalances,
    refreshing,
  } = useBalances();
  const balances = [...unsortedBalances];
  balances.sort((a, b) => {
    const [first, second] = sortAscending ? [b, a] : [a, b];
    return (
      formatExtendedCoin(first).valueInUsd -
      formatExtendedCoin(second).valueInUsd
    );
  });

  return (
    <View
      style={{
        flexGrow: 1,
        flexDirection: "row",
        justifyContent: "center",
        marginTop: isSmallScreenNumber(20, 40),
        backgroundColor: "#100F1E",
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingHorizontal: 16,
      }}
    >
      <View
        style={{
          width: "100%",
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
          <Text
            style={{
              color: "#787B9C",
              fontSize: 11,
              letterSpacing: 0.7,
              textTransform: "uppercase",
            }}
          >
            <FormattedMessage id="assets.name" defaultMessage="Name" />
          </Text>
          <View
            style={{
              flexDirection: "row",
            }}
          >
            <Text
              style={{
                color: "#787B9C",
                fontSize: 11,
                letterSpacing: 0.7,
                textTransform: "uppercase",
              }}
            >
              <FormattedMessage
                id="assets.holdings"
                defaultMessage="Holdings"
              />
            </Text>
            <IconButton
              style={{ justifyContent: "center", marginBottom: 5 }}
              onPress={() => {
                setSortAscending((value) => !value);
              }}
            >
              <FontAwesomeIcon
                icon={faSortAsc}
                style={{
                  color: sortAscending ? "#F6F5FF" : "#393853",
                  marginLeft: 12,
                }}
              />
              <FontAwesomeIcon
                icon={faSortDesc}
                style={{
                  color: sortAscending ? "#393853" : "#F6F5FF",
                  marginLeft: 12,
                  marginTop: -15,
                }}
              />
            </IconButton>
          </View>
        </View>

        <FlatList
          keyExtractor={(coin) => coin.denom}
          data={balances}
          renderItem={(props) => <AssetsListItem {...props} />}
          style={{
            marginTop: 28,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refreshBalances}
              tintColor="white"
            />
          }
        />
      </View>
    </View>
  );
});

function AssetsListItem({ item }: ListRenderItemInfo<ExtendedCoin>) {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const onTouchAsset = (amount: number) => {
    if (Number(amount) > 0) {
      navigation.navigate("send");
    } else {
      navigation.navigate("receive");
    }
  };

  const { icon, denom, label, amount, valueInUsd } = formatExtendedCoin(item);
  const coinIconProps =
    typeof icon === "number" ? { imageIcon: icon } : { SVGIcon: icon };
  return (
    <View
      style={{
        height: 36,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 28,
      }}
    >
      <TouchableOpacity onPress={async () => onTouchAsset(amount)}>
        <View
          style={{
            height: 36,
            width: 36,
            backgroundColor: icon ? "transparent" : "#ccc",
            borderRadius: 10,
            marginRight: 12,
          }}
        >
          <CoinIcon {...coinIconProps} />
        </View>
      </TouchableOpacity>
      <View
        style={{
          flex: 1,
          height: "100%",
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <View>
          <TouchableOpacity onPress={async () => onTouchAsset(amount)}>
            <Text style={{ color: "#F6F5FF", fontSize: 14, fontWeight: "500" }}>
              {isSmallScreenSubstr(label, "...", 23, 30)}
            </Text>
            <Text
              style={{
                color: "rgba(246, 245, 255, 0.6)",
                fontSize: 12,
                fontWeight: "400",
                marginTop: 4,
              }}
            >
              {denom}
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={{
            flexDirection: "column",
            alignItems: "flex-end",
          }}
        >
          <View
            style={{
              flexDirection: "row",
            }}
          >
            <Text
              style={{
                color: "#F6F5FF",
                fontSize: 12,
                fontWeight: "500",
                marginTop: 3,
                textAlign: "right",
              }}
            >
              $
            </Text>
            <Text
              style={{
                color: "#F6F5FF",
                fontSize: 14,
                fontWeight: "500",
                textAlign: "right",
              }}
            >
              {valueInUsd.toFixed(2).split(".")[0]}.
            </Text>
            <Text
              style={{
                color: "#F6F5FF",
                fontSize: 14,
                fontWeight: "normal",
                textAlign: "right",
              }}
            >
              {valueInUsd.toFixed(2).split(".")[1]}
            </Text>
          </View>

          <Text
            style={{
              color: "rgba(246, 245, 255, 0.6);",
              fontSize: 12,
              fontWeight: "400",
              textAlign: "right",
              marginTop: 4,
            }}
          >
            {amount} {denom}
          </Text>
        </View>
      </View>
    </View>
  );
}
