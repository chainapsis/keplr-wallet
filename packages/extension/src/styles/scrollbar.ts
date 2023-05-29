import { createGlobalStyle } from "styled-components";

export const ScrollBarStyle = createGlobalStyle`
  :not(.show-scrollbar) {
    ::-webkit-scrollbar {
      display: none;
    }

    // For firefox
    scrollbar-width: none;
  }
`;
