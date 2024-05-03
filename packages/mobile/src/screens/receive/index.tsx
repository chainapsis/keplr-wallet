import React, { FunctionComponent } from "react";
import { useStyle } from "styles/index";
import { observer } from "mobx-react-lite";
import { useStore } from "stores/index";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { PageWithScrollView } from "components/page";
import { RouteProp, useRoute } from "@react-navigation/native";
import QRCode from "react-native-qrcode-svg";
import { SimpleCardView } from "components/new/card-view/simple-card";
import LottieView from "lottie-react-native";
import { useSimpleTimer } from "hooks/use-simple-timer";
import { CopyIcon } from "components/new/icon/copy-icon";
import { titleCase } from "utils/format/format";

export const ReceiveScreen: FunctionComponent = observer(() => {
  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          chainId?: string;
        }
      >,
      string
    >
  >();

  const { accountStore, chainStore } = useStore();

  const chainId = route.params.chainId
    ? route.params.chainId
    : chainStore.current.chainId;

  const account = accountStore.getAccount(chainId);
  const { isTimedOut, setTimer } = useSimpleTimer();

  const style = useStyle();

  return (
    <PageWithScrollView
      backgroundMode="image"
      contentContainerStyle={style.get("flex-grow-1")}
      style={style.flatten(["padding-x-page"]) as ViewStyle}
    >
      <View
        style={
          style.flatten([
            "padding-x-32",
            "padding-top-52",
            "padding-bottom-12",
          ]) as ViewStyle
        }
      >
        <Text
          style={
            style.flatten([
              "h3",
              "color-white",
              "font-semibold",
              "text-center",
              "margin-bottom-12",
            ]) as ViewStyle
          }
        >
          Deposit to your address to receive tokens
        </Text>
        <Text
          style={
            style.flatten([
              "h7",
              "color-platinum-100",
              "text-center",
            ]) as ViewStyle
          }
        >
          Scan to code or use the address below to copy your deposit address
        </Text>
      </View>
      <View style={style.flatten(["items-center", "margin-y-12"]) as ViewStyle}>
        {account.bech32Address ? (
          <View
            style={
              style.flatten([
                "padding-8",
                "background-color-white",
              ]) as ViewStyle
            }
          >
            <QRCode size={200} value={account.bech32Address} />
          </View>
        ) : (
          <View
            style={StyleSheet.flatten([
              {
                width: 200,
                height: 200,
              },
              style.flatten(["background-color-gray-400"]),
            ])}
          />
        )}
      </View>
      <TouchableOpacity
        onPress={async () => {
          await Clipboard.setStringAsync(account.bech32Address);
          setTimer(2000);
        }}
        activeOpacity={0.6}
      >
        <SimpleCardView
          heading={account.bech32Address}
          cardStyle={style.flatten(["margin-y-12"]) as ViewStyle}
          trailingIconComponent={
            isTimedOut ? (
              <View style={style.flatten(["margin-left-2"]) as ViewStyle}>
                <View
                  style={style.flatten(["width-20", "height-20"]) as ViewStyle}
                >
                  <View
                    style={StyleSheet.flatten([
                      style.flatten([
                        "absolute",
                        "justify-center",
                        "items-center",
                      ]),
                      {
                        left: 0,
                        right: 4,
                        top: 0,
                        bottom: 0,
                      },
                    ])}
                  >
                    <LottieView
                      // TODO: Change color of animated check button according to theme.
                      source={require("assets/lottie/check.json")}
                      colorFilters={[
                        {
                          keypath: "Shape Layer 2",
                          color: style.flatten([
                            "color-gray-200",
                            "dark:color-platinum-200",
                          ]).color,
                        },
                        {
                          keypath: "Shape Layer 1",
                          color: style.flatten([
                            "color-gray-300",
                            "dark:color-platinum-200",
                          ]).color,
                        },
                        {
                          keypath: "Layer 1 Outlines",
                          color: style.flatten(["color-white"]).color,
                        },
                      ]}
                      autoPlay
                      speed={2}
                      loop={false}
                      style={
                        style.flatten(["width-80", "height-80"]) as ViewStyle
                      }
                    />
                  </View>
                </View>
              </View>
            ) : (
              <CopyIcon size={18} />
            )
          }
        />
      </TouchableOpacity>
      <SimpleCardView
        heading={`Deposits must be using the ${titleCase(
          chainStore.current.chainName
        )} Network. Do not send token from other networks to this address or they may be lost.`}
        cardStyle={
          style.flatten([
            "background-color-coral-red@25%",
            "margin-top-12",
            "margin-bottom-48",
          ]) as ViewStyle
        }
      />
    </PageWithScrollView>
  );
});
