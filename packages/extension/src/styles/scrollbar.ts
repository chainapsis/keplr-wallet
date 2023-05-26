import { createGlobalStyle } from "styled-components";

export const ScrollBarStyle = createGlobalStyle`
  * {
    ::-webkit-scrollbar {
      display: none;
    }

    // For firefox
    scrollbar-width: none;
  }

  .simplebar-scrollbar::before {
    background-color: rgba(255, 255, 255, 0.8);
  }
`;
