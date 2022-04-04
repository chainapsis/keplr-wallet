import React from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import { useStyle } from "../../styles";
import { GradientBackground } from "../svg";
import DraggableFlatList, {
  DraggableFlatListProps,
} from "react-native-draggable-flatlist";
import { useSetFocusedScreen } from "./utils";

export function PageWithDraggableFlatList<T>(
  props: React.PropsWithChildren<
    DraggableFlatListProps<T> & {
      fixed?: React.ReactNode;
      disableSafeArea?: boolean;
      backgroundColor?: string;
    }
  >
) {
  const style = useStyle();

  useSetFocusedScreen();

  const {
    containerStyle,
    style: propStyle,
    fixed,
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
        <DraggableFlatList
          containerStyle={StyleSheet.flatten([
            style.flatten(["flex-grow-1", "padding-0", "overflow-visible"]),
            containerStyle,
          ])}
          style={StyleSheet.flatten([
            style.flatten(["flex-1", "padding-0", "overflow-visible"]),
            propStyle,
          ])}
          {...restProps}
        />
        <View
          style={style.flatten(["absolute", "width-full", "height-full"])}
          pointerEvents="box-none"
        >
          {fixed}
        </View>
      </ContainerElement>
    </React.Fragment>
  );
}
