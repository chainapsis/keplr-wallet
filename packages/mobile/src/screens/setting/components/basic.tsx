import React, { FunctionComponent } from "react";
import { useStyle } from "../../../styles";
import { StyleSheet, Text, TextStyle, View, ViewStyle } from "react-native";
import { RightArrowIcon } from "../../../components/icon";
import { RectButton } from "../../../components/rect-button";

export const SettingSectionTitle: FunctionComponent<{
  title: string;
}> = ({ title }) => {
  const style = useStyle();

  return (
    <View
      style={style.flatten([
        "padding-x-20",
        "padding-top-16",
        "padding-bottom-4",
      ])}
    >
      <Text
        style={style.flatten(["text-caption1", "color-text-low", "uppercase"])}
      >
        {title}
      </Text>
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

  topBorder?: boolean;
  borderColor?: string;

  rippleColor?: string;
  underlayColor?: string;
  activeOpacity?: number;
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
  topBorder,
  borderColor,
  rippleColor,
  underlayColor,
  activeOpacity,
}) => {
  const style = useStyle();

  const renderChildren = () => {
    return (
      <React.Fragment>
        {left}
        <View>
          <Text
            style={StyleSheet.flatten([
              style.flatten(["body1", "color-text-middle"]),
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
    <View style={containerStyle}>
      {topBorder ? (
        <View
          style={StyleSheet.flatten([
            style.flatten([
              "height-1",
              "background-color-gray-50",
              "dark:background-color-platinum-500@75%",
            ]),
            borderColor ? { backgroundColor: borderColor } : {},
          ])}
        />
      ) : null}
      {onPress ? (
        <RectButton
          style={StyleSheet.flatten([
            style.flatten([
              "background-color-white",
              "dark:background-color-platinum-600",
              "height-62",
              "padding-x-20",
              "flex-row",
              "items-center",
            ]),
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
              "background-color-white",
              "dark:background-color-platinum-600",
              "height-62",
              "padding-x-20",
              "flex-row",
              "items-center",
            ]),
            propStyle,
          ])}
        >
          {renderChildren()}
        </View>
      )}
      <View
        style={StyleSheet.flatten([
          style.flatten([
            "height-1",
            "background-color-gray-50",
            "dark:background-color-platinum-500@75%",
          ]),
          borderColor ? { backgroundColor: borderColor } : {},
        ])}
      />
    </View>
  );
};

export const RightArrow: FunctionComponent<{
  paragraph?: string;
}> = ({ paragraph }) => {
  const style = useStyle();

  return (
    <React.Fragment>
      {paragraph ? (
        <Text
          style={style.flatten(["body1", "color-text-low", "margin-right-16"])}
        >
          {paragraph}
        </Text>
      ) : null}
      <RightArrowIcon color={style.get("color-text-low").color} height={15} />
    </React.Fragment>
  );
};
