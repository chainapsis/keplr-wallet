import { StyleProp, StyleSheet, ViewProps } from "react-native";
import { TextProps } from "react-native-elements";
import { bw0, br1 } from "./border";
import { body2, fcError } from "./font";
import { bgcWhite, mx0, m1, my0 } from "./layout";

export const sf = (style: (StyleProp<ViewProps> | StyleProp<TextProps>)[]) => {
  return StyleSheet.flatten(style);
};

export const cardStyle = sf([bgcWhite, mx0, my0, bw0, br1]);

export const errorStyle = sf([m1, body2, fcError]);
