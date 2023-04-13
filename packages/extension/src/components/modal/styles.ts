import styled from "styled-components";
import { ModalProps } from "./types";

export const Styles = {
  Container: styled.div<Pick<ModalProps, "isOpen" | "yAlign">>`
    display: ${({ isOpen }) => (isOpen ? "flex" : "none")};
    flex-direction: row;
    justify-content: center;
    align-items: ${({ yAlign }) => {
      switch (yAlign) {
        case "top":
          return "flex-start";
        case "center":
          return "center";
        default:
          return "flex-end";
      }
    }};
    position: fixed;
    inset: 0;

    background-color: rgba(9, 9, 10, 0.8);
    z-index: 100;
  `,
  Children: styled.div<Pick<ModalProps, "height">>`
    display: flex;

    width: 100%;
    height: ${({ height }) => height || "auto"};

    max-width: 360px;
    max-height: 100vh;
  `,
};
