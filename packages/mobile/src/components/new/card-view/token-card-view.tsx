import React, { FunctionComponent, ReactElement } from "react";
import { View, Text, ViewStyle, TouchableOpacity } from "react-native";
import { useStyle } from "styles/index";
import { BlurBackground } from "components/new/blur-background/blur-background";
import { IconButton } from "components/new/button/icon";

export const TokenCardView: FunctionComponent<{
  containerStyle?: ViewStyle;
  titleStyle?: ViewStyle;
  leadingIcon?: ReactElement;
  title: string;
  subtitle?: string;
  trailingStart?: string;
  trailingEnd?: string;
  onPress?: () => void;
}> = ({
  leadingIcon,
  title,
  subtitle,
  onPress,
  trailingStart,
  trailingEnd,
  containerStyle,
  titleStyle,
}) => {
  const style = useStyle();

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.6}>
      <BlurBackground
        borderRadius={12}
        blurIntensity={16}
        containerStyle={
          [
            style.flatten([
              "flex-row",
              "padding-x-18",
              "padding-y-12",
              "justify-between",
              "items-center",
              "height-74",
            ]),
            containerStyle,
          ] as ViewStyle
        }
      >
        <View style={style.flatten(["flex-row", "items-center"]) as ViewStyle}>
          {leadingIcon ? (
            <IconButton icon={leadingIcon} backgroundBlur={false} />
          ) : null}
          <View style={style.flatten(["margin-left-10"]) as ViewStyle}>
            <Text
              style={
                [
                  style.flatten(["body3", "padding-2", "color-white"]),
                  titleStyle,
                ] as ViewStyle
              }
            >
              {title}
            </Text>
            {subtitle ? (
              <Text
                style={
                  style.flatten([
                    "body3",
                    "padding-2",
                    "color-white@60%",
                  ]) as ViewStyle
                }
              >
                {subtitle}
              </Text>
            ) : null}
          </View>
        </View>
        <View
          style={
            style.flatten([
              "flex-row",
              "justify-end",
              "flex-wrap",
              "flex-1",
            ]) as ViewStyle
          }
        >
          {trailingStart ? (
            <Text
              style={
                style.flatten([
                  "body3",
                  "color-white",
                  "font-medium",
                ]) as ViewStyle
              }
            >
              {trailingStart}
            </Text>
          ) : null}
          {trailingEnd ? (
            <Text
              style={
                style.flatten([
                  "body3",
                  "color-gray-300",
                  "font-medium",
                  "margin-left-4",
                ]) as ViewStyle
              }
            >
              {trailingEnd}
            </Text>
          ) : null}
        </View>
      </BlurBackground>
    </TouchableOpacity>
  );
};
