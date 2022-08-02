import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import {
  DrawerContentComponentProps,
  DrawerContentOptions,
  DrawerContentScrollView,
} from "@react-navigation/drawer";
import { useStore } from "../../stores";
import {
  DrawerActions,
  StackActions,
  useNavigation,
} from "@react-navigation/native";
import { StyleSheet, Text, View } from "react-native";
import { useStyle } from "../../styles";
import { RectButton } from "../rect-button";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { VectorCharacter } from "../vector-character";
import FastImage from "react-native-fast-image";
import { BorderlessButton } from "react-native-gesture-handler";
import Svg, { Path } from "react-native-svg";

export type DrawerContentProps = DrawerContentComponentProps<DrawerContentOptions>;

export const DrawerContent: FunctionComponent<DrawerContentProps> = observer(
  (props) => {
    const { chainStore, analyticsStore } = useStore();
    const navigation = useNavigation();

    const safeAreaInsets = useSafeAreaInsets();

    const { style: propStyle, ...rest } = props;

    const style = useStyle();

    return (
      <DrawerContentScrollView
        style={StyleSheet.flatten([
          propStyle,
          style.flatten([
            "background-color-white",
            "dark:background-color-platinum-600",
          ]),
        ])}
        {...rest}
      >
        <View
          style={{
            marginBottom: safeAreaInsets.bottom,
          }}
        >
          <View
            style={style.flatten(["items-center", "height-50", "flex-row"])}
          >
            <Text
              style={style.flatten(["h3", "color-text-high", "margin-left-24"])}
            >
              Networks
            </Text>
            <View style={style.get("flex-1")} />
            <View
              style={style.flatten([
                "height-1",
                "justify-center",
                "items-center",
                "margin-right-12",
              ])}
            >
              <BorderlessButton
                style={style.flatten(["padding-4"])}
                rippleColor={
                  style.get("color-rect-button-default-ripple").color
                }
                activeOpacity={0.3}
                onPress={() => {
                  navigation.dispatch(
                    StackActions.push("ChainList", {
                      screen: "Setting.ChainList",
                    })
                  );
                }}
              >
                <Svg width="28" height="28" fill="none" viewBox="0 0 28 28">
                  <Path
                    fill={style.get("color-text-low").color}
                    d="M3.5 7.875h12.4a2.624 2.624 0 004.95 0h3.65a.875.875 0 100-1.75h-3.65a2.624 2.624 0 00-4.95 0H3.5a.875.875 0 000 1.75zm21 12.25h-3.65a2.625 2.625 0 00-4.95 0H3.5a.875.875 0 000 1.75h12.4a2.625 2.625 0 004.95 0h3.65a.875.875 0 100-1.75zm0-7H12.1a2.625 2.625 0 00-4.95 0H3.5a.875.875 0 000 1.75h3.65a2.625 2.625 0 004.95 0h12.4a.875.875 0 100-1.75z"
                  />
                </Svg>
              </BorderlessButton>
            </View>
          </View>
          {chainStore.chainInfosInUI.map((chainInfo) => {
            const selected = chainStore.current.chainId === chainInfo.chainId;

            return (
              <RectButton
                key={chainInfo.chainId}
                onPress={() => {
                  analyticsStore.logEvent("Chain changed", {
                    chainId: chainStore.current.chainId,
                    chainName: chainStore.current.chainName,
                    toChainId: chainInfo.chainId,
                    toChainName: chainInfo.chainName,
                  });
                  chainStore.selectChain(chainInfo.chainId);
                  chainStore.saveLastViewChainId();
                  navigation.dispatch(DrawerActions.closeDrawer());
                }}
                style={style.flatten([
                  "flex-row",
                  "height-84",
                  "items-center",
                  "padding-x-20",
                ])}
                activeOpacity={style.theme === "dark" ? 0.5 : 1}
                underlayColor={
                  style.flatten(["color-gray-50", "dark:color-platinum-500"])
                    .color
                }
              >
                <View
                  style={style.flatten(
                    [
                      "width-44",
                      "height-44",
                      "border-radius-64",
                      "items-center",
                      "justify-center",
                      "background-color-gray-100",
                      "dark:background-color-platinum-500",
                      "margin-right-16",
                    ],
                    [selected && "background-color-blue-400"]
                  )}
                >
                  {chainInfo.raw.chainSymbolImageUrl ? (
                    <FastImage
                      style={{
                        width: 32,
                        height: 32,
                      }}
                      resizeMode={FastImage.resizeMode.contain}
                      source={{
                        uri: chainInfo.raw.chainSymbolImageUrl,
                      }}
                    />
                  ) : (
                    <VectorCharacter
                      char={chainInfo.chainName[0]}
                      color="white"
                      height={15}
                    />
                  )}
                </View>
                <Text style={style.flatten(["h4", "color-text-middle"])}>
                  {chainInfo.chainName}
                </Text>
              </RectButton>
            );
          })}
        </View>
      </DrawerContentScrollView>
    );
  }
);
