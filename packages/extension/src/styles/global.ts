import { createGlobalStyle } from "styled-components";
import { normalize } from "styled-normalize";
import MonaSans from "../public/assets/font/Mona-Sans.woff2";

export const GlobalStyle = createGlobalStyle`
  ${normalize}
  
  @font-face {
    font-family: 'Mona Sans';
    src:
            url(${MonaSans}) format('woff2 supports variations'),
            url(${MonaSans}) format('woff2-variations');
    font-weight: 200 900;
    font-stretch: 75% 125%;
  }

  html, body {
    font-family: 'Mona Sans';
    color: #F6F6F9;
    background-color: #09090A;
  }

  // Set border-box as default for convenience.
  html {
    box-sizing: border-box;
  }
  *, *:before, *:after {
    box-sizing: inherit;
  }
`;
