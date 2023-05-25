import { createGlobalStyle } from "styled-components";

// Max: 800
const width = 360;
// Max: 600
const initialHeight = 600;

export const GlobalPopupStyle = createGlobalStyle`
  html {
    width: ${Math.min(width, 800)}px;
    min-height: ${Math.min(initialHeight, 600)}px;
  }
  
  body {
    min-height: ${Math.min(initialHeight, 600)}px;
    
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  #app {
    width: ${Math.min(width, 800)}px;
  }
`;
