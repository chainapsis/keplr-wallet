import React, { FunctionComponent } from "react";
import styled from "styled-components";
import { HeaderProps } from "./types";

const Styles = {
  Container: styled.div``,

  HeaderContainer: styled.div`
    height: 4rem;
    top: 0;
    left: 0;
    right: 0;
  `,

  HeaderTitle: styled.div`
    height: 4rem;
    position: absolute;

    top: 0;
    left: 0;
    right: 0;

    display: flex;
    justify-content: center;
    align-items: center;
  `,
  HeaderLeft: styled.div`
    height: 4rem;
    position: absolute;

    top: 0;
    left: 0;

    z-index: 100;

    display: flex;
    justify-content: center;
    align-items: center;
  `,

  HeaderRight: styled.div`
    height: 4rem;
    position: absolute;

    top: 0;
    right: 0;

    z-index: 100;

    display: flex;
    justify-content: center;
    align-items: center;
  `,
};

export const HeaderLayout: FunctionComponent<HeaderProps> = ({
  title,
  left,
  right,
  children,
}) => {
  return (
    <Styles.Container>
      <Styles.HeaderContainer>
        {left && <Styles.HeaderLeft>{left}</Styles.HeaderLeft>}
        <Styles.HeaderTitle>{title}</Styles.HeaderTitle>
        {right && <Styles.HeaderRight>{right}</Styles.HeaderRight>}
      </Styles.HeaderContainer>

      {children}
    </Styles.Container>
  );
};
