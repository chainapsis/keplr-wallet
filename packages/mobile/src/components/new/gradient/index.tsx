import { DimensionValue, StyleSheet, View, ViewProps } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import React, { FunctionComponent } from "react";

type GradientProps = {
  fromColor: string;
  toColor: string;
  children?: any;
  height?: DimensionValue;
  opacityColor1?: number;
  opacityColor2?: number;
} & ViewProps;

export const Gradient: FunctionComponent<GradientProps> = (props) => {
  const {
    children,
    fromColor,
    toColor,
    height = "100%",
    opacityColor1 = 1,
    opacityColor2 = 1,
    ...otherViewProps
  } = props;
  const gradientUniqueId = `grad${fromColor}+${toColor}`.replace(
    /[^a-zA-Z0-9 ]/g,
    ""
  );
  return (
    <React.Fragment>
      <View
        style={[
          StyleSheet.absoluteFillObject,
          { height, zIndex: -1 },
          otherViewProps.style,
        ]}
        {...otherViewProps}
      >
        <Svg height="100%" width="100%" style={StyleSheet.absoluteFillObject}>
          <Defs>
            <LinearGradient
              id={gradientUniqueId}
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <Stop
                offset="0"
                stopColor={fromColor}
                stopOpacity={opacityColor1}
              />
              <Stop
                offset="1"
                stopColor={toColor}
                stopOpacity={opacityColor2}
              />
            </LinearGradient>
          </Defs>
          <Rect width="100%" height="100%" fill={`url(#${gradientUniqueId})`} />
        </Svg>
      </View>
      {children}
    </React.Fragment>
  );
};
