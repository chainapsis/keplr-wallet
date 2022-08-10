import { createStyleProvider } from "./builder";
import { EnumTextTransform, EnumTextDecorationLine } from "./builder/types";
import { Platform, StatusBarStyle } from "react-native";
import { getPlatformFontWeight } from "./builder/utils";
import { BlurViewProperties } from "@react-native-community/blur";

export const ColorPalette = {
  "blue-10": "#F6F8FF",
  "blue-50": "#F0F3FF",
  "blue-100": "#E4E9FF",
  "blue-200": "#9DACF4",
  "blue-300": "#536EF8",
  "blue-400": "#314FDF",
  "blue-500": "#1B319E",
  "blue-600": "#1E2C70",
  "blue-700": "#0D1749",
  "blue-800": "#051124",

  "platinum-10": "#F7F9FC",
  "platinum-50": "#EFF3FA",
  "platinum-100": "#CBD3DF",
  "platinum-200": "#95A1B4",
  "platinum-300": "#566172",
  "platinum-400": "#323C4A",
  "platinum-500": "#252E3D",
  "platinum-600": "#121924",
  "platinum-700": "#0A101C",

  "green-50": "#ECFDF6",
  "green-100": "#DBF9EC",
  "green-200": "#AAECD0",
  "green-300": "#68EAB2",
  "green-400": "#2DD98F",
  "green-500": "#22AC71",
  "green-600": "#136844",

  "red-50": "#FFF7F8",
  "red-100": "#FFD8E0",
  "red-200": "#FC91A6",
  "red-300": "#FD5778",
  "red-400": "#F5365C",
  "red-500": "#BF2342",
  "red-600": "#911830",
  "red-700": "#440B17",

  "pink-50": "#FDF4F9",
  "pink-100": "#FFE9F4",
  "pink-200": "#FFCFE7",
  "pink-300": "#F891C4",
  "pink-400": "#FF6BB8",

  "purple-50": "#FBF8FF",
  "purple-100": "#F7F0FF",
  "purple-200": "#E4D3FD",
  "purple-300": "#C198FF",
  "purple-400": "#864FFC",
  // purple 500~700 not exist yet. But, can be added in the future.
  "purple-800": "#0A0314",

  white: "#FFFFFF",

  "gray-10": "#F8F9FC",
  "gray-50": "#F2F2F7",
  "gray-100": "#DCDCE3",
  "gray-200": "#C6C6CD",
  "gray-300": "#9A9AA2",
  "gray-400": "#64646D",
  "gray-500": "#37373E",
  "gray-600": "#1E1E24",
  "gray-700": "#09090A",

  black: "#000000",

  transparent: "rgba(255,255,255,0)",
};

export const TextColors = {
  "text-highest": ColorPalette["black"],
  "text-high": ColorPalette["platinum-700"],
  "text-middle": ColorPalette["platinum-400"],
  "text-low": ColorPalette["gray-300"],
  "text-label": ColorPalette["platinum-300"],
};

export const DarkThemeTextColors = {
  "text-highest": ColorPalette["white"],
  "text-high": ColorPalette["platinum-50"],
  "text-middle": ColorPalette["platinum-100"],
  "text-low": ColorPalette["platinum-200"],
  "text-label": ColorPalette["platinum-100"],
};

export const BackgroundColors = {
  card: "rgba(255, 255, 255, 0.95)",
  "background-secondary": ColorPalette["gray-10"],
  // The background tertiary has a color that is distinct with the inputs.
  // Used in card modal or screen where input exists.
  "background-tertiary": ColorPalette["gray-10"],
};

export const DarkThemeBackgroundColors = {
  // Platinum600 95%
  card: "rgba(18, 25, 36, 0.95)",
  "background-secondary": ColorPalette["platinum-700"],
  "background-tertiary": ColorPalette["platinum-600"],
};

export const ProfileColors = {
  "profile-sky-blue": "#80CAFF",
  "profile-mint": "#47DDE7",
  "profile-green": "#78F0C5",
  "profile-yellow-green": "#ADE353",
  "profile-purple": "#D378FE",
  "profile-red": "#FF6D88",
  "profile-orange": "#FEC078",
  "profile-yellow": "#F2ED64",
};

export const {
  StyleProvider,
  useStyle,
  useStyleThemeController,
} = createStyleProvider(
  {
    themes: ["dark"] as const,
    custom: {
      h1: {
        fontSize: 32,
        lineHeight: 56,
        letterSpacing: 0.3,
        ...getPlatformFontWeight("700"),
      },
      h2: {
        fontSize: 28,
        lineHeight: 36,
        letterSpacing: 0.3,
        ...getPlatformFontWeight("700"),
      },
      h3: {
        fontSize: 24,
        lineHeight: 32,
        letterSpacing: 0.3,
        ...getPlatformFontWeight("700"),
      },
      h4: {
        fontSize: 20,
        lineHeight: 28,
        letterSpacing: 0.3,
        ...getPlatformFontWeight("600"),
      },
      h5: {
        fontSize: 18,
        lineHeight: 24,
        letterSpacing: 0.3,
        ...getPlatformFontWeight("600"),
      },
      h6: {
        fontSize: 16,
        lineHeight: 22,
        letterSpacing: 0.2,
        ...getPlatformFontWeight("600"),
      },
      h7: {
        fontSize: 14,
        lineHeight: 20,
        letterSpacing: 0.2,
        ...getPlatformFontWeight("600"),
      },
      subtitle1: {
        fontSize: 18,
        lineHeight: 24,
        ...getPlatformFontWeight("500"),
      },
      subtitle2: {
        fontSize: 16,
        lineHeight: 22,
        ...getPlatformFontWeight("500"),
      },
      subtitle3: {
        fontSize: 14,
        lineHeight: 21,
        letterSpacing: 0.1,
        ...getPlatformFontWeight("500"),
      },
      body1: {
        fontSize: 18,
        lineHeight: 26,
        ...getPlatformFontWeight("400"),
      },
      body2: {
        fontSize: 16,
        lineHeight: 22,
        letterSpacing: 0.1,
        ...getPlatformFontWeight("400"),
      },
      body3: {
        fontSize: 14,
        lineHeight: 20,
        letterSpacing: 0.1,
        ...getPlatformFontWeight("400"),
      },
      "text-button1": {
        fontSize: 18,
        lineHeight: 20,
        letterSpacing: 0.2,
        ...getPlatformFontWeight("600"),
      },
      "text-button2": {
        fontSize: 16,
        lineHeight: 19,
        letterSpacing: 0.2,
        ...getPlatformFontWeight("600"),
      },
      "text-button3": {
        fontSize: 14,
        lineHeight: 18,
        letterSpacing: 0.2,
        textTransform: "capitalize" as EnumTextTransform,
        ...getPlatformFontWeight("600"),
      },
      "text-caption1": {
        fontSize: 13,
        lineHeight: 18,
        letterSpacing: 0.3,
        ...getPlatformFontWeight("400"),
      },
      "text-caption2": {
        fontSize: 12,
        lineHeight: 18,
        letterSpacing: 0.3,
        ...getPlatformFontWeight("400"),
      },
      "text-overline": {
        fontSize: 11,
        lineHeight: 16,
        letterSpacing: 0.5,
        textTransform: "uppercase" as EnumTextTransform,
        ...getPlatformFontWeight("400"),
      },
      "text-underline": {
        textDecorationLine: "underline" as EnumTextDecorationLine,
      },
      // This style is for the text input and aims to mock the body2 style.
      // In IOS, it is hard to position the input text to the middle vertically.
      // So, to solve this problem, decrease the line height and add the additional vertical padding.
      "body2-in-text-input": Platform.select({
        ios: {
          fontSize: 16,
          lineHeight: 19,
          letterSpacing: 0.25,
          paddingTop: 1.5,
          paddingBottom: 1.5,
          ...getPlatformFontWeight("400"),
        },
        android: {
          fontSize: 16,
          lineHeight: 22,
          letterSpacing: 0.25,
          ...getPlatformFontWeight("400"),
        },
      }),
      "background-gradient": {
        degree: 90,
        stops: [
          {
            offset: "0%",
            color: ColorPalette["purple-50"],
          },
          {
            offset: "100%",
            color: ColorPalette["blue-10"],
          },
        ],
      },

      "status-bar-style": "dark-content" as StatusBarStyle,

      "header-on-gradient-screen": {
        blurOnIOS: {
          type: "light" as BlurViewProperties["blurType"],
          amount: 30,
          reducedTransparencyFallbackColor: "white",
          minOpacity: 0.4,
        },
        bottomBorderOnAndroid: {
          color: ColorPalette["gray-50"],
          width: 0.5,
        },
        background: BackgroundColors["card"],
      },
      "header-on-secondary-screen": {
        blurOnIOS: {
          type: "light" as BlurViewProperties["blurType"],
          amount: 30,
          reducedTransparencyFallbackColor: "white",
          minOpacity: 0.4,
        },
        bottomBorderOnAndroid: {
          color: ColorPalette["gray-50"],
          width: 0.5,
        },
        background: "white",
      },
      "header-at-secondary-screen": {
        blurOnIOS: {
          type: "light" as BlurViewProperties["blurType"],
          amount: 30,
          reducedTransparencyFallbackColor: "white",
          minOpacity: 0.4,
        },
        bottomBorderOnAndroid: {
          color: "white",
          width: 0,
        },
        background: BackgroundColors["background-secondary"],
      },
      "header-on-tertiary-screen": {
        blurOnIOS: {
          type: "light" as BlurViewProperties["blurType"],
          amount: 30,
          reducedTransparencyFallbackColor: "white",
          minOpacity: 0.4,
        },
        bottomBorderOnAndroid: {
          color: "white",
          width: 0,
        },
        background: BackgroundColors["background-tertiary"],
      },

      "blurred-tabbar-blur-type": "light" as BlurViewProperties["blurType"],
      "blurred-tabbar-blur-amount": 40,
      "blurred-tabbar-reducedTransparencyFallbackColor": "white",
      "blurred-tabbar-top-border": ColorPalette["gray-50"],

      "unlock-screen-gradient-background": {
        degree: 168,
        stops: [
          {
            offset: "0%",
            color: "#F8F8FF",
          },
          {
            offset: "60%",
            color: "#ECEEFC",
          },
          {
            offset: "100%",
            color: "#E3E4FF",
          },
        ],
      },

      "tx-result-screen-pending-gradient-background": {
        degree: 168,
        stops: [
          {
            offset: "0%",
            color: "#E3E4FF",
          },
          {
            offset: "50%",
            color: "#FFFFFF",
          },
        ],
      },

      "tx-result-screen-success-gradient-background": {
        degree: 168,
        stops: [
          {
            offset: "0%",
            color: "#F4FFFB",
          },
          {
            offset: "46%",
            color: "#FFFFFF",
          },
        ],
      },

      "tx-result-screen-failed-gradient-background": {
        degree: 168,
        stops: [
          {
            offset: "0%",
            color: "#FFF4F4",
          },
          {
            offset: "50%",
            color: "#FFFFFF",
          },
        ],
      },
    },
    colors: {
      ...ColorPalette,
      ...ProfileColors,
      ...TextColors,
      ...BackgroundColors,
      ...{
        "blurred-tabbar-background": BackgroundColors["card"],

        // Belows are for the button props and may not be used as styles.
        "rect-button-default-ripple": ColorPalette["gray-100"],
        // Active opacity is 0.2 by default.
        "rect-button-default-underlay": ColorPalette["gray-300"],

        // Belows are for the loading spinner props and may not be used as styles.
        "loading-spinner": "#BABAC1",
      },
    },
    widths: {
      full: "100%",
      half: "50%",
      "1": 1,
      "4": 4,
      "8": 8,
      "12": 12,
      "16": 16,
      "20": 20,
      "24": 24,
      "32": 32,
      "34": 34,
      "36": 36,
      "38": 38,
      "40": 40,
      "44": 44,
      "54": 54,
      "56": 56,
      "58": 58,
      "72": 72,
      "80": 80,
      "122": 122,
      "160": 160,
      "240": 240,
      "292": 292,
      "300": 300,

      "card-gap": 12,
      "page-pad": 20,
    },
    heights: {
      full: "100%",
      half: "50%",
      "0.5": 0.5,
      "1": 1,
      "4": 4,
      "5": 5,
      "8": 8,
      "12": 12,
      "16": 16,
      "18": 18,
      "20": 20,
      "24": 24,
      "30": 30,
      "32": 32,
      "36": 36,
      "38": 38,
      "40": 40,
      "44": 44,
      "50": 50,
      "56": 56,
      "58": 58,
      "62": 62,
      "66": 66,
      "64": 64,
      "72": 72,
      "74": 74,
      "80": 80,
      "83": 83,
      "84": 84,
      "87": 87,
      "90": 90,
      "104": 104,
      "116": 116,
      "122": 122,
      "214": 214,
      "400": 400,
      "600": 600,

      "button-small": 38,
      "button-default": 48,
      "button-large": 52,
      "governance-card-body-placeholder": 130,

      "card-gap": 12,
      "page-pad": 20,
    },
    paddingSizes: {
      "0": 0,
      "1": 1,
      "2": 2,
      "3": 3,
      "4": 4,
      "5": 5,
      "6": 6,
      "8": 8,
      "10": 10,
      "11": 11,
      "12": 12,
      "14": 14,
      "15": 15,
      "16": 16,
      "18": 18,
      "20": 20,
      "22": 22,
      "24": 24,
      "25.5": 25.5,
      "26": 26,
      "28": 28,
      "31": 31,
      "32": 32,
      "36": 36,
      "38": 38,
      "40": 40,
      "42": 42,
      "48": 48,
      "52": 52,
      "64": 64,
      "66": 66,

      page: 20,
      "card-horizontal": 20,
      "card-vertical": 20,
      "card-vertical-half": 10,
      "card-gap": 12,
    },
    marginSizes: {
      "0": 0,
      "1": 1,
      "2": 2,
      "3": 3,
      "4": 4,
      "6": 6,
      "8": 8,
      "10": 10,
      "12": 12,
      "14": 14,
      "15": 15,
      "16": 16,
      "18": 18,
      "20": 20,
      "21": 21,
      "24": 24,
      "28": 28,
      "30": 30,
      "32": 32,
      "34": 34,
      "38": 38,
      "40": 40,
      "44": 44,
      "46": 46,
      "48": 48,
      "58": 58,
      "64": 64,
      "68": 68,
      "82": 82,
      "87": 87,
      "88": 88,
      "92": 92,
      "102": 102,
      "106": 106,
      "150": 150,
      "288": 288,

      page: 20,
      "card-horizontal": 20,
      "card-vertical": 20,
      "card-gap": 12,
    },
    borderWidths: {
      "0": 0,
      "1": 1,
      "2": 2,
      "3": 3,
      "4": 4,
      "6": 6,
      "8": 8,
      "12": 12,
      "16": 16,
      "32": 32,
      "64": 64,
    },
    borderRadiuses: {
      "0": 0,
      "1": 1,
      "2": 2,
      "3": 3,
      "4": 4,
      "6": 6,
      "8": 8,
      "12": 12,
      "16": 16,
      "32": 32,
      "64": 64,
    },
    opacities: {
      transparent: 0,
      "10": 0.1,
      "20": 0.2,
      "30": 0.3,
      "40": 0.4,
      "50": 0.5,
      "60": 0.6,
      "70": 0.7,
      "80": 0.8,
      "90": 0.9,
      "100": 1,

      "blurred-tabbar": 0.6,
    },
  },
  {
    dark: {
      custom: {
        "background-gradient": {
          degree: 90,
          stops: [
            {
              offset: "0%",
              color: "#07020E",
            },
            {
              offset: "100%",
              color: "#020915",
            },
          ],
        },

        "status-bar-style": "light-content" as StatusBarStyle,

        "header-on-gradient-screen": {
          blurOnIOS: {
            type: "dark" as BlurViewProperties["blurType"],
            amount: 40,
            reducedTransparencyFallbackColor: "black",
            minOpacity: 0.2,
          },
          bottomBorderOnAndroid: {
            color: ColorPalette["platinum-500"],
            width: 0.5,
          },
          background: DarkThemeBackgroundColors["card"],
        },
        "header-on-secondary-screen": {
          blurOnIOS: {
            type: "dark" as BlurViewProperties["blurType"],
            amount: 40,
            reducedTransparencyFallbackColor: "black",
            minOpacity: 0.2,
          },
          bottomBorderOnAndroid: {
            color: ColorPalette["platinum-500"],
            width: 0.5,
          },
          background: ColorPalette["platinum-600"],
        },
        "header-at-secondary-screen": {
          blurOnIOS: {
            type: "dark" as BlurViewProperties["blurType"],
            amount: 40,
            reducedTransparencyFallbackColor: "black",
            minOpacity: 0.2,
          },
          bottomBorderOnAndroid: {
            color: "black",
            width: 0,
          },
          background: DarkThemeBackgroundColors["background-secondary"],
        },
        "header-on-tertiary-screen": {
          blurOnIOS: {
            type: "dark" as BlurViewProperties["blurType"],
            amount: 40,
            reducedTransparencyFallbackColor: "black",
            minOpacity: 0.2,
          },
          bottomBorderOnAndroid: {
            color: "black",
            width: 0,
          },
          background: DarkThemeBackgroundColors["background-tertiary"],
        },

        "blurred-tabbar-blur-type": "dark" as BlurViewProperties["blurType"],
        "blurred-tabbar-blur-amount": 50,
        "blurred-tabbar-reducedTransparencyFallbackColor": "black",
        "blurred-tabbar-top-border": ColorPalette["platinum-500"],

        "unlock-screen-gradient-background": {
          degree: 168,
          stops: [
            {
              offset: "0%",
              color: "#1E2C5E",
            },
            {
              offset: "51%",
              color: "#10213D",
            },
            {
              offset: "100%",
              color: "#050B14",
            },
          ],
        },

        "tx-result-screen-pending-gradient-background": {
          degree: 168,
          stops: [
            {
              offset: "0%",
              color: "#2B4267",
            },
            {
              offset: "46%",
              color: "#030E21",
            },
          ],
        },

        "tx-result-screen-success-gradient-background": {
          degree: 168,
          stops: [
            {
              offset: "0%",
              color: "#174045",
            },
            {
              offset: "48%",
              color: "#021213",
            },
          ],
        },

        "tx-result-screen-failed-gradient-background": {
          degree: 168,
          stops: [
            {
              offset: "0%",
              color: "#381111",
            },
            {
              offset: "45%",
              color: "#0C0101",
            },
          ],
        },
      },
      colors: {
        ...DarkThemeTextColors,
        ...DarkThemeBackgroundColors,

        "blurred-tabbar-background": DarkThemeBackgroundColors["card"],

        "rect-button-default-ripple": ColorPalette["platinum-400"],
        "rect-button-default-underlay": ColorPalette["platinum-400"],
      },
      opacities: {
        "blurred-tabbar": 0.5,
      },
    },
  }
);
