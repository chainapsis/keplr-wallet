import React, { FunctionComponent } from "react";
import { VerticalCollapseTransition } from "../../components/transition/vertical-collapse";
import { ColorPalette } from "../../styles";
import styled from "styled-components";

const BackSvg: FunctionComponent<{
  size?: number | string;
  color: string;
}> = ({ size = 28, color }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      fill="none"
      viewBox="0 0 28 28"
    >
      <path
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M13.344 21.875L5.469 14l7.875-7.875M6.563 14H22.53"
      />
    </svg>
  );
};

const BackSvgSize = "1.75rem";

const Styles = {
  Container: styled.div`
    position: absolute;
    width: ${BackSvgSize};
    z-index: 1000;
    top: 2rem;
    left: 2rem;
  `,
  BackSvgContainer: styled.div`
    width: ${BackSvgSize};

    cursor: pointer;
  `,
};

export const RegisterCardHeader: FunctionComponent<{
  collapsed: boolean;
  onBackClick: () => void;
}> = ({ collapsed, onBackClick }) => {
  return (
    <Styles.Container>
      <VerticalCollapseTransition
        collapsed={collapsed}
        transitionAlign="center"
      >
        <Styles.BackSvgContainer
          onClick={(e) => {
            e.preventDefault();

            onBackClick();
          }}
        >
          <BackSvg size={BackSvgSize} color={ColorPalette["gray-300"]} />
        </Styles.BackSvgContainer>
      </VerticalCollapseTransition>
    </Styles.Container>
  );
};
