import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";
import { FlatList, StyleSheet, Text, View, ViewStyle } from "react-native";
import { useStyle } from "../../../../styles";
import { Toggle } from "../../../../components/toggle";
import FastImage from "react-native-fast-image";
import { VectorCharacter } from "../../../../components/vector-character";

export const SettingChainListScreen: FunctionComponent = observer(() => {
  const { chainStore } = useStore();

  return (
    <FlatList
      renderItem={({ item }) => <SettingChainListScreenElement {...item} />}
      keyExtractor={(item) => item.key}
      data={chainStore.chainInfosWithUIConfig.map((chainInfoUI, index) => {
        return {
          key: chainInfoUI.chainInfo.chainId,
          isFirst: index === 0,
          isLast: index === chainStore.chainInfosWithUIConfig.length - 1,
          chainId: chainInfoUI.chainInfo.chainId,
          chainName: chainInfoUI.chainInfo.chainName,
          chainSymbolImageUrl: chainInfoUI.chainInfo.raw.chainSymbolImageUrl,
          disabled: chainInfoUI.disabled,
        };
      })}
    />
  );
});

export const SettingChainListScreenElement: FunctionComponent<{
  isFirst: boolean;
  isLast: boolean;

  chainId: string;
  chainName: string;
  chainSymbolImageUrl: string | undefined;
  disabled: boolean;
}> = observer(
  ({ isLast, chainId, chainName, chainSymbolImageUrl, disabled }) => {
    const { chainStore } = useStore();

    const style = useStyle();

    return (
      <View
        style={
          style.flatten(
            ["flex-row", "height-84", "items-center"],
            [
              !isLast && "border-solid",
              !isLast && "border-width-bottom-1",
              !isLast && "border-color-gray-50",
              !isLast && "dark:border-color-platinum-500",
            ]
          ) as ViewStyle
        }
      >
        <View
          style={StyleSheet.flatten([
            style.flatten([
              "absolute-fill",
              "background-color-white",
              "dark:background-color-platinum-600",
            ]),
          ])}
        />
        <View
          style={
            style.flatten(
              [
                "margin-left-8",
                "padding-left-10",
                "padding-right-10",
                "width-40",
                "height-40",
                "border-radius-64",
                "items-center",
                "justify-center",
                "background-color-blue-400",
              ],
              [
                disabled && "background-color-gray-100",
                disabled && "dark:background-color-platinum-500",
              ]
            ) as ViewStyle
          }
        >
          {chainSymbolImageUrl ? (
            <FastImage
              style={{
                width: 30,
                height: 30,
              }}
              resizeMode={FastImage.resizeMode.contain}
              source={{
                uri: chainSymbolImageUrl,
              }}
            />
          ) : (
            <VectorCharacter char={chainName[0]} color="white" height={15} />
          )}
        </View>
        <View
          style={
            style.flatten(["justify-center", "margin-left-10"]) as ViewStyle
          }
        >
          <Text style={style.flatten(["h6", "color-text-high"])}>
            {chainName}
          </Text>
        </View>
        <View style={style.get("flex-1")} />
        <View style={style.flatten(["margin-right-20"]) as ViewStyle}>
          <Toggle
            on={!disabled}
            onChange={() => {
              chainStore.toggleChainInfoInUI(chainId);
            }}
          />
        </View>
      </View>
    );
  }
);
