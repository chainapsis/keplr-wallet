import React, { FunctionComponent } from "react";
import { Text, View, ViewStyle } from "react-native";
import { useStyle } from "styles/index";
import { Button } from "components/button";

export const IconWithText: FunctionComponent<{
  icon?: React.ReactElement;
  title: string;
  subtitle: string;
  iconStyle?: ViewStyle;
  titleStyle?: ViewStyle;
  subtitleStyle?: ViewStyle;
  containerStyle?: ViewStyle;
  isComingSoon?: boolean;
}> = ({
  icon,
  title,
  subtitle,
  iconStyle,
  titleStyle,
  subtitleStyle,
  containerStyle,
  isComingSoon = false,
  children,
}) => {
  const style = useStyle();

  return (
    <View style={[style.flatten(["flex-column"]), containerStyle] as ViewStyle}>
      <View style={style.flatten(["items-center"]) as ViewStyle}>
        {icon && <View style={iconStyle}>{icon}</View>}
        {isComingSoon && (
          <Button
            text="COMING SOON"
            size="small"
            textStyle={
              style.flatten([
                "text-caption2",
                "color-white",
                "font-medium",
              ]) as ViewStyle
            }
            containerStyle={
              style.flatten([
                "background-color-indigo",
                "border-radius-4",
                "margin-16",
                "height-32",
              ]) as ViewStyle
            }
            disabled={true}
          />
        )}
        {title && (
          <Text
            style={
              [
                style.flatten([
                  "h5",
                  "items-center",
                  "color-white",
                  "text-center",
                ]),
                titleStyle,
              ] as ViewStyle
            }
          >
            {title}
          </Text>
        )}
        {subtitle && (
          <Text
            style={
              [
                style.flatten([
                  "body3",
                  "color-gray-200",
                  "padding-y-8",
                  "text-center",
                  "font-medium",
                ]),
                subtitleStyle,
              ] as ViewStyle
            }
          >
            {subtitle}
          </Text>
        )}
      </View>
      {children}
    </View>
  );
};
