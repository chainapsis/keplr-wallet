import React, { FunctionComponent } from "react";
import { SafeAreaView, ViewProps, StyleSheet, View } from "react-native";
import { useStyle } from "../../styles";
import { GradientBackground } from "../svg";
import { useSetFocusedScreen } from "./utils";

export const PageWithView: FunctionComponent<
  ViewProps & {
    fixed?: React.ReactNode;

    disableSafeArea?: boolean;
  }
> = (props) => {
  const style = useStyle();

  useSetFocusedScreen();

  const { style: propStyle, disableSafeArea, ...restProps } = props;

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
        <GradientBackground />
      </View>
      {!disableSafeArea ? (
        <SafeAreaView style={style.get("flex-1")}>
          <View
            style={StyleSheet.flatten([
              style.flatten(["flex-1", "padding-0", "overflow-visible"]),
              propStyle,
            ])}
            {...restProps}
          />
        </SafeAreaView>
      ) : (
        <View
          style={StyleSheet.flatten([
            style.flatten(["flex-1", "padding-0", "overflow-visible"]),
            propStyle,
          ])}
          {...restProps}
        />
      )}
    </React.Fragment>
  );
};
