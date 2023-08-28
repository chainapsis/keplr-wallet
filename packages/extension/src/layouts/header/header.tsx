import React, {
  FunctionComponent,
  PropsWithChildren,
  useLayoutEffect,
  useRef,
} from "react";
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
    bottomPadding: string;
    fixedHeight: boolean;
  }>`
    padding-top: 3.75rem;
    padding-bottom: ${({ bottomPadding }) => bottomPadding};

    ${({ layoutHeight, fixedHeight }) => {
      if (!fixedHeight) {
        return css`
          // min-height: ${layoutHeight}rem;
        `;
      } else {
        return css`
          height: ${layoutHeight}rem;
        `;
      }
    }};
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

export const HeaderLayout: FunctionComponent<
  PropsWithChildren<HeaderProps>
> = ({
  title,
  left,
  right,
  bottomButton,
  fixedHeight,
  onSubmit,
  children,
  isNotReady,
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
      <Styles.HeaderContainer>
        {left && !isNotReady ? (
          <Styles.HeaderLeft>{left}</Styles.HeaderLeft>
        ) : null}
        <Styles.HeaderTitle>
          <Skeleton isNotReady={isNotReady} dummyMinWidth="6.25rem">
            <Subtitle1>{title}</Subtitle1>
          </Skeleton>
        </Styles.HeaderTitle>

        {right && !isNotReady ? (
          <Styles.HeaderRight>{right}</Styles.HeaderRight>
        ) : null}
      </Styles.HeaderContainer>

      <Styles.ContentContainer
        layoutHeight={height}
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
            bottom: 0,
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
