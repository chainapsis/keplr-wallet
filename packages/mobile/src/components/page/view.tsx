import React, { FunctionComponent } from "react";
import { SafeAreaView, ViewProps, StyleSheet, View } from "react-native";
import { useStyle } from "../../styles";
import { useSetFocusedScreen } from "./utils";
import { BackgroundMode, ScreenBackground } from "./background";

export const PageWithView: FunctionComponent<
  ViewProps & {
    disableSafeArea?: boolean;
    backgroundMode: BackgroundMode;
  }
> = (props) => {
  const style = useStyle();

  useSetFocusedScreen();

  const {
    style: propStyle,
    disableSafeArea,
    backgroundMode,
    ...restProps
  } = props;

  return (
    <React.Fragment>
      <ScreenBackground backgroundMode={backgroundMode} />
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
