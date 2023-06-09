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

    // Scroll to back, forward를 막는다.
    // 특히 background interaction과 관련되었을때
    // history를 완전히 처리하지 못하는 문제가 있기 때문에
    // 제스쳐에 의한 history 변경을 막는다.
    overscroll-behavior-x: none;
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
