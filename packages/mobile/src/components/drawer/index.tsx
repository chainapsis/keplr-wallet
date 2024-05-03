import React, { FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import {
  DrawerContentComponentProps,
  DrawerContentOptions,
  DrawerContentScrollView,
} from "@react-navigation/drawer";
import { useStore } from "stores/index";
import {
  DrawerActions,
  StackActions,
  useNavigation,
} from "@react-navigation/native";
import { Platform, StyleSheet, Text, View, ViewStyle } from "react-native";
import { useStyle } from "styles/index";
import { RectButton } from "components/rect-button";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import FastImage from "react-native-fast-image";
import { VectorCharacter } from "components/vector-character";
import { BlurBackground } from "components/new/blur-background/blur-background";
import { CheckIcon } from "components/new/icon/check";
import { IconButton } from "components/new/button/icon";
import { XmarkIcon } from "components/new/icon/xmark";
import { TextInput } from "components/input";
import { SearchIcon } from "components/new/icon/search-icon";
import { EmptyView } from "components/new/empty";
import { titleCase } from "utils/format/format";
import { Button } from "components/button";

export type DrawerContentProps =
  DrawerContentComponentProps<DrawerContentOptions>;

export const DrawerContent: FunctionComponent<DrawerContentProps> = observer(
  (props) => {
    const { chainStore } = useStore();
    const navigation = useNavigation();

    const safeAreaInsets = useSafeAreaInsets();

    const { style: propStyle, ...rest } = props;

    const style = useStyle();
    const [search, setSearch] = useState("");
    const [filterChainInfos, setFilterChainInfos] = useState(
      chainStore.chainInfosInUI
    );
    const [isEnabled, setIsEnabled] = useState(true);

    useEffect(() => {
      const searchTrim = search.trim();
      const newChainInfos = chainStore.chainInfosInUI.filter((chainInfo) => {
        return chainInfo.chainName
          .toLowerCase()
          .includes(searchTrim.toLowerCase());
      });
      setFilterChainInfos(newChainInfos);
    }, [chainStore.chainInfosInUI, search]);

    return (
      <DrawerContentScrollView
        style={StyleSheet.flatten([
          propStyle,
          style.flatten([
            "background-color-indigo-900",
            "dark:background-color-platinum-600",
            "padding-x-page",
          ]),
        ])}
        contentContainerStyle={{
          paddingTop: Platform.OS === "ios" ? safeAreaInsets.top + 10 : 48,
          height: filterChainInfos.length === 0 ? "100%" : undefined,
        }}
        {...rest}
      >
        {filterChainInfos.length === 0 ? <EmptyView /> : null}

        <View
          style={{
            marginBottom: safeAreaInsets.bottom,
          }}
        >
          <View
            style={
              style.flatten([
                "items-center",
                "height-50",
                "flex-row",
              ]) as ViewStyle
            }
          >
            <Text
              style={style.flatten(["subtitle2", "color-white"]) as ViewStyle}
            >
              Change Network
            </Text>
            <View style={style.get("flex-1")} />
            <View
              style={
                style.flatten([
                  "height-1",
                  "justify-center",
                  "items-center",
                ]) as ViewStyle
              }
            >
              <IconButton
                icon={<XmarkIcon color={"white"} />}
                backgroundBlur={false}
                blurIntensity={20}
                borderRadius={50}
                onPress={() => {
                  setSearch("");
                  navigation.dispatch(DrawerActions.closeDrawer());
                }}
                iconStyle={
                  style.flatten([
                    "padding-8",
                    "border-width-1",
                    "border-color-gray-400",
                  ]) as ViewStyle
                }
              />
            </View>
          </View>
          <BlurBackground borderRadius={12} blurIntensity={20}>
            <TextInput
              placeholder="Search"
              placeholderTextColor={"white"}
              style={style.flatten(["body3"])}
              inputContainerStyle={
                style.flatten([
                  "border-width-0",
                  "padding-x-18",
                  "padding-y-12",
                ]) as ViewStyle
              }
              value={search}
              onChangeText={(text: string) => {
                setSearch(text);
              }}
              containerStyle={style.flatten(["padding-0"]) as ViewStyle}
              inputRight={<SearchIcon />}
            />
          </BlurBackground>
          <Button
            containerStyle={
              style.flatten([
                "border-radius-32",
                "border-color-white@40%",
                "margin-y-24",
              ]) as ViewStyle
            }
            mode="outline"
            textStyle={style.flatten(["color-white", "body3"])}
            text="Manage networks"
            onPress={() => {
              navigation.dispatch(
                StackActions.push("ChainList", {
                  screen: "Setting.ChainList",
                })
              );
            }}
          />
          {filterChainInfos.map((chainInfo) => {
            const selected = chainStore.current.chainId === chainInfo.chainId;

            return (
              <BlurBackground
                key={chainInfo.chainId}
                borderRadius={12}
                blurIntensity={15}
                containerStyle={style.flatten(["margin-y-2"]) as ViewStyle}
              >
                <RectButton
                  onPress={() => {
                    setSearch("");
                    chainStore.selectChain(chainInfo.chainId);
                    chainStore.saveLastViewChainId();
                    navigation.dispatch(DrawerActions.closeDrawer());
                  }}
                  style={
                    style.flatten(
                      [
                        "flex-row",
                        "height-62",
                        "items-center",
                        "padding-x-12",
                        "justify-between",
                      ],
                      [
                        selected && "background-color-indigo",
                        "border-radius-12",
                      ]
                    ) as ViewStyle
                  }
                  activeOpacity={0.5}
                  underlayColor={
                    style.flatten(["color-gray-50", "dark:color-platinum-500"])
                      .color
                  }
                >
                  <View
                    style={
                      style.flatten(["flex-row", "items-center"]) as ViewStyle
                    }
                  >
                    <BlurBackground
                      backgroundBlur={true}
                      containerStyle={
                        style.flatten([
                          "width-32",
                          "height-32",
                          "border-radius-64",
                          "items-center",
                          "justify-center",
                          "margin-right-12",
                        ]) as ViewStyle
                      }
                    >
                      {chainInfo.raw.chainSymbolImageUrl ? (
                        <FastImage
                          style={{
                            width: 22,
                            height: 22,
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
                          height={12}
                        />
                      )}
                    </BlurBackground>
                    <Text style={style.flatten(["subtitle3", "color-white"])}>
                      {titleCase(chainInfo.chainName)}
                    </Text>
                  </View>
                  <View>{selected ? <CheckIcon /> : null}</View>
                </RectButton>
              </BlurBackground>
            );
          })}
        </View>
        <View style={style.flatten(["height-page-pad"]) as ViewStyle} />
      </DrawerContentScrollView>
    );
  }
);
