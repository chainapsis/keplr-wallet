import { StyleProp, ViewStyle } from "react-native";
import { colors } from "./colors";

export const bw0: StyleProp<ViewStyle> = { borderWidth: 0 };

export const bw1: StyleProp<ViewStyle> = { borderWidth: 1 };

export const bw2: StyleProp<ViewStyle> = { borderWidth: 2 };

export const bbw0: StyleProp<ViewStyle> = { borderBottomWidth: 0 };

export const bbw1: StyleProp<ViewStyle> = { borderBottomWidth: 1 };

export const btw0: StyleProp<ViewStyle> = { borderTopWidth: 0 };

export const btw1: StyleProp<ViewStyle> = { borderTopWidth: 1 };

export const blw0: StyleProp<ViewStyle> = { borderLeftWidth: 0 };

export const blw1: StyleProp<ViewStyle> = { borderLeftWidth: 1 };

export const brw0: StyleProp<ViewStyle> = { borderRightWidth: 0 };

export const brw1: StyleProp<ViewStyle> = { borderRightWidth: 1 };

export const br0: StyleProp<ViewStyle> = { borderRadius: 0 };

export const br1: StyleProp<ViewStyle> = { borderRadius: 6 };

export const br2: StyleProp<ViewStyle> = { borderRadius: 12 };

export const br3: StyleProp<ViewStyle> = { borderRadius: 50 };

export const bcDefault: StyleProp<ViewStyle> = { borderColor: colors.default };

export const bcBlack: StyleProp<ViewStyle> = { borderColor: colors.black };

export const bcWhite: StyleProp<ViewStyle> = { borderColor: colors.white };

export const bcPrimary: StyleProp<ViewStyle> = { borderColor: colors.primary };

export const bcSecondary: StyleProp<ViewStyle> = {
  borderColor: colors.secondary,
};

export const bcWarining: StyleProp<ViewStyle> = { borderColor: colors.warning };

export const bcError: StyleProp<ViewStyle> = { borderColor: colors.error };

export const bcSuccess: StyleProp<ViewStyle> = { borderColor: colors.success };

export const bcGray: StyleProp<ViewStyle> = { borderColor: colors.grey5 };
