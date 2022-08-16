import React, { FunctionComponent, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";
import { StyleSheet, Text, View } from "react-native";
import { useStyle } from "../../../../styles";
import { Toggle } from "../../../../components/toggle";
import FastImage from "react-native-fast-image";
import { VectorCharacter } from "../../../../components/vector-character";
import { PanGestureHandler } from "react-native-gesture-handler";
import Svg, { Path } from "react-native-svg";
import { PageWithFixedHeightSortableList } from "../../../../components/page/fixed-height-sortable-list";
import Animated, { Easing } from "react-native-reanimated";

export const SettingChainListScreen: FunctionComponent = observer(() => {
  const { chainStore } = useStore();

  const style = useStyle();

  return (
    <PageWithFixedHeightSortableList
      backgroundMode="secondary"
      contentContainerStyle={style.get("flex-grow-1")}
      itemHeight={84}
      data={chainStore.chainInfosWithUIConfig.map(
        ({ chainInfo, disabled }, index) => {
          return {
            key: chainInfo.chainId,
            isFirst: index === 0,
            isLast: index === chainStore.chainInfosWithUIConfig.length - 1,
            chainId: chainInfo.chainId,
            chainName: chainInfo.chainName,
            chainSymbolImageUrl: chainInfo.raw.chainSymbolImageUrl,
            disabled,
          };
        }
      )}
      dividerIndex={chainStore.chainInfosWithUIConfig.findIndex(
        ({ disabled }) => disabled
      )}
      delegateOnGestureEventToItemView={true}
      onDragEnd={(keys) => {
        chainStore.setChainInfosInUIOrder(keys);
      }}
      renderItem={(item, anims) => {
        return (
          <SettingChainListScreenElement
            {...item}
            isDragging={anims.isDragging}
            onGestureEvent={anims.onGestureEvent}
          />
        );
      }}
      gapTop={12}
      gapBottom={12}
    />
  );
});

const usePreviousDiff = (initialValue: number) => {
  const [previous] = useState(() => new Animated.Value<number>(initialValue));

  return useMemo(() => {
    return {
      set: (value: Animated.Adaptable<number>) => Animated.set(previous, value),
      diff: (value: Animated.Adaptable<number>) =>
        Animated.cond(
          Animated.defined(previous),
          Animated.sub(value, previous),
          value
        ),
      previous,
    };
  }, [previous]);
};

export const SettingChainListScreenElement: FunctionComponent<{
  isFirst: boolean;
  isLast: boolean;

  chainId: string;
  chainName: string;
  chainSymbolImageUrl: string | undefined;
  disabled: boolean;

  isDragging: Animated.Value<number>;
  onGestureEvent: (...args: any[]) => void;
}> = observer(
  ({
    isLast,
    chainId,
    chainName,
    chainSymbolImageUrl,
    disabled,
    isDragging,
    onGestureEvent,
  }) => {
    const { chainStore } = useStore();

    const style = useStyle();

    const [animatedState] = useState(() => {
      return {
        clock: new Animated.Clock(),
        finished: new Animated.Value(0),
        position: new Animated.Value(0),
        time: new Animated.Value(0),
        frameTime: new Animated.Value(0),
      };
    });
    const isDraggingDiff = usePreviousDiff(0);

    const animIsDragging = useMemo(() => {
      return Animated.block([
        Animated.cond(
          Animated.not(Animated.eq(isDraggingDiff.diff(isDragging), 0)),
          [
            Animated.set(animatedState.finished, 0),
            Animated.set(animatedState.time, 0),
            Animated.set(animatedState.frameTime, 0),
            Animated.cond(
              Animated.not(Animated.clockRunning(animatedState.clock)),
              Animated.startClock(animatedState.clock)
            ),
          ]
        ),

        Animated.timing(animatedState.clock, animatedState, {
          duration: 140,
          toValue: isDragging,
          easing: Easing.out(Easing.cubic),
        }),

        Animated.cond(animatedState.finished, [
          Animated.stopClock(animatedState.clock),
        ]),

        isDraggingDiff.set(isDragging),

        animatedState.position,
      ]);
    }, [animatedState, isDragging, isDraggingDiff]);

    return (
      <View
        style={style.flatten(
          ["flex-row", "height-84", "items-center"],
          [
            !isLast && "border-solid",
            !isLast && "border-width-bottom-1",
            !isLast && "border-color-gray-50",
            !isLast && "dark:border-color-platinum-500",
          ]
        )}
      >
        <Animated.View
          style={StyleSheet.flatten([
            style.flatten([
              "absolute-fill",
              "background-color-white",
              "dark:background-color-platinum-600",
            ]),
            {
              backgroundColor: Animated.interpolateColors(animIsDragging, {
                inputRange: [0, 1],
                outputColorRange: [
                  style.flatten(["color-white", "dark:color-platinum-600"])
                    .color,
                  style.flatten(["color-gray-50", "dark:color-platinum-400"])
                    .color,
                ],
              }) as Animated.Node<string>,
            },
          ])}
        />
        <PanGestureHandler
          onGestureEvent={onGestureEvent}
          onHandlerStateChange={onGestureEvent}
        >
          <Animated.View
            style={style.flatten([
              "height-64",
              "margin-left-8",
              "padding-left-10",
              "padding-right-10",
              "justify-center",
              "items-center",
            ])}
          >
            <Svg width="17" height="10" fill="none" viewBox="0 0 17 10">
              <Path
                stroke={
                  style.flatten(["color-gray-100", "dark:color-platinum-100"])
                    .color
                }
                strokeLinecap="round"
                strokeWidth="3"
                d="M2 1.5h13M2 8.5h13"
              />
            </Svg>
          </Animated.View>
        </PanGestureHandler>
        <View
          style={style.flatten(
            [
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
          <Text style={style.flatten(["h6", "color-text-high"])}>
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
