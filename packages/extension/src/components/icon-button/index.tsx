import React, { FunctionComponent, PropsWithChildren } from "react";
import styled from "styled-components";
import { ColorPalette } from "../../styles";

export const Styles = {
  Container: styled.div<{
    padding?: string;
    color?: string;
    hoverColor?: string;
  }>`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    cursor: pointer;

    border-radius: 50%;

    padding: ${({ padding }) => (padding ? padding : undefined)};

    color: ${({ color, theme }) =>
      color
        ? color
        : theme.mode === "light"
        ? ColorPalette["gray-300"]
        : ColorPalette["gray-50"]};

    :hover {
      background-color: ${({ hoverColor, theme }) =>
        hoverColor
          ? hoverColor
          : theme.mode === "light"
          ? ColorPalette["gray-100"]
          : ColorPalette["gray-550"]};
    }
  `,
};

export const IconButton: FunctionComponent<
  PropsWithChildren<{
    onClick: () => void;
    padding?: string;
    color?: string;
    hoverColor?: string;
  }>
> = ({ children, onClick, padding, hoverColor }) => {
  return (
    <Styles.Container
      padding={padding}
      hoverColor={hoverColor}
      onClick={(e) => {
        e.preventDefault();

        onClick();
      }}
    >
      {children}
    </Styles.Container>
  );
};
