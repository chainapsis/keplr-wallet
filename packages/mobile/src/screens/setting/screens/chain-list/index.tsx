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

  const style = useStyle();

  return (
    <PageWithDraggableFlatList
      backgroundColor={style.get("color-white").color}
      data={chainStore.chainInfosWithUIConfig.map(({ chainInfo, disabled }) => {
        return {
          chainId: chainInfo.chainId,
          chainName: chainInfo.chainName,
          chainSymbolImageUrl: chainInfo.raw.chainSymbolImageUrl,
          disabled,
        };
      })}
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
  chainId: string;
  chainName: string;
  chainSymbolImageUrl: string | undefined;
  disabled: boolean;

  drag: () => void;
}> = observer(({ chainId, chainName, chainSymbolImageUrl, disabled, drag }) => {
  const { chainStore } = useStore();

  const style = useStyle();

  const { isActive, onActiveAnim } = useOnCellActiveAnimation({
    animationConfig: { mass: 0.1, restDisplacementThreshold: 0.0001 },
  });

  return (
    <View
      style={style.flatten([
        "margin-x-16",
        "flex-row",
        "height-83",
        "items-center",
      ])}
    >
      <Animated.View
        style={StyleSheet.flatten([
          style.flatten([
            "absolute-fill",
            "border-radius-8",
            "background-color-chain-list-element-dragging",
          ]),
          {
            opacity: isActive ? onActiveAnim : 0,
          },
        ])}
      />
      <TouchableWithoutFeedback onLongPress={drag} delayLongPress={100}>
        <View
          style={style.flatten([
            "width-36",
            "height-44",
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
        style={style.flatten([
          "width-44",
          "height-44",
          "border-radius-64",
          "items-center",
          "justify-center",
          "background-color-black",
        ])}
      >
        {chainSymbolImageUrl ? (
          <FastImage
            style={{
              width: 32,
              height: 32,
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
        <Text style={style.flatten(["h5", "color-text-black-high"])}>
          {chainName}
        </Text>
      </View>
      <View style={style.get("flex-1")} />
      <View style={style.flatten(["margin-right-12"])}>
        <Toggle
          on={!disabled}
          onChange={() => {
            chainStore.toggleChainInfoInUI(chainId);
          }}
        />
      </View>
    </View>
  );
});
