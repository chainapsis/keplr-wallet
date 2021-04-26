import { StyleProp, ViewStyle } from "react-native";
import { Platform } from "react-native";
import { colors } from "./colors";

export const m0: StyleProp<ViewStyle> = { margin: 0 };

export const m1: StyleProp<ViewStyle> = { margin: 4 };

export const m2: StyleProp<ViewStyle> = { margin: 8 };

export const m3: StyleProp<ViewStyle> = { margin: 12 };

export const m4: StyleProp<ViewStyle> = { margin: 16 };

export const mx0: StyleProp<ViewStyle> = { marginHorizontal: 0 };

export const mx1: StyleProp<ViewStyle> = { marginHorizontal: 4 };

export const mx2: StyleProp<ViewStyle> = { marginHorizontal: 8 };

export const mx3: StyleProp<ViewStyle> = { marginHorizontal: 12 };

export const mx4: StyleProp<ViewStyle> = { marginHorizontal: 16 };

export const my0: StyleProp<ViewStyle> = { marginVertical: 0 };

export const my1: StyleProp<ViewStyle> = { marginVertical: 4 };

export const my2: StyleProp<ViewStyle> = { marginVertical: 8 };

export const my3: StyleProp<ViewStyle> = { marginVertical: 12 };

export const my4: StyleProp<ViewStyle> = { marginVertical: 16 };

export const mt0: StyleProp<ViewStyle> = { marginTop: 0 };

export const mt1: StyleProp<ViewStyle> = { marginTop: 4 };

export const mt2: StyleProp<ViewStyle> = { marginTop: 8 };

export const mt3: StyleProp<ViewStyle> = { marginTop: 12 };

export const mt4: StyleProp<ViewStyle> = { marginTop: 16 };

export const mb0: StyleProp<ViewStyle> = { marginBottom: 0 };

export const mb1: StyleProp<ViewStyle> = { marginBottom: 4 };

export const mb2: StyleProp<ViewStyle> = { marginBottom: 8 };

export const mb3: StyleProp<ViewStyle> = { marginBottom: 12 };

export const mb4: StyleProp<ViewStyle> = { marginBottom: 16 };

export const ml0: StyleProp<ViewStyle> = { marginLeft: 0 };

export const ml1: StyleProp<ViewStyle> = { marginLeft: 4 };

export const ml2: StyleProp<ViewStyle> = { marginLeft: 8 };

export const ml3: StyleProp<ViewStyle> = { marginLeft: 12 };

export const ml4: StyleProp<ViewStyle> = { marginLeft: 16 };

export const mr0: StyleProp<ViewStyle> = { marginRight: 0 };

export const mr1: StyleProp<ViewStyle> = { marginRight: 4 };

export const mr2: StyleProp<ViewStyle> = { marginRight: 8 };

export const mr3: StyleProp<ViewStyle> = { marginRight: 12 };

export const mr4: StyleProp<ViewStyle> = { marginRight: 16 };

export const p0: StyleProp<ViewStyle> = { padding: 0 };

export const p1: StyleProp<ViewStyle> = { padding: 4 };

export const p2: StyleProp<ViewStyle> = { padding: 8 };

export const p3: StyleProp<ViewStyle> = { padding: 12 };

export const p4: StyleProp<ViewStyle> = { padding: 16 };

export const px0: StyleProp<ViewStyle> = { paddingHorizontal: 0 };

export const px1: StyleProp<ViewStyle> = { paddingHorizontal: 4 };

export const px2: StyleProp<ViewStyle> = { paddingHorizontal: 8 };

export const px3: StyleProp<ViewStyle> = { paddingHorizontal: 12 };

export const px4: StyleProp<ViewStyle> = { paddingHorizontal: 16 };

export const py0: StyleProp<ViewStyle> = { paddingVertical: 0 };

export const py1: StyleProp<ViewStyle> = { paddingVertical: 4 };

export const py2: StyleProp<ViewStyle> = { paddingVertical: 8 };

export const py3: StyleProp<ViewStyle> = { paddingVertical: 12 };

export const py4: StyleProp<ViewStyle> = { paddingVertical: 16 };

export const py5: StyleProp<ViewStyle> = { paddingVertical: 20 };

export const py6: StyleProp<ViewStyle> = { paddingVertical: 24 };

export const pt0: StyleProp<ViewStyle> = { paddingTop: 0 };

export const pt1: StyleProp<ViewStyle> = { paddingTop: 4 };

export const pt2: StyleProp<ViewStyle> = { paddingTop: 8 };

export const pt3: StyleProp<ViewStyle> = { paddingTop: 12 };

export const pt4: StyleProp<ViewStyle> = { paddingTop: 16 };

export const pt5: StyleProp<ViewStyle> = { paddingTop: 20 };

export const pt6: StyleProp<ViewStyle> = { paddingTop: 24 };

export const pb0: StyleProp<ViewStyle> = { paddingBottom: 0 };

export const pb1: StyleProp<ViewStyle> = { paddingBottom: 4 };

export const pb2: StyleProp<ViewStyle> = { paddingBottom: 8 };

export const pb3: StyleProp<ViewStyle> = { paddingBottom: 12 };

export const pb4: StyleProp<ViewStyle> = { paddingBottom: 16 };

export const pb5: StyleProp<ViewStyle> = { paddingBottom: 20 };

export const pb6: StyleProp<ViewStyle> = { paddingBottom: 24 };

export const shadow: StyleProp<ViewStyle> = Platform.select({
  ios: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  android: {
    elevation: 2,
  },
});

export const bgcWhite: StyleProp<ViewStyle> = {
  backgroundColor: "#fff",
  opacity: 0.9,
};

export const bgcGray: StyleProp<ViewStyle> = {
  backgroundColor: "#e9ecef",
  opacity: 1,
};

export const bgcPrimary: StyleProp<ViewStyle> = {
  backgroundColor: colors.primary,
};

export const bgcPrimary50: StyleProp<ViewStyle> = {
  backgroundColor: colors.primary50,
};

export const bgcPrimary100: StyleProp<ViewStyle> = {
  backgroundColor: colors.primary100,
};

export const bgcPrimary200: StyleProp<ViewStyle> = {
  backgroundColor: colors.primary200,
};

export const bgcPrimary300: StyleProp<ViewStyle> = {
  backgroundColor: colors.primary300,
};

export const bgcPrimary400: StyleProp<ViewStyle> = {
  backgroundColor: colors.primary400,
};

export const bgcPrimary500: StyleProp<ViewStyle> = {
  backgroundColor: colors.primary500,
};

export const bgcPrimary600: StyleProp<ViewStyle> = {
  backgroundColor: colors.primary600,
};

export const bgcPrimary700: StyleProp<ViewStyle> = {
  backgroundColor: colors.primary700,
};

export const bgcPrimary800: StyleProp<ViewStyle> = {
  backgroundColor: colors.primary800,
};

export const bgcPrimary900: StyleProp<ViewStyle> = {
  backgroundColor: colors.primary900,
};

export const bgcSecondary: StyleProp<ViewStyle> = {
  backgroundColor: colors.secondary,
};

export const bgcSecondary50: StyleProp<ViewStyle> = {
  backgroundColor: colors.secondary50,
};

export const bgcSecondary100: StyleProp<ViewStyle> = {
  backgroundColor: colors.secondary100,
};

export const bgcSecondary200: StyleProp<ViewStyle> = {
  backgroundColor: colors.secondary200,
};

export const bgcSecondary300: StyleProp<ViewStyle> = {
  backgroundColor: colors.secondary300,
};

export const bgcSecondary400: StyleProp<ViewStyle> = {
  backgroundColor: colors.secondary400,
};

export const bgcSecondary500: StyleProp<ViewStyle> = {
  backgroundColor: colors.secondary500,
};

export const bgcSecondary600: StyleProp<ViewStyle> = {
  backgroundColor: colors.secondary600,
};

export const bgcSecondary700: StyleProp<ViewStyle> = {
  backgroundColor: colors.secondary700,
};

export const bgcSecondary800: StyleProp<ViewStyle> = {
  backgroundColor: colors.secondary800,
};

export const bgcSecondary900: StyleProp<ViewStyle> = {
  backgroundColor: colors.secondary900,
};

export const bgcWarining: StyleProp<ViewStyle> = {
  backgroundColor: colors.warning,
};

export const bgcError: StyleProp<ViewStyle> = { backgroundColor: colors.error };

export const bgcSuccess: StyleProp<ViewStyle> = {
  backgroundColor: colors.success,
};

export const absolute: StyleProp<ViewStyle> = {
  position: "absolute",
};

export const relative: StyleProp<ViewStyle> = {
  position: "relative",
};

export const absoluteLayout: StyleProp<ViewStyle> = {
  position: "absolute",
  left: 0,
  top: 0,
  width: "100%",
  height: "100%",
};
