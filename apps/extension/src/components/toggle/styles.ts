import styled from "styled-components";
import { ColorPalette } from "../../styles";
import { ToggleProps } from "./types";

export const Styles = {
  Container: styled.div<
    Omit<ToggleProps, "setIsOpen"> & {
      size?: "large" | "small" | "smaller" | "extra-small";
    }
  >`
    position: relative;
    height: ${({ size }) => {
      switch (size) {
        case "extra-small":
          return "1rem";
        case "smaller":
          return "1.25rem";
        case "small":
          return "1.5rem";
        default:
          return "2rem";
      }
    }};
    width: ${({ size }) => {
      switch (size) {
        case "extra-small":
          return "1.75rem";
        case "smaller":
          return "2.25rem";
        case "small":
          return "2.4375rem";
        default:
          return "3.25rem";
      }
    }};
    padding: 0;
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
    transition: background-color 0.2s ease-in-out;
    user-select: none;
  `,
  Circle: styled.div<
    Omit<ToggleProps, "setIsOpen"> & {
      size?: "large" | "small" | "smaller" | "extra-small";
    }
  >`
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;

    height: ${({ size }) => {
      switch (size) {
        case "extra-small":
          return "0.75rem";
        case "smaller":
          return "0.75rem";
        case "small":
          return "1.125rem";
        default:
          return "1.5rem";
      }
    }};
    width: ${({ size }) => {
      switch (size) {
        case "extra-small":
          return "0.75rem";
        case "smaller":
          return "0.75rem";
        case "small":
          return "1.125rem";
        default:
          return "1.5rem";
      }
    }};

    top: 50%;
    transform: translateY(-50%);
    left: ${({ isOpen, size }) => {
      if (isOpen) {
        switch (size) {
          case "extra-small":
            return "calc(1.75rem - 0.75rem - 0.125rem)";
          case "smaller":
            return "calc(2.25rem - 0.75rem - 0.25rem)";
          case "small":
            return "calc(2.4375rem - 1.125rem - 0.1875rem)";
          default:
            return "calc(3.25rem - 1.5rem - 0.25rem)";
        }
      }

      switch (size) {
        case "extra-small":
          return "0.125rem";
        case "smaller":
          return "0.25rem";
        case "small":
          return "0.1875rem";
        default:
          return "0.25rem";
      }
    }};

    border-radius: 50%;
    background-color: ${({ isOpen, disabled, theme }) =>
      disabled
        ? ColorPalette["gray-300"]
        : isOpen
        ? ColorPalette["white"]
        : theme.mode === "light"
        ? ColorPalette.white
        : ColorPalette["gray-200"]};
    transition: left 0.2s ease-in-out, background-color 0.2s ease-in-out;

    svg {
      color: ${({ disabled, theme }) =>
        disabled
          ? theme.mode === "light"
            ? ColorPalette.white
            : ColorPalette["gray-200"]
          : ColorPalette["blue-400"]};
      transition: opacity 0.1s ease-in-out;
    }
  `,
};
