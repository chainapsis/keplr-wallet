import { GlobalStyle } from "../src/styles";
import { ThemeProvider } from "styled-components";
import React from "react";

export const decorators = [
  (Story) => (
    <ThemeProvider theme={{ mode: "dark" }}>
      <GlobalStyle />
      <Story />
    </ThemeProvider>
  ),
];

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  options: {
    storySort: {
      order: ["Readme", ["Main"], "Examples", "Components", "Transitions"],
    },
  },
};
