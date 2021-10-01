import { Platform } from "react-native";

type FontWeightNumbers =
  | "100"
  | "200"
  | "300"
  | "400"
  | "500"
  | "600"
  | "700"
  | "800"
  | "900";

type FontWeightTypes =
  | "thin"
  | "extralight"
  | "light"
  | "normal"
  | "medium"
  | "semibold"
  | "bold"
  | "extrabold"
  | "black";

const FontWeightTypesMap: { [key in FontWeightTypes]: FontWeightNumbers } = {
  thin: "100",
  extralight: "200",
  light: "300",
  normal: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
  extrabold: "800",
  black: "900",
};

export function getPlatformFontWeight(
  fontWeight: FontWeightTypes | FontWeightNumbers
): {
  fontFamily?: string;
  fontWeight: FontWeightNumbers;
} {
  if (fontWeight in FontWeightTypesMap) {
    fontWeight = FontWeightTypesMap[fontWeight as FontWeightTypes];
  }

  if (Platform.OS !== "android") {
    return { fontWeight: fontWeight as FontWeightNumbers };
  }

  switch (fontWeight) {
    case "100":
      return {
        fontFamily: "sans-serif-thin",
        fontWeight: "100",
      };
    case "200":
    // 200 doesn't exist on Android (Roboto).
    // 200 should be 300
    case "300":
      return {
        fontFamily: "sans-serif-light",
        fontWeight: "300",
      };
    case "400":
      return {
        fontFamily: "sans-serif",
        fontWeight: "400",
      };
    case "600":
    // 600 doesn't exist on Android (Roboto).
    // 600 should be 500
    case "500":
      return {
        fontFamily: "sans-serif-medium",
        fontWeight: "500",
      };
    case "800":
    // 800 doesn't exist on Android (Roboto).
    // 800 should be 700
    case "700":
      return {
        fontFamily: "sans-serif",
        fontWeight: "700",
      };
    case "900":
      return {
        fontFamily: "sans-serif-black",
        fontWeight: "900",
      };
  }

  throw new Error(`Invalid font weight: ${fontWeight}`);
}
