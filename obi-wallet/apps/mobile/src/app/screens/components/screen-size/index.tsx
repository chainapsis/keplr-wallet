import { Dimensions, Platform } from "react-native";

export const getScreenDimensions = () => {
  let SMALL_DEVICE_MAX_WIDTH;
  let SMALL_DEVICE_MAX_HEIGHT;

  if (Platform.OS === "ios") {
    SMALL_DEVICE_MAX_WIDTH = 375;
    SMALL_DEVICE_MAX_HEIGHT = 667;
  } else {
    SMALL_DEVICE_MAX_WIDTH = 375;
    SMALL_DEVICE_MAX_HEIGHT = 685;
  }

  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } =
    Dimensions.get("window");

  return {
    SCREEN_WIDTH,
    SCREEN_HEIGHT,
    SMALL_DEVICE_MAX_WIDTH,
    SMALL_DEVICE_MAX_HEIGHT,
  };
};

export const isSmallScreenNumber = (
  smallScreenValue: number,
  defaultScreenValue: number
) => {
  if (
    getScreenDimensions().SCREEN_WIDTH <=
      getScreenDimensions().SMALL_DEVICE_MAX_WIDTH ||
    getScreenDimensions().SCREEN_HEIGHT <=
      getScreenDimensions().SMALL_DEVICE_MAX_HEIGHT
  ) {
    return smallScreenValue;
  } else {
    return defaultScreenValue;
  }
};

export const isSmallScreenSubstr = (
  string: string,
  substr_placeholder: string,
  stringcutvalue_smallScreen: number,
  stringcutvalue_defaultScreen: number
) => {
  if (
    getScreenDimensions().SCREEN_WIDTH <=
    getScreenDimensions().SMALL_DEVICE_MAX_WIDTH
  ) {
    if (string.length > stringcutvalue_smallScreen) {
      return (
        string.substring(0, stringcutvalue_smallScreen - 3) + substr_placeholder
      );
    } else {
      return string;
    }
  } else {
    if (string.length > stringcutvalue_defaultScreen) {
      return (
        string.substring(0, stringcutvalue_defaultScreen - 3) +
        substr_placeholder
      );
    } else {
      return string;
    }
  }
};
