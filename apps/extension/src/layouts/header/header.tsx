import React, {
  FunctionComponent,
  PropsWithChildren,
  useEffect,
  useState,
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
import { useSpringValue, animated } from "@react-spring/web";
import { defaultSpringConfig } from "../../styles/spring";
import { PageSimpleBarProvider } from "../../hooks/page-simplebar";
import { HeaderBorderScrollHandler } from "./components";

const bottomButtonPaddingRem = 0.75;

const AnimatedBox = animated(Box);

export const HeaderHeight = "3.75rem";

const Styles = {
  Container: styled.div`
    height: 100%;
  `,

  HeaderContainer: styled.div<{
    showBorderBottom?: boolean;
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
    top: 0;
    left: 0;
    right: 0;

    z-index: 100;
    border-bottom-width: 0.5px;
    border-bottom-style: solid;
    border-bottom-color: ${({ showBorderBottom, theme }) =>
      showBorderBottom
        ? theme.mode === "light"
          ? ColorPalette["gray-100"]
          : ColorPalette["gray-500"]
        : "transparent"};
    transition: border-bottom-color 250ms ease;
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
    additionalPaddingBottom?: string;
    bottomPadding: string;
    displayFlex: boolean;
  }>`
    height: 100%;

    ${({ displayFlex }) => {
      if (displayFlex) {
        return css`
          display: flex;
          flex-direction: column;
        `;
      }
      return css``;
    }}

    padding-top: ${HeaderHeight};
    padding-bottom: ${({ bottomPadding }) => bottomPadding};
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
  titleColor,
  left,
  right,
  bottomButtons,
  animatedBottomButtons,
  hideBottomButtons,
  displayFlex,
  onSubmit,
  children,
  isNotReady,
  additionalPaddingBottom,
  headerContainerStyle,
  contentContainerStyle,

  bottomBackground,
}) => {
  const hasBottomButton =
    bottomButtons && bottomButtons.length > 0 && !hideBottomButtons;
  const hasMultipleBottomButton =
    bottomButtons && bottomButtons.length > 1 && !hideBottomButtons;

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

  const bottomButtonAnimation = useSpringValue(hasBottomButton ? 1 : 0, {
    config: defaultSpringConfig,
  });

  useEffect(() => {
    bottomButtonAnimation.start(hasBottomButton ? 1 : 0);
  }, [bottomButtonAnimation, hasBottomButton]);

  const [showBorderBottom, setShowBorderBottom] = useState(false);

  const handleShowBorderBottomChange = (show: boolean) => {
    setShowBorderBottom(show);
  };

  return (
    <Styles.Container as={onSubmit ? "form" : undefined} onSubmit={onSubmit}>
      <Styles.HeaderContainer
        showBorderBottom={showBorderBottom}
        style={headerContainerStyle}
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
            <Subtitle1 color={titleColor}>{title}</Subtitle1>
          </Skeleton>
        </Styles.HeaderTitle>

        {right && !isNotReady ? (
          <Styles.HeaderRight>{right}</Styles.HeaderRight>
        ) : null}
      </Styles.HeaderContainer>

      <Styles.ContentContainer
        additionalPaddingBottom={additionalPaddingBottom}
        displayFlex={displayFlex || false}
        bottomPadding={bottomPadding}
        style={contentContainerStyle}
      >
        <PageSimpleBarProvider style={{ height: "100%" }}>
          <HeaderBorderScrollHandler
            onShowBorderBottomChange={handleShowBorderBottomChange}
          />
          {children}
        </PageSimpleBarProvider>
      </Styles.ContentContainer>

      {hasBottomButton || animatedBottomButtons ? (
        <AnimatedBox
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
            transform: bottomButtonAnimation.to((value) => {
              return `translateY(${(1 - value) * 100}%)`;
            }),
            background: bottomBackground ? "transparent" : undefined,
            zIndex: bottomBackground ? 20 : undefined,
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
                background: bottomBackground ? "transparent" : undefined,
              }}
            />
          ) : null}
          {bottomButtons?.map(renderButton)}
        </AnimatedBox>
      ) : null}
      {bottomBackground ? (
        <div
          style={{
            position: "fixed",
            bottom: additionalPaddingBottom || "0",
            left: 0,
            right: 0,
            zIndex: 1,
            pointerEvents: "none",
          }}
        >
          {bottomBackground}
        </div>
      ) : null}
    </Styles.Container>
  );
};
