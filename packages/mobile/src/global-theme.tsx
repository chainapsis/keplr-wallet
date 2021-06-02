import React, { FunctionComponent } from "react";
import { ThemeProvider } from "react-native-elements";
import { colors, fcDefault } from "./styles";

const globalTheme = {
  colors: colors,
  Text: { style: fcDefault },
};

export const GlobalThemeProvider: FunctionComponent = ({ children }) => {
  return <ThemeProvider theme={globalTheme}>{children}</ThemeProvider>;
};
