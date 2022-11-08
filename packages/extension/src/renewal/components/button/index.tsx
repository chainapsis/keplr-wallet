import React, { FunctionComponent, MouseEventHandler } from "react";
import styled from "styled-components";
import { ColorPalette } from "../../styles";

type ButtonColor = "primary" | "secondary" | "danger" | "transparent";
type ButtonSize = "md" | "block";

export interface ButtonProps {
  color?: ButtonColor;
  size?: ButtonSize;
  onClick: MouseEventHandler<HTMLButtonElement>;
}

export const Button: FunctionComponent<ButtonProps> = ({
  children,
  ...props
}) => {
  return <Container {...props}>{children}</Container>;
};

const makeStylesFromColor = (color?: ButtonColor) => {
  switch (color) {
    case "transparent":
      return `background-color: transparent; color: ${ColorPalette["blue-400"]};`;
    case "danger":
      return `background-color: ${ColorPalette["red-400"]}; color: ${ColorPalette["white"]};`;
    case "secondary":
      return `background-color: ${ColorPalette["blue-100"]}; color: ${ColorPalette["blue-400"]};`;
    case "primary":
    default:
      return `background-color: ${ColorPalette["blue-400"]}; color: ${ColorPalette["white"]};`;
  }
};

const makeStyleFromSize = (size?: ButtonSize) => {
  switch (size) {
    case "md":
      return `width: 10rem;`;
    default:
      return `width: 100%;`;
  }
};

const Container = styled.button<ButtonProps>`
  height: 3.25rem;
  ${({ size }) => makeStyleFromSize(size)}
  ${({ color }) => makeStylesFromColor(color)}
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  max-width: 400px;

  font-weight: 600;
  font-size: 16px;
  line-height: 19px;
`;
