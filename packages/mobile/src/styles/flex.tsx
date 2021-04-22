import { StyleProp, ViewStyle } from "react-native";

export const flex1: StyleProp<ViewStyle> = { flex: 1 };

export const flexDirectionRow: StyleProp<ViewStyle> = { flexDirection: "row" };

export const flexDirectionRowReverse: StyleProp<ViewStyle> = {
  flexDirection: "row-reverse",
};

export const justifyContentCenter: StyleProp<ViewStyle> = {
  justifyContent: "center",
};

export const justifyContentBetween: StyleProp<ViewStyle> = {
  justifyContent: "space-between",
};

export const justifyContentEnd: StyleProp<ViewStyle> = {
  justifyContent: "flex-end",
};

export const alignItemsCenter: StyleProp<ViewStyle> = {
  alignItems: "center",
};
