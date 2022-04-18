import React from "react";
import {
  FixedHeightSortableList,
  FixedHeightSortableListProps,
} from "../fixed-height-sortable-list";
import { useStyle } from "../../styles";
import { useSetFocusedScreen } from "./utils";
import { SafeAreaView, StyleSheet, View } from "react-native";
import { GradientBackground } from "../svg";

export function PageWithFixedHeightSortableList<Item extends { key: string }>(
  props: FixedHeightSortableListProps<Item> & {
    disableSafeArea?: boolean;
    backgroundColor?: string;
  }
) {
  const style = useStyle();

  useSetFocusedScreen();
  // const scrollY = usePageRegisterScrollYValue();

  const {
    style: propStyle,
    disableSafeArea,
    backgroundColor,
    ...restProps
  } = props;

  const ContainerElement = disableSafeArea ? View : SafeAreaView;

  return (
    <React.Fragment>
      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: -100,
          bottom: -100,
        }}
      >
        {backgroundColor ? (
          <View
            style={{
              width: "100%",
              height: "100%",
              backgroundColor,
            }}
          />
        ) : (
          <GradientBackground />
        )}
      </View>
      <ContainerElement style={style.get("flex-1")}>
        <FixedHeightSortableList
          style={StyleSheet.flatten([
            style.flatten(["flex-1", "padding-0", "overflow-visible"]),
            propStyle,
          ])}
          {...restProps}
        />
      </ContainerElement>
    </React.Fragment>
  );
}
