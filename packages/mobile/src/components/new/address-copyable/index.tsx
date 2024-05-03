import React, { FunctionComponent } from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import { useStyle } from "styles/index";
import { Bech32Address } from "@keplr-wallet/cosmos";
import * as Clipboard from "expo-clipboard";
import { RectButton } from "components/rect-button";
import LottieView from "lottie-react-native";
import { useSimpleTimer } from "hooks/use-simple-timer";
import { CopyIcon } from "components/new/icon/copy-icon";

export const AddressCopyable: FunctionComponent<{
  style?: ViewStyle;
  address: string;
  maxCharacters: number;
}> = ({ style: propStyle, address, maxCharacters }) => {
  const style = useStyle();
  const { isTimedOut, setTimer } = useSimpleTimer();

  return (
    <RectButton
      style={StyleSheet.flatten([
        style.flatten(["flex-row", "items-center"]) as ViewStyle,
        propStyle,
      ])}
      onPress={async () => {
        await Clipboard.setStringAsync(address);
        setTimer(2000);
      }}
      rippleColor={style.flatten(["color-white-transparent-100"]).color}
      underlayColor={style.flatten(["color-gray-300"]).color}
      activeOpacity={0.2}
    >
      <Text style={style.flatten(["body3", "color-white@60%"]) as ViewStyle}>
        {Bech32Address.shortenAddress(address, maxCharacters)}
      </Text>
      <View style={style.flatten(["margin-left-4", "width-20"]) as ViewStyle}>
        {isTimedOut ? (
          <View style={style.flatten(["margin-left-2"]) as ViewStyle}>
            <View style={style.flatten(["width-20", "height-20"]) as ViewStyle}>
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
                  // TODO: Change color of animated check button according to theme.
                  source={require("assets/lottie/check.json")}
                  colorFilters={[
                    {
                      keypath: "Shape Layer 2",
                      color: style.flatten(["color-gray-200"]).color,
                    },
                    {
                      keypath: "Shape Layer 1",
                      color: style.flatten(["color-gray-300"]).color,
                    },
                    {
                      keypath: "Layer 1 Outlines",
                      color: style.flatten(["color-white"]).color,
                    },
                  ]}
                  autoPlay
                  speed={2}
                  loop={false}
                  style={style.flatten(["width-58", "height-58"]) as ViewStyle}
                />
              </View>
            </View>
          </View>
        ) : (
          <CopyIcon size={15} />
        )}
      </View>
    </RectButton>
  );
};
