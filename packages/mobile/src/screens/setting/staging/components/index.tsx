import React, { FunctionComponent } from "react";
import { useStyle } from "../../../../styles";
import { StyleSheet, Text, TextStyle, View, ViewStyle } from "react-native";
import { RectButton } from "react-native-gesture-handler";
import { RightArrowIcon } from "../../../../components/staging/icon";

export const SettingSectionTitle: FunctionComponent<{
  title: string;
}> = ({ title }) => {
  const style = useStyle();

  return (
    <View
      style={style.flatten([
        "padding-x-12",
        "padding-top-12",
        "padding-bottom-2",
      ])}
    >
      <Text
        style={style.flatten([
          "text-caption1",
          "color-text-black-very-low",
          "uppercase",
        ])}
      >
        {title}
      </Text>
    </View>
  );
};

export const SettingItem: FunctionComponent<{
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;

  label: string;
  left?: React.ReactElement;
  right?: React.ReactElement;

  onPress?: () => void;

  topBorder?: boolean;
}> = ({
  containerStyle,
  labelStyle,
  label,
  left,
  right,
  onPress,
  topBorder,
}) => {
  const style = useStyle();

  const renderChildren = () => {
    return (
      <React.Fragment>
        {left}
        <Text
          style={StyleSheet.flatten([
            style.flatten(["body1", "color-text-black-medium"]),
            labelStyle,
          ])}
        >
          {label}
        </Text>
        <View style={style.flatten(["flex-1"])} />
        {right}
      </React.Fragment>
    );
  };

  return (
    <View>
      {topBorder ? (
        <View
          style={style.flatten(["height-1", "background-color-border-white"])}
        />
      ) : null}
      {onPress ? (
        <RectButton
          style={StyleSheet.flatten([
            style.flatten([
              "background-color-white",
              "height-62",
              "padding-x-16",
              "flex-row",
              "items-center",
            ]),
            containerStyle,
          ])}
          onPress={onPress}
        >
          {renderChildren()}
        </RectButton>
      ) : (
        <View
          style={StyleSheet.flatten([
            style.flatten([
              "background-color-white",
              "height-62",
              "padding-x-16",
              "flex-row",
              "items-center",
            ]),
            containerStyle,
          ])}
        >
          {renderChildren()}
        </View>
      )}

      <View
        style={style.flatten(["height-1", "background-color-border-white"])}
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
          style={style.flatten([
            "body1",
            "color-text-black-low",
            "margin-right-16",
          ])}
        >
          {paragraph}
        </Text>
      ) : null}
      <RightArrowIcon
        color={style.get("color-text-black-low").color}
        height={15}
      />
    </React.Fragment>
  );
};
