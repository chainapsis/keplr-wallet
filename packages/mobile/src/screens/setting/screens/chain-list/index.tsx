import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { PageWithDraggableFlatList } from "../../../../components/page";
import { useStore } from "../../../../stores";
import { StyleSheet, Text, View } from "react-native";
import { useStyle } from "../../../../styles";
import { Toggle } from "../../../../components/toggle";
import FastImage from "react-native-fast-image";
import { VectorCharacter } from "../../../../components/vector-character";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import { useOnCellActiveAnimation } from "react-native-draggable-flatlist";
import Svg, { Path } from "react-native-svg";

export const SettingChainListScreen: FunctionComponent = observer(() => {
  const { chainStore } = useStore();

  return (
    <PageWithDraggableFlatList
      data={chainStore.chainInfosWithUIConfig.map(
        ({ chainInfo, disabled }, index) => {
          return {
            isFirst: index === 0,
            isLast: index === chainStore.chainInfosWithUIConfig.length - 1,
            chainId: chainInfo.chainId,
            chainName: chainInfo.chainName,
            chainSymbolImageUrl: chainInfo.raw.chainSymbolImageUrl,
            disabled,
          };
        }
      )}
      keyExtractor={(item) => item.chainId}
      renderItem={({ item, drag }) => {
        return <SettingChainListScreenElement {...item} drag={drag} />;
      }}
      onDragEnd={({ data }) => {
        chainStore.setChainInfosInUIOrder(data.map((data) => data.chainId));
      }}
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

  drag: () => void;
}> = observer(
  ({
    isFirst,
    isLast,
    chainId,
    chainName,
    chainSymbolImageUrl,
    disabled,
    drag,
  }) => {
    const { chainStore } = useStore();

    const style = useStyle();

    const { isActive, onActiveAnim } = useOnCellActiveAnimation({
      animationConfig: { mass: 0.1, restDisplacementThreshold: 0.0001 },
    });

    return (
      <View
        style={style.flatten(
          ["flex-row", "height-84", "items-center"],
          [
            isFirst && "margin-top-12",
            isLast && "margin-bottom-12",
            !isLast && "border-solid",
            !isLast && "border-width-bottom-1",
            !isLast && "border-color-divider",
          ]
        )}
      >
        <Animated.View
          style={StyleSheet.flatten([
            style.flatten(["absolute-fill", "background-color-white"]),
            {
              backgroundColor: isActive
                ? (Animated.interpolateColors(onActiveAnim, {
                    inputRange: [0, 1],
                    outputColorRange: [
                      style.get("color-white").color,
                      style.get("color-chain-list-element-dragging").color,
                    ],
                  }) as Animated.Node<string>)
                : style.get("color-white").color,
            },
          ])}
        />
        <TouchableWithoutFeedback onLongPress={drag} delayLongPress={100}>
          <View
            style={style.flatten([
              "height-44",
              "padding-left-18",
              "padding-right-10",
              "justify-center",
              "items-center",
            ])}
          >
            <Svg width="17" height="10" fill="none" viewBox="0 0 17 10">
              <Path
                stroke={style.get("color-card-modal-handle").color}
                strokeLinecap="round"
                strokeWidth="3"
                d="M2 1.5h13M2 8.5h13"
              />
            </Svg>
          </View>
        </TouchableWithoutFeedback>
        <View
          style={style.flatten(
            [
              "width-40",
              "height-40",
              "border-radius-64",
              "items-center",
              "justify-center",
            ],
            [
              disabled
                ? "background-color-primary-100"
                : "background-color-primary",
            ]
          )}
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
        <View style={style.flatten(["justify-center", "margin-left-10"])}>
          <Text style={style.flatten(["h6", "color-text-black-high"])}>
            {chainName}
          </Text>
        </View>
        <View style={style.get("flex-1")} />
        <View style={style.flatten(["margin-right-20"])}>
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
