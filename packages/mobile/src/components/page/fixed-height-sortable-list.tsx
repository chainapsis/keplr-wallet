import React from "react";
import {
  FixedHeightSortableList,
  FixedHeightSortableListProps,
} from "../fixed-height-sortable-list";
import { useStyle } from "../../styles";
import { usePageRegisterScrollYValue, useSetFocusedScreen } from "./utils";
import {
  Animated,
  Platform,
  SafeAreaView,
  StyleSheet,
  View,
} from "react-native";
import { BackgroundMode, ScreenBackground } from "./background";

export function PageWithFixedHeightSortableList<Item extends { key: string }>(
  props: FixedHeightSortableListProps<Item> & {
    disableSafeArea?: boolean;
    backgroundMode: BackgroundMode;
  }
) {
  const style = useStyle();

  useSetFocusedScreen();
  const scrollY = usePageRegisterScrollYValue();

  const {
    style: propStyle,
    disableSafeArea,
    backgroundMode,
    onScroll,
    ...restProps
  } = props;

  const ContainerElement = disableSafeArea ? View : SafeAreaView;

  return (
    <React.Fragment>
      <ScreenBackground backgroundMode={backgroundMode} />
      <ContainerElement style={style.get("flex-1")}>
        <FixedHeightSortableList
          style={StyleSheet.flatten([
            style.flatten(
              ["flex-1", "padding-0"],
              /*
               XXX: After react-native@0.64, this makes layout changes by unknown reason on android.
                    Unfortunately, the reason can't be found on changelog.
                    However, "overflow-visible" is necessary only in IOS to show the UI under top/bottom bar with blur.
               */
              [Platform.OS === "ios" && "overflow-visible"]
            ),
            propStyle,
          ])}
          onScroll={Animated.event(
            [
              {
                nativeEvent: { contentOffset: { y: scrollY } },
              },
            ],
            { useNativeDriver: true, listener: onScroll }
          )}
          {...restProps}
        />
      </ContainerElement>
    </React.Fragment>
  );
}
