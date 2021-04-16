import React, { FunctionComponent } from "react";
import { ThemeProvider } from "react-native-elements";
import { Platform } from "react-native";

const globalTheme = {
  colors: {
    primary: "#5e72e4",
    secondary: "#11cdef",
    white: "#fff",
    black: "#000",
    grey5: "#dee2e6",
    grey4: "#ced4da",
    grey3: "#adb5bd",
    grey2: "#8898aa",
    grey1: "#525f7f",
    grey0: "#32325d",
    greyOutline: "#e9ecef",
    success: "#2dce89",
    error: "#f5365c",
    warning: "#fb6340",
    divider: "#e9ecef",
  },
  Button: {
    containerStyle: {
      ...Platform.select({
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
      }),
    },
  },
  Card: {
    containerStyle: {
      marginVertical: 4,
      marginHorizontal: 0,
      borderRadius: 6,
      borderWidth: 0,
      ...Platform.select({
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
      }),
    },
  },
};

export const GlobalThemeProvider: FunctionComponent = ({ children }) => {
  return <ThemeProvider theme={globalTheme}>{children}</ThemeProvider>;
};
