import { createGlobalStyle } from "styled-components";
import { normalize } from "styled-normalize";
import { ColorPalette } from "./colors";
import * as KeplrWalletPrivate from "keplr-wallet-private";

export const GlobalStyle = createGlobalStyle`
  ${normalize}
  
  ${KeplrWalletPrivate.GlobalStyles}
  
  html {
    // TODO: Change the scheme according to theme after theme feature is implemented.
    color-scheme: dark;
  }
  
  html, body {
    font-family: 'Inter', sans-serif;
    color: ${ColorPalette.white};
    background-color: ${ColorPalette["gray-700"]};

    &[data-lang="ko"] {
      word-break: keep-all;
      word-wrap: break-word;
    }
  }
  
  pre {
    font-family: 'Inter', sans-serif;
    font-weight: 400;
    font-size: 0.8125rem;
    color: ${ColorPalette["gray-200"]};
  }

  // Set border-box as default for convenience.
  html {
    box-sizing: border-box;
  }
  *, *:before, *:after {
    box-sizing: inherit;
  }
  
  * {
    font-feature-settings: "calt" 0
  }
`;
