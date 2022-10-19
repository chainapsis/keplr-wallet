import React, { FunctionComponent } from "react";
import styled from "styled-components";
import { ColorPalette } from "../../styles";

type ButtonColor = "primary" | "secondary" | "danger" | "transparent";

export interface ButtonProps {
  color?: ButtonColor;
}

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

const Container = styled.button<ButtonProps>`
  height: 3.25rem;
  ${({ color }) => makeStylesFromColor(color)}
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 8px;

  font-weight: 600;
  font-size: 16px;
  line-height: 19px;
`;

export const Button: FunctionComponent<ButtonProps> = ({ color, children }) => {
  return <Container color={color}>{children}</Container>;
};
