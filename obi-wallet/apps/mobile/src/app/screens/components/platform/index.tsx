import { Platform } from "react-native";

export const differentiateOS = (ios: any, android: any) => {
  if (Platform.OS === "ios") {
    return ios;
  } else {
    return android;
  }
};
