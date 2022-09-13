import React, { FunctionComponent } from "react";
import styled from "styled-components";
import { ColorPalette } from "../../styles";

export interface ButtonProps {
  color?: "primary" | "danger";
}

const Container = styled.div<ButtonProps>`
  height: 3.25rem;
  background-color: ${({ color }) => {
    switch (color) {
      case "danger":
        return ColorPalette["red-400"];
      case "primary":
      default:
        return ColorPalette["blue-400"];
    }
  }};
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const Button: FunctionComponent<ButtonProps> = () => {
  return <Container>test</Container>;
};
