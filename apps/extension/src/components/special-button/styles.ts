import styled, { css } from "styled-components";
import { ColorPalette } from "../../styles";
import { ButtonRadius, getButtonHeightRem } from "../button";
import { SpecialButtonProps } from "./types";
import { animated } from "@react-spring/web";

export const getSpecialButtonHeightRem = getButtonHeightRem;

export const Styles = {
  Container: styled.div`
    // Used for making button fill parent horizontally.
    display: flex;
    flex-direction: column;
    align-items: center;
  `,

  // "onClick" field should be omitted because "onClick" prop already exists on html button component.
  // If not omitted, they are intersected with each other.
  Button: styled(animated.button).withConfig<
    Pick<SpecialButtonProps, "size" | "isLoading" | "disabled">
  >({
    shouldForwardProp: (prop) => {
      if (prop === "isLoading" || prop === "size") {
        return false;
      }
      return true;
    },
  })`
    width: 100%;
    height: ${({ size }) => `${getSpecialButtonHeightRem(size)}rem`};
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: ${ButtonRadius};
    cursor: ${({ disabled, isLoading }) =>
      disabled ? "not-allowed" : isLoading ? "progress" : "pointer"};
    overflow: hidden;

    font-weight: 500;
    font-size: ${({ size }) => {
      switch (size) {
        case "large":
          return "1rem";
        default:
          return "0.875rem";
      }
    }};
    letter-spacing: 0.2px;
    white-space: nowrap;

    // Remove normalized css properties.
    border-width: 0;
    border-style: none;
    border-color: transparent;
    border-image: none;
    padding: 0 0.75rem;

    color: ${ColorPalette["white"]};
    svg {
      fill: ${ColorPalette["white"]};
      stroke: ${ColorPalette["white"]};
    }

    // For disabled state.
    position: relative;
    ::after {
      content: "";

      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
    }

    ${({ disabled, theme }) => {
      if (!disabled) return;

      return css`
        ::after {
          background-color: ${theme.mode === "light"
            ? ColorPalette["gray-300"]
            : ColorPalette["gray-600"]};
          opacity: ${theme.mode === "light" ? 0.2 : 0.5};
        }
      `;
    }}
  `,
  Left: styled.span`
    height: 100%;
    display: flex;
    align-items: center;
    margin-right: 0.25rem;
  `,
  Right: styled.span`
    height: 100%;
    display: flex;
    align-items: center;
    margin-left: 0.25rem;
  `,
  Loading: styled.div`
    display: flex;
    align-items: center;

    position: absolute;
    color: ${ColorPalette["blue-200"]};
  `,
  TextOverrideIcon: styled.div`
    display: flex;
    align-items: center;

    position: absolute;
    svg {
      fill: none;
    }
  `,
};
