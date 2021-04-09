import React, { FunctionComponent } from "react";
import { ThemeProvider } from "react-native-elements";

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
  Button: {},
};

export const GlobalThemeProvider: FunctionComponent = ({ children }) => {
  return <ThemeProvider theme={globalTheme}>{children}</ThemeProvider>;
};
