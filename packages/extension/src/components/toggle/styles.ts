import styled from "styled-components";
import { ColorPalette } from "../../styles";
import { ToggleProps } from "./types";

export const Styles = {
  Container: styled.div<Omit<ToggleProps, "setIsOpen">>`
    display: flex;
    align-items: center;
    justify-content: ${({ isOpen }) => (isOpen ? "flex-end" : "flex-start")};

    height: 2rem;
    width: 3.25rem;

    padding: ${({ isOpen }) => (isOpen ? "0.25rem" : "0.5rem")};

    background-color: ${({ isOpen, disabled }) =>
      disabled
        ? ColorPalette["gray-500"]
        : isOpen
        ? ColorPalette["blue-400"]
        : ColorPalette["gray-400"]};
    border-radius: 6.25rem;

    cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};

    user-select: none;
  `,
  Circle: styled.div<Omit<ToggleProps, "setIsOpen">>`
    display: flex;
    align-items: center;
    justify-content: center;

    height: ${({ isOpen }) => (isOpen ? "1.5rem" : "1rem")};
    width: ${({ isOpen }) => (isOpen ? "1.5rem" : "1rem")};

    border-radius: 50%;
    background-color: ${({ isOpen, disabled }) =>
      disabled
        ? ColorPalette["gray-300"]
        : isOpen
        ? ColorPalette["white"]
        : ColorPalette["gray-200"]};

    svg {
      color: ${({ disabled }) =>
        disabled ? ColorPalette["gray-200"] : ColorPalette["blue-400"]};
    }
  `,
};
