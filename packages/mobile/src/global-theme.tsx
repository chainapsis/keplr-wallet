import React, { FunctionComponent } from "react";
import { ThemeProvider } from "react-native-elements";
import {
  bgcWhite,
  colors,
  fcDefault,
  px0,
  sf,
  shadow,
  br1,
  mt1,
  p2,
  cardStyle,
  body2,
  subtitle2,
  bcWhite,
} from "./styles";

const globalTheme = {
  colors: colors,
  Text: { style: fcDefault },
  Input: {
    labelStyle: sf([fcDefault, subtitle2]),
    containerStyle: px0,
    inputContainerStyle: sf([bgcWhite, bcWhite, mt1, p2, br1, shadow]),
    inputStyle: sf([fcDefault, body2]),
  },
  Card: {
    containerStyle: cardStyle,
    Title: {
      style: { textAlign: "left", marginBottom: 0 },
    },
  },
};

export const GlobalThemeProvider: FunctionComponent = ({ children }) => {
  return <ThemeProvider theme={globalTheme}>{children}</ThemeProvider>;
};
