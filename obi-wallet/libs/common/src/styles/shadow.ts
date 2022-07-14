import { Platform } from "react-native";

export function createShadow(shadowRadius: number) {
  return {
    ...Platform.select({
      android: {
        elevation: shadowRadius,
      },
      default: {
        shadowColor: "#000000",
        shadowRadius,
        shadowOpacity: 0.16,
      },
    }),
  };
}
