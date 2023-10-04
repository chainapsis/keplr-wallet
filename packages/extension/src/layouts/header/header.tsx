import React, { FunctionComponent, useLayoutEffect, useRef } from "react";
import styled, { css } from "styled-components";
import { HeaderProps } from "./types";
import { Subtitle1 } from "../../components/typography";
import { ColorPalette } from "../../styles";
import { Box } from "../../components/box";
import { Button, getButtonHeightRem } from "../../components/button";
import { Skeleton } from "../../components/skeleton";
import {
  SpecialButton,
  getSpecialButtonHeightRem,
} from "../../components/special-button";

const pxToRem = (px: number) => {
  const base = parseFloat(
    getComputedStyle(document.documentElement).fontSize.replace("px", "")
  );
  return px / base;
};
const bottomButtonPaddingRem = 0.75;

const Styles = {
  Container: styled.div``,

  HeaderContainer: styled.div`
    height: 3.75rem;

    background: ${(props) =>
      props.theme.mode === "light"
        ? ColorPalette["light-gradient"]
        : ColorPalette["gray-700"]};

    body[data-white-background="true"] && {
      background: ${(props) =>
        props.theme.mode === "light"
          ? ColorPalette["white"]
          : ColorPalette["gray-700"]};
    }

    color: ${(props) =>
      props.theme.mode === "light"
        ? ColorPalette["gray-400"]
        : ColorPalette["gray-10"]};

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

    color: ${(props) =>
      props.theme.mode === "light"
        ? ColorPalette["gray-600"]
        : ColorPalette["white"]};
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
    layoutHeight: number;
    additionalPaddingBottom?: string;
    bottomPadding: string;
    fixedHeight: boolean;
  }>`
    padding-top: 3.75rem;
    padding-bottom: ${({ bottomPadding }) => bottomPadding};

    ${({ layoutHeight, fixedHeight, additionalPaddingBottom }) => {
      if (!fixedHeight) {
        return css`
          // min-height: ${layoutHeight}rem;
        `;
      } else {
        return css`
          height: ${(() => {
            if (additionalPaddingBottom && additionalPaddingBottom !== "0") {
              return `calc(${layoutHeight}rem - ${additionalPaddingBottom})`;
            }
            return `${layoutHeight}rem`;
          })()};
        `;
      }
    }};
  `,
};

export const HeaderLayout: FunctionComponent<HeaderProps> = ({
  title,
  left,
  right,
  bottomButton,
  fixedHeight,
  onSubmit,
  children,
  isNotReady,
  additionalPaddingBottom,
  headerContainerStyle,
}) => {
  const [height, setHeight] = React.useState(() => pxToRem(600));
  const lastSetHeight = useRef(-1);

  useLayoutEffect(() => {
    function handleResize() {
      if (window.visualViewport) {
        if (lastSetHeight.current !== window.visualViewport.height) {
          lastSetHeight.current = window.visualViewport.height;
          setHeight(pxToRem(window.visualViewport.height));
        }
      }
    }

    if (window.visualViewport) {
      lastSetHeight.current = window.visualViewport.height;
      setHeight(pxToRem(window.visualViewport.height));
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const bottomPadding = (() => {
    if (!bottomButton) {
      return "0";
    }

    if (bottomButton.isSpecial) {
      return (
        bottomButtonPaddingRem * 2 +
        getSpecialButtonHeightRem(bottomButton.size) +
        "rem"
      );
    }

    return (
      bottomButtonPaddingRem * 2 + getButtonHeightRem(bottomButton.size) + "rem"
    );
  })();

  return (
    <Styles.Container as={onSubmit ? "form" : undefined} onSubmit={onSubmit}>
      <Styles.HeaderContainer style={headerContainerStyle}>
        {left && !isNotReady ? (
          <Styles.HeaderLeft>{left}</Styles.HeaderLeft>
        ) : null}
        <Styles.HeaderTitle>
          <Skeleton
            isNotReady={isNotReady}
            dummyMinWidth="6.25rem"
            /* 보통 문자열을 사용하는데 알파벳 j 같은 경우는 요소의 크기보다 밑이나 왼쪽으로 약간 삐져나온다. 이 부분도 안보이게 하기 위해서 약간 더 크게 스켈레톤을 그린다 */
            horizontalBleed="0.15rem"
            verticalBleed="0.15rem"
          >
            <Subtitle1>{title}</Subtitle1>
          </Skeleton>
        </Styles.HeaderTitle>

        {right && !isNotReady ? (
          <Styles.HeaderRight>{right}</Styles.HeaderRight>
        ) : null}
      </Styles.HeaderContainer>

      <Styles.ContentContainer
        layoutHeight={height}
        additionalPaddingBottom={additionalPaddingBottom}
        fixedHeight={fixedHeight || false}
        bottomPadding={bottomPadding}
      >
        {children}
      </Styles.ContentContainer>

      {bottomButton ? (
        <Box
          padding={bottomButtonPaddingRem + "rem"}
          position="fixed"
          style={{
            left: 0,
            right: 0,
            bottom: additionalPaddingBottom || "0",
          }}
        >
          {(() => {
            if (bottomButton.isSpecial) {
              // isSpecial is not used.
              const { isSpecial, ...other } = bottomButton;
              return <SpecialButton {...other} />;
            } else {
              // isSpecial is not used.
              const { isSpecial, type, ...other } = bottomButton;

              // onSubmit prop이 존재한다면 기본적으로 type="submit"으로 설정한다
              // TODO: 만약에 bottomButton이 배열을 받을 수 있도록 수정된다면 이 부분도 수정되어야함.

              const props = {
                ...other,
                type: type || onSubmit ? ("submit" as const) : undefined,
              };

              return (
                <Skeleton isNotReady={isNotReady} type="button">
                  <Button {...props} />
                </Skeleton>
              );
            }
          })()}
        </Box>
      ) : null}
    </Styles.Container>
  );
};
