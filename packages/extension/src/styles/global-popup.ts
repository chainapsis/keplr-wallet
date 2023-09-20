import { createGlobalStyle } from "styled-components";

// Popup window를 여는 방법이 OS 마다 차이가 있기 때문에 size를 보장할 수 없다.
// 특히 windows에서 popup을 열때 width에 scrollbar를 뺀 크기를 새 window로 열기 때문에 width가 보장되지 않는다.
// Max: 800
const initialWidth = 360;
// Max: 600
const initialHeight = 600;

export const PopupWidth = Math.min(initialWidth, 800);
export const PopupHeight = Math.min(initialHeight, 600);

export const GlobalPopupStyle = createGlobalStyle`
  :root {
    --popup-width: ${PopupWidth}px;
    --popup-height: ${PopupHeight}px;
  }
  
  html {
    width: var(--popup-width);
    min-height: var(--popup-height);

    margin-left: auto;
    margin-right: auto;
    
    // 스크롤은 simplebar가 모두 처리한다고 가정하고 설정된것임. 주의할 것.
    overflow: hidden;
  }
  
  body {
    min-height: var(--popup-height);
    
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  #app {
    width: var(--popup-width);
  }
`;
