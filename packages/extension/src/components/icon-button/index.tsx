import React, { FunctionComponent, PropsWithChildren } from "react";
import styled, { css } from "styled-components";
import { ColorPalette } from "../../styles";

export const Styles = {
  Container: styled.div<{
    padding?: string;
    color?: string;
    hoverColor?: string;
    disabled?: boolean;
  }>`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    cursor: ${({ disabled }) => (!disabled ? "pointer" : "not-allowed")};

    border-radius: 50%;

    padding: ${({ padding }) => (padding ? padding : undefined)};

    color: ${({ color, theme }) =>
      color
        ? color
        : theme.mode === "light"
        ? ColorPalette["gray-300"]
        : ColorPalette["gray-50"]};

    ${({ disabled, hoverColor }) => {
      if (!disabled) {
        return css`
          :hover {
            background-color: ${({ theme }) =>
              hoverColor
                ? hoverColor
                : theme.mode === "light"
                ? ColorPalette["gray-100"]
                : ColorPalette["gray-550"]};
          }
        `;
      }
    }}
  `,
};

export const IconButton: FunctionComponent<
  PropsWithChildren<{
    onClick: () => void;
    padding?: string;
    color?: string;
    hoverColor?: string;

    disabled?: boolean;
  }>
> = ({ children, onClick, padding, hoverColor, disabled }) => {
  return (
    <Styles.Container
      padding={padding}
      hoverColor={hoverColor}
      disabled={disabled}
      onClick={(e) => {
        e.preventDefault();

        if (!disabled) {
          onClick();
        }
      }}
    >
      {children}
    </Styles.Container>
  );
};
