import { createGlobalStyle } from "styled-components";

export const GlobalSidePanelStyle = createGlobalStyle`
  html {
    margin-left: auto;
    margin-right: auto;
    
    // 스크롤은 simplebar가 모두 처리한다고 가정하고 설정된것임. 주의할 것.
    overflow: hidden;
  }
  
  body {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  #app {
    width: 100%;
    max-width: 540px;
  }
`;
