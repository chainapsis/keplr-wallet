import React, { FunctionComponent } from "react";
import { ThemeProvider } from "react-native-elements";
import {
  bgcWhite,
  colors,
  fcDefault,
  px0,
  sf,
  br1,
  mt1,
  cardStyle,
  body2,
  subtitle2,
  py0,
  px3,
  py1,
  bcGray,
} from "./styles";

const globalTheme = {
  colors: colors,
  Text: { style: fcDefault },
  Input: {
    labelStyle: sf([fcDefault, subtitle2]),
    containerStyle: sf([px0, py0]),
    inputContainerStyle: sf([bgcWhite, bcGray, mt1, px3, py1, br1]),
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
