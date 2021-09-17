import React, { FunctionComponent } from "react";
import { StackHeaderLeftButtonProps } from "@react-navigation/stack";
import { StyleSheet, View, ViewStyle } from "react-native";
import { useStyle } from "../../styles";
import { TouchableOpacity } from "react-native-gesture-handler";
import { HeaderBackButtonIcon } from "./icon";

export const HeaderLeftButton: FunctionComponent<StackHeaderLeftButtonProps> = ({
  children,
  onPress,
}) => {
  const style = useStyle();

  return (
    <View style={style.flatten(["absolute"])}>
      <TouchableOpacity
        onPress={onPress}
        style={StyleSheet.flatten([style.flatten(["padding-10"])])}
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
        style={StyleSheet.flatten([style.flatten(["padding-10"])])}
      >
        {children}
      </TouchableOpacity>
    </View>
  );
};
export const HeaderLeftBackButton: FunctionComponent<StackHeaderLeftButtonProps> = (
  props
) => {
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
