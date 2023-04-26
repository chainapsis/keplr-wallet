import styled, { css } from "styled-components";
import { TextButtonProps } from "./types";
import { ColorPalette } from "../../styles";

export const Styles = {
  Container: styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
  `,

  Button: styled.button<Omit<TextButtonProps, "onClick">>`
    width: 100%;
    height: 2rem;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 0.375rem;
    cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
    overflow: hidden;

    // Default font style.
    // Override these in "buttonStyleFromColorAndMode" if needed.
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

    border: 0;
    padding: 0 1rem;

    color: ${({ disabled }) =>
      disabled ? ColorPalette["gray-200"] : ColorPalette["gray-50"]};
    background-color: transparent;

    // For hovering.
    position: relative;
    ::after {
      content: "";

      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
    }

    ${({ disabled }) =>
      disabled
        ? null
        : css`
            :hover {
              color: rgba(198, 198, 204, 0.95);
            }

            :active {
              color: ${ColorPalette["gray-200"]};
            }
          `}
  `,
  Right: styled.span`
    height: 100%;
    display: flex;
    align-items: center;
    margin-left: 0.25rem;
  `,
};
