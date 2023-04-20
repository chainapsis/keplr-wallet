import React, { FunctionComponent } from "react";
import styled from "styled-components";
import { ColorPalette } from "../../styles";
import Color from "color";

export const Styles = {
  Container: styled.div`
    cursor: pointer;

    border-radius: 1000rem;

    color: ${ColorPalette["gray-50"]};

    // TODO: 스타일링 이거 맞음?
    :hover {
      background-color: ${Color(ColorPalette["gray-500"]).alpha(0.5).string()};
    }
    :active {
      background-color: ${ColorPalette["gray-500"]};
    }
  `,
};

export const IconButton: FunctionComponent<{
  onClick: () => void;
}> = ({ children, onClick }) => {
  return (
    <Styles.Container
      onClick={(e) => {
        e.preventDefault();

        onClick();
      }}
    >
      {children}
    </Styles.Container>
  );
};
