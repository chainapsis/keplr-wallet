import React, { FunctionComponent } from "react";
import { useStyle } from "../../../styles";
import { StyleSheet, Text, TextStyle, View, ViewStyle } from "react-native";
import { RectButton } from "../../../components/rect-button";
import Svg, { Path } from "react-native-svg";

export const KeyStoreSectionTitle: FunctionComponent<{
  title: string;
}> = ({ title }) => {
  const style = useStyle();

  return (
    <View
      style={style.flatten([
        "padding-x-20",
        "padding-top-16",
        "padding-bottom-12",
        "margin-top-16",
        "background-color-white",
      ])}
    >
      <Text
        style={style.flatten([
          "text-caption1",
          "color-text-black-low",
          "uppercase",
        ])}
      >
        {title}
      </Text>
    </View>
  );
};

export const WalletIcon: FunctionComponent<{
  color: string;
  height: number;
}> = ({ color, height }) => {
  return (
    <Svg
      fill="none"
      viewBox="0 0 44 45"
      style={{
        height,
        aspectRatio: 44 / 45,
      }}
    >
      <Path
        fill={color}
        fillRule="evenodd"
        d="M26.15 13c-.318 0-.691.065-1.202.2-1.284.339-8.813 2.421-8.925 2.455-1.117.42-1.824.834-2.268 1.32a3.253 3.253 0 011.841-.573H27.55v-1.428c0-.69-.005-1.974-1.4-1.974zm-10.544 4.256c-1.593 0-2.571 1.492-2.571 2.561v9.125a2.411 2.411 0 002.41 2.402h13.18a2.41 2.41 0 002.41-2.402V19.75c0-1.305-1.226-2.494-2.572-2.494H15.607zM28.831 24.3a1.067 1.067 0 10-2.135 0 1.067 1.067 0 002.135 0z"
        clipRule="evenodd"
      />
    </Svg>
  );
};

export const KeyStoreItem: FunctionComponent<{
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  paragraphStyle?: TextStyle;
  defaultRightWalletIconStyle?: ViewStyle;

  label: string;
  paragraph?: string;
  left?: React.ReactElement;
  right?: React.ReactElement;

  onPress?: () => void;

  topBorder?: boolean;
  bottomBorder?: boolean;
}> = ({
  containerStyle,
  labelStyle,
  paragraphStyle,
  defaultRightWalletIconStyle,
  label,
  paragraph,
  left,
  right,
  onPress,
  topBorder,
  bottomBorder = true,
}) => {
  const style = useStyle();

  const renderChildren = () => {
    return (
      <React.Fragment>
        {left ? (
          left
        ) : (
          <View
            style={StyleSheet.flatten([
              style.flatten(["margin-right-16"]),
              defaultRightWalletIconStyle,
            ])}
          >
            <WalletIcon
              color={style.get("color-text-black-medium").color}
              height={45}
            />
          </View>
        )}
        <View>
          <Text
            style={StyleSheet.flatten([
              style.flatten(["h5", "color-text-black-high"]),
              labelStyle,
            ])}
          >
            {label}
          </Text>
          {paragraph ? (
            <Text
              style={StyleSheet.flatten([
                style.flatten([
                  "subtitle3",
                  "color-text-black-low",
                  "margin-top-4",
                ]),
                paragraphStyle,
              ])}
            >
              {paragraph}
            </Text>
          ) : null}
        </View>
        <View style={style.flatten(["flex-1"])} />
        {right}
      </React.Fragment>
    );
  };

  return (
    <View style={style.flatten(["background-color-white"])}>
      {topBorder ? (
        <View
          style={style.flatten([
            "height-1",
            "margin-x-20",
            "background-color-border-white",
          ])}
        />
      ) : null}
      {onPress ? (
        <RectButton
          style={StyleSheet.flatten([
            style.flatten([
              "height-87",
              "flex-row",
              "items-center",
              "padding-x-20",
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
              "height-87",
              "flex-row",
              "items-center",
              "padding-x-20",
            ]),
            containerStyle,
          ])}
        >
          {renderChildren()}
        </View>
      )}
      {bottomBorder ? (
        <View
          style={style.flatten([
            "height-1",
            "margin-x-20",
            "background-color-border-white",
          ])}
        />
      ) : null}
    </View>
  );
};
