import React, { FunctionComponent, ReactNode, useLayoutEffect } from "react";
import styled from "styled-components";
import { HeaderProps } from "./types";
import { Subtitle1 } from "../../components/typography";
import { ColorPalette } from "../../styles";

const Styles = {
  Container: styled.div``,

  HeaderContainer: styled.div`
    height: 3.75rem;

    background-color: ${ColorPalette["gray-700"]};

    position: fixed;
    top: 0;
    left: 0;
    right: 0;

    z-index: 100;
  `,

  HeaderTitle: styled.div`
    height: 3.75rem;
    position: absolute;

    top: 0;
    left: 0;
    right: 0;

    display: flex;
    justify-content: center;
    align-items: center;
  `,
  HeaderLeft: styled.div`
    height: 3.75rem;
    position: absolute;

    top: 0;
    left: 0;

    z-index: 100;

    display: flex;
    justify-content: center;
    align-items: center;
  `,

  HeaderRight: styled.div`
    height: 3.75rem;
    position: absolute;

    top: 0;
    right: 0;

    z-index: 100;

    display: flex;
    justify-content: center;
    align-items: center;
  `,
  ContentContainer: styled.div<{
    height: number;
    bottom: ReactNode | null;
  }>`
    padding-top: 3.75rem;
    padding-bottom: ${({ bottom }) => (bottom ? "4.75rem" : "0")};

    min-height: ${({ height }) => `${height}px`};
    height: 0;
  `,
  BottomContainer: styled.div`
    height: 4.75rem;

    background-color: ${ColorPalette["gray-700"]};

    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
  `,
};

export const HeaderLayout: FunctionComponent<HeaderProps> = ({
  title,
  left,
  right,
  bottom,
  children,
}) => {
  const [height, setHeight] = React.useState(0);

  useLayoutEffect(() => {
    const initialHeight = window.visualViewport?.height ?? 540;

    function handleResize() {
      if (height !== window.visualViewport?.height) {
        setHeight(initialHeight);
      }
    }

    setHeight(initialHeight);

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <Styles.Container>
      <Styles.HeaderContainer>
        {left && <Styles.HeaderLeft>{left}</Styles.HeaderLeft>}
        <Styles.HeaderTitle>
          <Subtitle1>{title}</Subtitle1>
        </Styles.HeaderTitle>
        {right && <Styles.HeaderRight>{right}</Styles.HeaderRight>}
      </Styles.HeaderContainer>

      <Styles.ContentContainer height={height} bottom={bottom}>
        {children}
      </Styles.ContentContainer>

      {bottom ? (
        <Styles.BottomContainer>{bottom}</Styles.BottomContainer>
      ) : null}
    </Styles.Container>
  );
};
