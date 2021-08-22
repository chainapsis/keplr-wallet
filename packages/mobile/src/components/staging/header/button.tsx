import React, { FunctionComponent } from "react";
import { StackHeaderLeftButtonProps } from "@react-navigation/stack";
import { StyleSheet, View } from "react-native";
import { useStyle } from "../../../styles";
import { TouchableOpacity } from "react-native-gesture-handler";
import Svg, { Path } from "react-native-svg";

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
}> = ({ children, onPress }) => {
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

export const BackButtonIcon: FunctionComponent<{
  color: string;
  size: number;
}> = ({ color, size }) => {
  return (
    <Svg width={size} height={size} fill="none" viewBox="0 0 28 28">
      <Path
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M17.938 21.875L10.063 14l7.874-7.875"
      />
    </Svg>
  );
};

export const HeaderLeftBackButton: FunctionComponent<StackHeaderLeftButtonProps> = (
  props
) => {
  const style = useStyle();

  return (
    <React.Fragment>
      {props.canGoBack ? (
        <HeaderLeftButton {...props}>
          <BackButtonIcon
            size={28}
            color={style.get("color-text-black-high").color}
          />
        </HeaderLeftButton>
      ) : null}
    </React.Fragment>
  );
};
