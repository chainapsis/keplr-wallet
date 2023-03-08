import { createGlobalStyle } from "styled-components";

// Max: 800
const width = 360;
// Max: 600
const height = 600;

export const GlobalPopupStyle = createGlobalStyle`
  html {
    width: ${Math.min(width, 800)}px;
    height: ${Math.min(height, 600)}px;
  }
  
  body {
    width: 100vw;
    height: 100vh;

    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  #app {
    width: ${Math.min(width, 800)}px;
  }
`;
