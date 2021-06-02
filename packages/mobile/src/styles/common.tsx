import { StyleProp, StyleSheet, ViewProps } from "react-native";
import { TextProps } from "react-native-elements";
import { br1, bw1, bcWhiteGrey } from "./border";
import { body2, fcError } from "./font";
import { bgcWhite, m1 } from "./layout";

export const sf = (style: (StyleProp<ViewProps> | StyleProp<TextProps>)[]) => {
  return StyleSheet.flatten(style);
};

export const cardStyle = sf([bgcWhite, bw1, br1, bcWhiteGrey]);

export const errorStyle = sf([m1, body2, fcError]);
