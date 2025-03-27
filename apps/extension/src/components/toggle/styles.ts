import styled from "styled-components";
import { ColorPalette } from "../../styles";
import { ToggleProps } from "./types";

export const Styles = {
  Container: styled.div<
    Omit<ToggleProps, "setIsOpen"> & { size?: "large" | "small" }
  >`
    display: flex;
    align-items: center;
    justify-content: ${({ isOpen }) => (isOpen ? "flex-end" : "flex-start")};

    height: ${({ size }) => (size === "small" ? "1.5rem" : "2rem")};
    width: ${({ size }) => (size === "small" ? "2.4375rem" : "3.25rem")};

    padding: ${({ isOpen, size }) =>
      size === "small"
        ? isOpen
          ? "0.1875rem"
          : "0.375rem"
        : isOpen
        ? "0.25rem"
        : "0.5rem"};

    background-color: ${({ isOpen, disabled, theme }) =>
      disabled
        ? theme.mode === "light"
          ? ColorPalette["gray-100"]
          : ColorPalette["gray-500"]
        : isOpen
        ? ColorPalette["blue-400"]
        : theme.mode === "light"
        ? ColorPalette["gray-100"]
        : ColorPalette["gray-400"]};
    border-radius: 6.25rem;

    cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};

    user-select: none;
  `,
  Circle: styled.div<
    Omit<ToggleProps, "setIsOpen"> & { size?: "large" | "small" }
  >`
    display: flex;
    align-items: center;
    justify-content: center;

    height: ${({ isOpen, size }) =>
      size === "small"
        ? isOpen
          ? "1.125rem"
          : "0.75rem"
        : isOpen
        ? "1.5rem"
        : "1rem"};
    width: ${({ isOpen, size }) =>
      size === "small"
        ? isOpen
          ? "1.125rem"
          : "0.75rem"
        : isOpen
        ? "1.5rem"
        : "1rem"};

    border-radius: 50%;
    background-color: ${({ isOpen, disabled, theme }) =>
      disabled
        ? ColorPalette["gray-300"]
        : isOpen
        ? ColorPalette["white"]
        : theme.mode === "light"
        ? ColorPalette.white
        : ColorPalette["gray-200"]};

    svg {
      color: ${({ disabled, theme }) =>
        disabled
          ? theme.mode === "light"
            ? ColorPalette.white
            : ColorPalette["gray-200"]
          : ColorPalette["blue-400"]};
    }
  `,
};
