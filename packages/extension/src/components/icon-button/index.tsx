import React, { FunctionComponent } from "react";
import styled from "styled-components";
import { ColorPalette } from "../../styles";

export const Styles = {
  Container: styled.div<{ padding?: string; hoverColor?: string }>`
    cursor: pointer;

    border-radius: 50%;

    padding: ${({ padding }) => (padding ? padding : undefined)};

    color: ${ColorPalette["gray-50"]};

    :hover {
      background-color: ${({ hoverColor }) =>
        hoverColor ? hoverColor : ColorPalette["gray-550"]};
    }
  `,
};

export const IconButton: FunctionComponent<{
  onClick: () => void;
  padding?: string;
  hoverColor?: string;
}> = ({ children, onClick, padding, hoverColor }) => {
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
