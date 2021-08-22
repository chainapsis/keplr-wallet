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
        style={StyleSheet.flatten([style.flatten(["padding-12"])])}
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
        style={StyleSheet.flatten([style.flatten(["padding-12"])])}
      >
        {children}
      </TouchableOpacity>
    </View>
  );
};

export const BackButtonIcon: FunctionComponent<{
  color: string;
  height: number;
}> = ({ color, height }) => {
  return (
    <Svg
      fill="none"
      viewBox="0 0 10 18"
      style={{
        height,
        aspectRatio: 10 / 18,
      }}
    >
      <Path
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M8.53 17L1 9l7.53-8"
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
            color={style.get("color-text-black-high").color}
            height={16}
          />
        </HeaderLeftButton>
      ) : null}
    </React.Fragment>
  );
};
