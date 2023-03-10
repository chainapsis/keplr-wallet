import React, { FunctionComponent } from "react";
import styled from "styled-components";
import { HeaderProps } from "./types";

const Styles = {
  Container: styled.div`
    padding-top: 4rem;
  `,

  HeaderContainer: styled.div`
    height: 4rem;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;

    display: flex;
    align-items: center;
    justify-content: center;
  `,
};

export const HeaderLayout: FunctionComponent<HeaderProps> = ({
  title,
  children,
}) => {
  return (
    <Styles.Container>
      <Styles.HeaderContainer>{title}</Styles.HeaderContainer>
      {children}
    </Styles.Container>
  );
};
