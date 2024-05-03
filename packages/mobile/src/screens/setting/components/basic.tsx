import React, { FunctionComponent } from "react";
import { useStyle } from "styles/index";
import { StyleSheet, Text, TextStyle, View, ViewStyle } from "react-native";
import { RectButton } from "components/rect-button";
import { BlurBackground } from "components/new/blur-background/blur-background";

export const SettingSectionTitle: FunctionComponent<{
  title: string;
}> = ({ title }) => {
  const style = useStyle();

  return (
    <View style={style.flatten(["padding-y-12"]) as ViewStyle}>
      <Text style={style.flatten(["body3", "color-text-low"])}>{title}</Text>
    </View>
  );
};

export const SettingItem: FunctionComponent<{
  containerStyle?: ViewStyle;
  style?: ViewStyle;
  labelStyle?: TextStyle;
  paragraphStyle?: TextStyle;

  label: string;
  paragraph?: string;
  left?: React.ReactElement;
  right?: React.ReactElement;

  onPress?: () => void;

  bottomBorder?: boolean;
  borderColor?: string;

  rippleColor?: string;
  underlayColor?: string;
  activeOpacity?: number;
  backgroundBlur?: boolean;
}> = ({
  containerStyle,
  style: propStyle,
  labelStyle,
  paragraphStyle,
  label,
  paragraph,
  left,
  right,
  onPress,
  bottomBorder,
  borderColor,
  rippleColor,
  underlayColor,
  activeOpacity,
  backgroundBlur,
}) => {
  const style = useStyle();

  const renderChildren = () => {
    return (
      <React.Fragment>
        {left ? (
          <View style={style.flatten(["margin-right-14"]) as ViewStyle}>
            {left}
          </View>
        ) : null}
        <View>
          <Text
            style={StyleSheet.flatten([
              style.flatten(["body3", "color-white"]),
              labelStyle,
            ])}
          >
            {label}
          </Text>
          {paragraph ? (
            <Text
              style={StyleSheet.flatten([
                style.flatten(["subtitle3", "color-text-low"]),
                paragraphStyle,
              ])}
            >
              {paragraph}
            </Text>
          ) : null}
        </View>
        {right ? (
          <React.Fragment>
            <View style={style.flatten(["flex-1"])} />
            {right}
          </React.Fragment>
        ) : null}
      </React.Fragment>
    );
  };

  return (
    <BlurBackground
      borderRadius={12}
      blurIntensity={16}
      backgroundBlur={backgroundBlur}
      containerStyle={
        [style.flatten(["margin-y-2"]), containerStyle] as ViewStyle
      }
    >
      {onPress ? (
        <RectButton
          style={StyleSheet.flatten([
            style.flatten([
              "padding-x-12",
              "padding-y-18",
              "flex-row",
              "items-center",
            ]) as ViewStyle,
            propStyle,
          ])}
          onPress={onPress}
          rippleColor={rippleColor}
          underlayColor={underlayColor}
          activeOpacity={activeOpacity}
        >
          {renderChildren()}
        </RectButton>
      ) : (
        <View
          style={StyleSheet.flatten([
            style.flatten([
              "height-56",
              "padding-x-20",
              "flex-row",
              "items-center",
            ]) as ViewStyle,
            propStyle,
          ])}
        >
          {renderChildren()}
        </View>
      )}
      {bottomBorder ? (
        <View
          style={StyleSheet.flatten([
            style.flatten([
              "height-1",
              "background-color-white@20%",
            ]) as ViewStyle,
            borderColor ? { backgroundColor: borderColor } : {},
          ])}
        />
      ) : null}
    </BlurBackground>
  );
};

export const Right: FunctionComponent<{
  paragraph?: string;
}> = ({ paragraph }) => {
  const style = useStyle();

  return (
    <React.Fragment>
      {paragraph ? (
        <Text style={style.flatten(["body3", "color-text-low"]) as ViewStyle}>
          {paragraph}
        </Text>
      ) : null}
    </React.Fragment>
  );
};
