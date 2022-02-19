import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import {
  DrawerContentComponentProps,
  DrawerContentOptions,
  DrawerContentScrollView,
} from "@react-navigation/drawer";
import { useStore } from "../../stores";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { Text, View } from "react-native";
import { useStyle } from "../../styles";
import { RectButton } from "../rect-button";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { VectorCharacter } from "../vector-character";
import FastImage from "react-native-fast-image";

export type DrawerContentProps = DrawerContentComponentProps<DrawerContentOptions>;

export const DrawerContent: FunctionComponent<DrawerContentProps> = observer(
  (props) => {
    const { chainStore, analyticsStore } = useStore();
    const navigation = useNavigation();

    const safeAreaInsets = useSafeAreaInsets();

    const style = useStyle();

    return (
      <DrawerContentScrollView {...props}>
        <View
          style={{
            marginBottom: safeAreaInsets.bottom,
          }}
        >
          <View style={style.flatten(["justify-center", "height-50"])}>
            <Text
              style={style.flatten([
                "h3",
                "color-text-black-high",
                "margin-left-24",
              ])}
            >
              Networks
            </Text>
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
                activeOpacity={1}
                underlayColor={
                  style.get("color-drawer-rect-button-underlay").color
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
                      "background-color-primary-100",
                      "margin-right-16",
                    ],
                    [selected && "background-color-primary"]
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
                <Text style={style.flatten(["h4", "color-text-black-medium"])}>
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
