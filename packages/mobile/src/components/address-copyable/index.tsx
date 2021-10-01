import React, { FunctionComponent } from "react";
import { StyleSheet, Text, ViewStyle, View } from "react-native";
import { useStyle } from "../../styles";
import { Bech32Address } from "@keplr-wallet/cosmos";
import Clipboard from "expo-clipboard";
import { RectButton } from "../rect-button";
import { CopyIcon } from "../icon";
import { useSimpleTimer } from "../../hooks";
import LottieView from "lottie-react-native";
import { useStore } from "../../stores";

export const AddressCopyable: FunctionComponent<{
  style?: ViewStyle;
  address: string;
  maxCharacters: number;
}> = ({ style: propStyle, address, maxCharacters }) => {
  const style = useStyle();
  const { analyticsStore, chainStore } = useStore();
  const { isTimedOut, setTimer } = useSimpleTimer();

  return (
    <RectButton
      style={StyleSheet.flatten([
        style.flatten([
          "padding-left-12",
          "padding-right-8",
          "padding-y-2",
          "border-radius-12",
          "background-color-primary-10",
          "flex-row",
          "items-center",
        ]),
        propStyle,
      ])}
      onPress={() => {
        analyticsStore.logEvent("Address copied", {
          chainId: chainStore.current.chainId,
          chainName: chainStore.current.chainName,
        });
        Clipboard.setString(address);
        setTimer(2000);
      }}
      rippleColor={style.get("color-button-primary-outline-ripple").color}
      underlayColor={style.get("color-button-primary-outline-underlay").color}
      activeOpacity={1}
    >
      <Text style={style.flatten(["subtitle3", "color-primary-400"])}>
        {Bech32Address.shortenAddress(address, maxCharacters)}
      </Text>
      <View style={style.flatten(["margin-left-4", "width-20"])}>
        {isTimedOut ? (
          <View style={style.flatten(["margin-left-2"])}>
            <View style={style.flatten(["width-20", "height-20"])}>
              <View
                style={StyleSheet.flatten([
                  style.flatten(["absolute", "justify-center", "items-center"]),
                  {
                    left: 0,
                    right: 4,
                    top: 0,
                    bottom: 0,
                  },
                ])}
              >
                <LottieView
                  source={require("../../assets/lottie/check.json")}
                  autoPlay
                  speed={2}
                  loop={false}
                  style={style.flatten(["width-58", "height-58"])}
                />
              </View>
            </View>
          </View>
        ) : (
          <CopyIcon color={style.get("color-primary").color} size={19} />
        )}
      </View>
    </RectButton>
  );
};
