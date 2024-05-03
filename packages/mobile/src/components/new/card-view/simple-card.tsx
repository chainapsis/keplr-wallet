import React, { FunctionComponent, ReactElement } from "react";
import { Text, View, ViewStyle } from "react-native";
import { useStyle } from "styles/index";
import { BlurBackground } from "components/new/blur-background/blur-background";
import { LinearGradientText } from "react-native-linear-gradient-text";

export type HeadingMode = "normal" | "gradient";

export const SimpleCardView: FunctionComponent<{
  trailingIconComponent?: ReactElement | (() => ReactElement);
  mainHeading?: string;
  heading: string;
  headingStyle?: ViewStyle;
  headingMode?: HeadingMode;
  subHeading?: string;
  cardStyle?: ViewStyle;
  text?: string;
}> = ({
  trailingIconComponent,
  mainHeading,
  heading,
  headingStyle,
  headingMode = "normal",
  subHeading,
  cardStyle,
}) => {
  const style = useStyle();

  return (
    <React.Fragment>
      {mainHeading ? (
        <Text
          style={
            style.flatten([
              "text-button3",
              "padding-4",
              "color-gray-200",
            ]) as ViewStyle
          }
        >
          {mainHeading}
        </Text>
      ) : null}

      <BlurBackground
        borderRadius={12}
        blurIntensity={16}
        containerStyle={
          [
            style.flatten([
              "flex-row",
              "padding-x-18",
              "padding-y-12",
              "items-center",
            ]),
            cardStyle,
          ] as ViewStyle
        }
      >
        <View style={style.flatten(["flex-8"]) as ViewStyle}>
          {headingMode === "normal" ? (
            <Text
              style={
                [
                  style.flatten([
                    "h6",
                    "padding-4",
                    "color-white",
                    "font-normal",
                  ]),
                  headingStyle,
                ] as ViewStyle
              }
            >
              {heading}
            </Text>
          ) : (
            <LinearGradientText
              colors={["#F9774B", "#CF447B"]}
              start={{ x: 0, y: 1 }}
              end={{ x: 1, y: 0 }}
              text={heading}
              textStyle={
                [style.flatten(["h7", "padding-4"]), headingStyle] as ViewStyle
              }
            />
          )}
          {subHeading ? (
            <Text
              style={
                style.flatten([
                  "text-caption1",
                  "padding-4",
                  "color-gray-200",
                ]) as ViewStyle
              }
            >
              {subHeading}
            </Text>
          ) : null}
        </View>
        {trailingIconComponent ? (
          <View style={[style.flatten(["flex-1", "items-end"])] as ViewStyle}>
            {trailingIconComponent}
          </View>
        ) : null}
      </BlurBackground>
    </React.Fragment>
  );
};
