import { createGlobalStyle } from "styled-components";
import { normalize } from "styled-normalize";
import InterThin from "../public/assets/font/Inter-Thin.ttf";
import InterExtraLight from "../public/assets/font/Inter-ExtraLight.ttf";
import InterLight from "../public/assets/font/Inter-Light.ttf";
import InterRegular from "../public/assets/font/Inter-Regular.ttf";
import InterMedium from "../public/assets/font/Inter-Medium.ttf";
import InterSemiBold from "../public/assets/font/Inter-SemiBold.ttf";
import InterBold from "../public/assets/font/Inter-Bold.ttf";
import InterExtraBold from "../public/assets/font/Inter-ExtraBold.ttf";
import InterBlack from "../public/assets/font/Inter-Black.ttf";
import { ColorPalette } from "./colors";
import * as KeplrWalletPrivate from "keplr-wallet-private";

export const GlobalStyle = createGlobalStyle`
  ${normalize}
  
   @font-face {
     font-family: 'Inter';
     font-weight: 100;
     src: url(${InterThin}) format("truetype");
   }

  @font-face {
    font-family: 'Inter';
    font-weight: 200;
    src: url(${InterExtraLight}) format("truetype");
  }

  @font-face {
    font-family: 'Inter';
    font-weight: 300;
    src: url(${InterLight}) format("truetype");
  }

  @font-face {
    font-family: 'Inter';
    font-weight: 400;
    src: url(${InterRegular}) format("truetype");
  }

  @font-face {
    font-family: 'Inter';
    font-weight: 500;
    src: url(${InterMedium}) format("truetype");
  }

  @font-face {
    font-family: 'Inter';
    font-weight: 600;
    src: url(${InterSemiBold}) format("truetype");
  }

  @font-face {
    font-family: 'Inter';
    font-weight: 700;
    src: url(${InterBold}) format("truetype");
  }

  @font-face {
    font-family: 'Inter';
    font-weight: 800;
    src: url(${InterExtraBold}) format("truetype");
  }

  @font-face {
    font-family: 'Inter';
    font-weight: 900;
    src: url(${InterBlack}) format("truetype");
  }

  ${KeplrWalletPrivate.GlobalStyles}
  
  html, body {
    font-family: 'Inter', sans-serif;
    color: ${ColorPalette.white};
    background-color: ${ColorPalette["gray-700"]};
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
`;
