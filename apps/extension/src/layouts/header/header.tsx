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
import {
  Button,
  ButtonProps,
  getButtonHeightRem,
} from "../../components/button";
import { Skeleton } from "../../components/skeleton";
import {
  SpecialButton,
  SpecialButtonProps,
  getSpecialButtonHeightRem,
} from "../../components/special-button";

const pxToRem = (px: number) => {
  const base = parseFloat(
    getComputedStyle(document.documentElement).fontSize.replace("px", "")
  );
  return px / base;
};
const bottomButtonPaddingRem = 0.75;

export const HeaderHeight = "3.75rem";

const Styles = {
  Container: styled.div``,

  HeaderContainer: styled.div<{
    fixedTopHeight?: string;
  }>`
    height: ${HeaderHeight};

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
    top: ${(props) => props.fixedTopHeight ?? "0"};
    left: 0;
    right: 0;

    z-index: 100;
  `,

  HeaderTitle: styled.div`
    height: ${HeaderHeight};
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
    height: ${HeaderHeight};
    position: absolute;

    top: 0;
    left: 0;

    z-index: 100;

    display: flex;
    justify-content: center;
    align-items: center;
  `,

  HeaderRight: styled.div`
    height: ${HeaderHeight};
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
    displayFlex: boolean;
    fixedHeight: boolean;
    fixedMinHeight: boolean;
    fixedTopHeight?: string;
  }>`
    ${({ displayFlex }) => {
      if (displayFlex) {
        return css`
          display: flex;
          flex-direction: column;
        `;
      }
      return css``;
    }}

    padding-top: ${(props) => {
      if (!props.fixedTopHeight) {
        return HeaderHeight;
      }
      return `calc(${HeaderHeight} + ${props.fixedTopHeight})`;
    }};
    padding-bottom: ${({ bottomPadding }) => bottomPadding};

    ${({
      layoutHeight,
      fixedHeight,
      fixedMinHeight,
      additionalPaddingBottom,
    }) => {
      if (!fixedHeight && !fixedMinHeight) {
        return css`
          // min-height: ${layoutHeight}rem;
        `;
      } else if (fixedHeight) {
        return css`
          height: ${(() => {
            if (additionalPaddingBottom && additionalPaddingBottom !== "0") {
              return `calc(${layoutHeight}rem - ${additionalPaddingBottom})`;
            }
            return `${layoutHeight}rem`;
          })()};
        `;
      } else if (fixedMinHeight) {
        return css`
          min-height: ${(() => {
            if (additionalPaddingBottom && additionalPaddingBottom !== "0") {
              return `calc(${layoutHeight}rem - ${additionalPaddingBottom})`;
            }
            return `${layoutHeight}rem`;
          })()};
        `;
      }
    }};
  `,
  BottomButtonMockBackplate: styled.div`
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
  `,
};

export const HeaderLayout: FunctionComponent<
  PropsWithChildren<HeaderProps>
> = ({
  title,
  left,
  right,
  bottomButtons,
  displayFlex,
  fixedHeight,
  fixedMinHeight,
  onSubmit,
  children,
  isNotReady,
  additionalPaddingBottom,
  headerContainerStyle,

  fixedTop,
}) => {
  const [height, setHeight] = React.useState(() => pxToRem(600));
  const lastSetHeight = useRef(-1);

  const hasBottomButton = bottomButtons && bottomButtons.length > 0;
  const hasMultipleBottomButton = bottomButtons && bottomButtons.length > 1;

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
    if (!hasBottomButton) {
      return "0";
    }

    const buttonHeights = bottomButtons.map((button) => {
      return button.isSpecial
        ? getSpecialButtonHeightRem(button.size)
        : getButtonHeightRem(button.size);
    });

    const maxButtonHeightRem = Math.max(...buttonHeights);

    return `${bottomButtonPaddingRem * 2 + maxButtonHeightRem}rem`;
  })();

  const renderButton = (
    button:
      | ({ isSpecial?: false } & ButtonProps)
      | ({ isSpecial: true } & SpecialButtonProps),
    index: number
  ) => {
    if (button.isSpecial) {
      return <SpecialButton key={index} {...button} />;
    }

    return (
      <Skeleton isNotReady={isNotReady} type="button" key={index}>
        <Button {...button} />
      </Skeleton>
    );
  };

  return (
    <Styles.Container as={onSubmit ? "form" : undefined} onSubmit={onSubmit}>
      {fixedTop ? (
        <div style={{ width: "100%", position: "fixed", zIndex: 100 }}>
          {fixedTop.element}
        </div>
      ) : null}
      <Styles.HeaderContainer
        style={headerContainerStyle}
        fixedTopHeight={fixedTop?.height}
      >
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
        displayFlex={displayFlex || false}
        fixedHeight={fixedHeight || false}
        fixedMinHeight={fixedMinHeight || false}
        bottomPadding={bottomPadding}
        fixedTopHeight={fixedTop?.height}
      >
        {children}
      </Styles.ContentContainer>

      {hasBottomButton ? (
        <Box
          padding={bottomButtonPaddingRem + "rem"}
          position="fixed"
          style={{
            left: 0,
            right: 0,
            bottom: additionalPaddingBottom || "0",
            display: hasMultipleBottomButton ? "grid" : undefined,
            gridTemplateColumns: hasMultipleBottomButton
              ? `${"auto ".repeat(bottomButtons.length - 1)}1fr` // 마지막 버튼이 남은 공간을 다 채우도록 함
              : undefined,
            gap: hasMultipleBottomButton ? "0.75rem" : undefined,
          }}
        >
          {/*
            scroll이 생겼을때 버튼 뒤로 UI가 보이는걸 대충 방지한다.
            버튼들이 border radius를 가지고 있는데 이부분만 남기고 나머지만 안보여줄 효과적인 방법은 없다.
            일단 border radius를 감안해서 약간 height를 적게 줘서 mock backplate를 만든다.
            나중에 UI 상에서 문제가 된다면 따로 prop등을 임시로 사용해서 조절해야한다...
          */}
          {bottomPadding !== "0" ? (
            <Styles.BottomButtonMockBackplate
              style={{
                position: "absolute",
                height: `calc(${bottomPadding} - ${bottomButtonPaddingRem}rem - 0.375rem)`,
                bottom: 0,
                left: 0,
                right: 0,
              }}
            />
          ) : null}
          {bottomButtons.map(renderButton)}
        </Box>
      ) : null}
    </Styles.Container>
  );
};
