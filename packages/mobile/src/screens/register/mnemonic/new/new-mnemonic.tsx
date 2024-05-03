import React, { FunctionComponent, useState } from "react";
import { observer } from "mobx-react-lite";

import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { useStyle } from "styles/index";
import { PageWithScrollView } from "components/page/scroll-view";
import CheckBox from "@react-native-community/checkbox";
import { RouteProp, useRoute } from "@react-navigation/native";
import * as Clipboard from "expo-clipboard";
import { Button } from "components/button";
import { RegisterConfig } from "@keplr-wallet/hooks";
import { SimpleCardView } from "components/new/card-view/simple-card";
import { CopyIcon } from "components/new/icon/copy-icon";
import { useSimpleTimer } from "hooks/use-simple-timer";
import LottieView from "lottie-react-native";
import { useNewMnemonicConfig } from "../hook";
import { useSmartNavigation } from "navigation/smart-navigation";

export const NewMnemonicScreen: FunctionComponent = observer(() => {
  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          registerConfig: RegisterConfig;
        }
      >,
      string
    >
  >();

  const registerConfig: RegisterConfig = route.params.registerConfig;

  const newMnemonicConfig = useNewMnemonicConfig(registerConfig);

  const words = newMnemonicConfig.mnemonic.split(" ");

  const smartNavigation = useSmartNavigation();

  const style = useStyle();
  const [toggleCheckBox, setToggleCheckBox] = useState(false);
  const [isSelected, setSelection] = useState(false);
  const { isTimedOut, setTimer } = useSimpleTimer();

  return (
    <PageWithScrollView
      backgroundMode="image"
      contentContainerStyle={style.get("flex-grow-1")}
      style={style.flatten(["padding-x-page"]) as ViewStyle}
    >
      <View style={style.flatten(["margin-y-10"]) as ViewStyle}>
        <Text
          style={
            style.flatten([
              "h1",
              "color-white",
              "font-normal",
              "margin-bottom-16",
            ]) as ViewStyle
          }
        >
          Save your recovery phrase
        </Text>
        <Text
          style={
            style.flatten([
              "color-gray-200",
              "body2",
              "margin-bottom-8",
            ]) as ViewStyle
          }
        >
          These words below will let you recover your wallet if you lose your
          device. We recommend writing down your recovery phrase and storing it
          in a secure offline location, and never share with anyone!
        </Text>
      </View>
      <TouchableOpacity
        onPress={async () => {
          await Clipboard.setStringAsync(words.join(" "));
          setTimer(3000);
        }}
        activeOpacity={0.6}
      >
        <SimpleCardView
          heading={words.join(" ")}
          headingMode={"gradient"}
          headingStyle={style.flatten(["body3"])}
          cardStyle={
            style.flatten(["margin-y-10", "margin-bottom-24"]) as ViewStyle
          }
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
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => setToggleCheckBox(!toggleCheckBox)}
        style={
          style.flatten([
            "flex-row",
            "margin-bottom-16",
            "margin-right-32",
          ]) as ViewStyle
        }
      >
        <CheckBox
          disabled={false}
          value={toggleCheckBox}
          onValueChange={(newValue) => setToggleCheckBox(newValue)}
          onCheckColor="white"
          onTintColor="white"
          lineWidth={2}
          boxType="square"
          tintColors={{ true: "white", false: "#C6C6CD" }}
          style={
            style.flatten([
              "width-16",
              "height-16",
              "margin-right-12",
              "margin-top-4",
            ]) as ViewStyle
          }
        />
        <Text
          style={
            style.flatten([
              "color-gray-100",
              "body2",
              "font-normal",
              "margin-left-12",
            ]) as ViewStyle
          }
        >
          I understand that if I lose my recovery phrase, I will not be able to
          access my wallet
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => setSelection(!isSelected)}
        style={
          style.flatten([
            "flex-row",
            "margin-bottom-16",
            "margin-right-32",
          ]) as ViewStyle
        }
      >
        <CheckBox
          disabled={false}
          value={isSelected}
          onValueChange={(newValue) => setSelection(newValue)}
          onCheckColor="white"
          onTintColor="white"
          lineWidth={2}
          aria-busy={true}
          boxType="square"
          tintColors={{ true: "white", false: "#C6C6CD" }}
          style={
            style.flatten([
              "width-16",
              "height-16",
              "margin-right-12",
              "margin-top-4",
            ]) as ViewStyle
          }
        />
        <Text
          style={
            style.flatten([
              "color-gray-100",
              "body2",
              "font-normal",
              "margin-left-12",
            ]) as ViewStyle
          }
        >
          I understand that my assets can be stolen if I share my recovery
          phrase with someone else.
        </Text>
      </TouchableOpacity>
      <View style={style.flatten(["flex-1"])} />
      <Button
        containerStyle={style.flatten(["border-radius-32"]) as ViewStyle}
        text="Continue"
        size="large"
        rippleColor="black@10%"
        disabled={!isSelected || !toggleCheckBox}
        textStyle={style.flatten(["body2"])}
        onPress={() => {
          smartNavigation.navigateSmart("Register.VerifyMnemonic", {
            registerConfig,
            newMnemonicConfig,
          });
        }}
      />
      <View style={style.flatten(["height-page-pad"]) as ViewStyle} />
    </PageWithScrollView>
  );
});
