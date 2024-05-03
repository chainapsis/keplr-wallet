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

export function getPlatformFontFamily(
  fontWeight: FontWeightTypes | FontWeightNumbers
) {
  let font: string;

  switch (fontWeight) {
    case "100":
      font = "Lexend-Thin";
      break;
    case "200":
    // 200 doesn't exist on Android (Roboto).
    // 200 should be 300
    case "300":
      font = "Lexend-Light";
      break;

    case "600":
    // 600 doesn't exist on Android (Roboto).
    // 600 should be 500
    case "500":
      font = "Lexend-Medium";
      break;
    case "800":
    // 800 doesn't exist on Android (Roboto).
    // 800 should be 700
    case "700":
      font = "Lexend-Regular";
      break;
    case "900":
      font = "Lexend-Black";
      break;

    case "400":
    default:
      font = "Lexend-Regular";
      break;
  }

  return font;
}

export function getPlatformFontWeight(
  fontWeight: FontWeightTypes | FontWeightNumbers
): {
  fontFamily?: string;
  fontWeight: FontWeightNumbers;
} {
  if (fontWeight in FontWeightTypesMap) {
    fontWeight = FontWeightTypesMap[fontWeight as FontWeightTypes];
  }

  switch (fontWeight) {
    case "100":
      return {
        fontFamily: "Lexend-Thin",
        fontWeight: "100",
      };
    case "200":
    // 200 doesn't exist on Android (Roboto).
    // 200 should be 300
    case "300":
      return {
        fontFamily: "Lexend-Light",
        fontWeight: "300",
      };
    case "400":
      return {
        fontFamily: "Lexend-Regular",
        fontWeight: "400",
      };
    case "600":
    // 600 doesn't exist on Android (Roboto).
    // 600 should be 500
    case "500":
      return {
        fontFamily: "Lexend-Medium",
        fontWeight: "500",
      };
    case "800":
    // 800 doesn't exist on Android (Roboto).
    // 800 should be 700
    case "700":
      return {
        fontFamily: "Lexend-Regular",
        fontWeight: "700",
      };
    case "900":
      return {
        fontFamily: "Lexend-Black",
        fontWeight: "900",
      };
  }

  throw new Error(`Invalid font weight: ${fontWeight}`);
}
