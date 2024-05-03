import React, { FunctionComponent } from "react";
import { StackHeaderLeftButtonProps } from "@react-navigation/stack";
import { StyleSheet, View, ViewStyle } from "react-native";
import { useStyle } from "styles/index";
import { TouchableOpacity } from "react-native-gesture-handler";
import { HeaderBackButtonIcon } from "./icon";
import { IconButton } from "components/new/button/icon";

export const HeaderLeftButton: FunctionComponent<
  StackHeaderLeftButtonProps
> = ({ children, onPress }) => {
  const style = useStyle();

  return (
    <View style={style.flatten(["absolute"])}>
      <TouchableOpacity
        onPress={onPress}
        style={StyleSheet.flatten([style.flatten(["padding-10"])]) as ViewStyle}
      >
        {children}
      </TouchableOpacity>
    </View>
  );
};

export const HeaderRightButton: FunctionComponent<{
  onPress?: () => void;
  style?: ViewStyle;
}> = ({ children, style: propStyle, onPress }) => {
  const style = useStyle();

  return (
    <View style={StyleSheet.flatten([style.flatten(["absolute"]), propStyle])}>
      <TouchableOpacity
        onPress={onPress}
        style={
          StyleSheet.flatten([style.flatten(["padding-right-20"])]) as ViewStyle
        }
      >
        {children}
      </TouchableOpacity>
    </View>
  );
};
export const HeaderLeftBackButton: FunctionComponent<
  StackHeaderLeftButtonProps
> = (props) => {
  return (
    <React.Fragment>
      {props.canGoBack ? (
        <HeaderLeftButton {...props}>
          <HeaderBackButtonIcon />
        </HeaderLeftButton>
      ) : null}
    </React.Fragment>
  );
};

export const HeaderLeftBackBlurButton: FunctionComponent<
  StackHeaderLeftButtonProps
> = (props) => {
  const style = useStyle();
  return (
    <React.Fragment>
      {props.canGoBack ? (
        <IconButton
          icon={<HeaderBackButtonIcon color="white" size={20} />}
          backgroundBlur={false}
          onPress={props.onPress}
          iconStyle={
            style.flatten([
              "width-54",
              "border-width-1",
              "border-color-white@20%",
              "padding-x-12",
              "padding-y-6",
              "justify-center",
              "items-center",
            ]) as ViewStyle
          }
        />
      ) : null}
    </React.Fragment>
  );
};
