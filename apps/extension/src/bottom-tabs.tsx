import React, { FunctionComponent, PropsWithChildren } from "react";
import { Link, useLocation } from "react-router-dom";
import { ColorPalette } from "./styles";
import styled, { useTheme } from "styled-components";
import { YAxis } from "./components/axis";
import { Caption2 } from "./components/typography";
import { Box } from "./components/box";
import { Tooltip } from "./components/tooltip";
import { useStore } from "./stores";
import { observer } from "mobx-react-lite";

const Styles = {
  IconContainer: styled(YAxis)`
    min-width: 3rem;
    height: 39px;
  `,
};

export const BottomTabsHeightRem = "3.75rem";

// XXX: Tab 아이콘을 활성 상태에 따라 바꾸려고 쓰임.
//      여기서 Context API를 쓰는게 에바인 것 같기는 한데
//      원래는 active state에 따라서 아이콘이 변하는 디자인이 아니였는데
//      나중에 바뀜에 따라서 기능을 추가해야하는데 귀찮아서 이렇게 처리함.
const BottomTabActiveStateContext = React.createContext<{
  isActive: boolean;
} | null>(null);

export const BottomTabsRouteProvider: FunctionComponent<
  PropsWithChildren<{
    isNotReady: boolean;

    tabs: {
      pathname: string;
      icon: React.ReactNode;
      text: string;

      disabled?: boolean;
      tooltip?: string;
    }[];

    forceHideBottomTabs?: boolean;
  }>
> = observer(({ children, isNotReady, tabs, forceHideBottomTabs }) => {
  const location = useLocation();
  const { mainHeaderAnimationStore } = useStore();

  const theme = useTheme();

  const shouldBottomTabsShown =
    !forceHideBottomTabs &&
    tabs.find((tab) => tab.pathname === location.pathname);

  const getColor = (disabled: boolean, isActive: boolean) => {
    if (disabled) {
      return theme.mode === "light"
        ? ColorPalette["gray-200"]
        : ColorPalette["gray-300"];
    }

    if (theme.mode === "light") {
      return isActive ? ColorPalette["blue-400"] : ColorPalette["gray-200"];
    }

    return isActive ? ColorPalette["blue-400"] : ColorPalette["gray-300"];
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          flex: 1,
          overflow: "hidden",
        }}
      >
        {children}
      </div>
      {shouldBottomTabsShown ? (
        <div
          style={{
            height: BottomTabsHeightRem,
            backgroundColor:
              theme.mode === "light"
                ? ColorPalette["white"]
                : ColorPalette["gray-700"],
            borderTopStyle: "solid",
            borderTopWidth: "1px",
            borderTopColor:
              theme.mode === "light"
                ? ColorPalette["gray-100"]
                : ColorPalette["gray-600"],

            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-evenly",
            zIndex: 999999,
          }}
        >
          {tabs.map((tab, i) => {
            const disabled = !!tab.disabled;
            const isActive = tab.pathname === location.pathname;
            const isCurrentMainPath = location.pathname === "/";
            const targetIsMainPath = tab.pathname === "/";

            const to = tab.pathname;
            const handleTabClick = () => {
              if (disabled || isActive) {
                return;
              }
              if (targetIsMainPath) {
                mainHeaderAnimationStore.triggerHideForMainHeaderPrice();
                return;
              }
              if (
                isCurrentMainPath &&
                mainHeaderAnimationStore.mainPageTotalPriceVisible
              ) {
                mainHeaderAnimationStore.triggerShowForMainHeaderPrice();
              }
            };

            return (
              <Box
                key={i}
                style={{
                  // text의 길이와 상관없이 모든 tab이 균등하게 나눠져야 하므로 상위에 width: 1px를 주는 trick을 사용한다.
                  width: "1px",
                }}
              >
                <LinkComp
                  disabled={disabled}
                  tooltip={tab.tooltip}
                  to={to}
                  onClick={handleTabClick}
                >
                  <div
                    style={{
                      position: "relative",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: isNotReady ? 0 : disabled ? 0.6 : 1,
                      color: (() => {
                        if (disabled) {
                          return theme.mode === "light"
                            ? ColorPalette["gray-100"]
                            : ColorPalette["gray-400"];
                        }

                        if (theme.mode === "light") {
                          return isActive
                            ? ColorPalette["blue-400"]
                            : ColorPalette["gray-100"];
                        }

                        return isActive
                          ? ColorPalette["white"]
                          : ColorPalette["gray-400"];
                      })(),
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        minWidth: "3rem",
                        height: "39px",
                      }}
                    />
                    {isActive && (
                      <div
                        style={{
                          position: "absolute",
                          top: "-8px",
                          left: "50%",
                          transform: "translateX(-50%)",
                          width: "18px",
                          height: "2px",
                          backgroundColor: "#14afeb",
                          borderRadius: "31px",
                        }}
                      />
                    )}
                    <Styles.IconContainer alignX="center">
                      <BottomTabActiveStateContext.Provider
                        value={{
                          isActive,
                        }}
                      >
                        <Box color={getColor(disabled, isActive)}>
                          {tab.icon}
                        </Box>
                        <Caption2
                          style={{
                            textDecoration: "none",
                            whiteSpace: "nowrap",
                            wordBreak: "keep-all",
                            lineHeight: "normal",
                          }}
                          color={getColor(disabled, isActive)}
                        >
                          {tab.text}
                        </Caption2>
                      </BottomTabActiveStateContext.Provider>
                    </Styles.IconContainer>
                  </div>
                </LinkComp>
              </Box>
            );
          })}
        </div>
      ) : null}
    </div>
  );
});

const LinkComp: FunctionComponent<
  PropsWithChildren<{
    disabled: boolean;
    tooltip?: string;
    to: string;
    onClick?: () => void;
  }>
> = ({ children, disabled, tooltip, to, onClick }) => {
  if (!disabled) {
    return (
      <Tooltip content={tooltip}>
        <Link
          to={to}
          onClick={() => {
            if (onClick) {
              onClick();
            }
          }}
          style={{
            textDecoration: "none",
          }}
        >
          {children}
        </Link>
      </Tooltip>
    );
  } else {
    return (
      <Tooltip content={tooltip}>
        <div
          style={{
            textDecoration: "none",
            cursor: "not-allowed",
          }}
        >
          {children}
        </div>
      </Tooltip>
    );
  }
};

export const BottomTabHomeIcon: FunctionComponent<{
  width: string;
  height: string;
}> = ({ width, height }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M13.2032 2.8673C12.8728 2.57046 12.4444 2.40625 12.0002 2.40625C11.5561 2.40625 11.1276 2.57046 10.7972 2.8673L4.19721 8.7977C4.00934 8.96634 3.85904 9.17262 3.75609 9.40313C3.65313 9.63365 3.59982 9.88324 3.59961 10.1357V18.6017C3.59961 19.0791 3.78925 19.5369 4.12682 19.8745C4.46438 20.2121 4.92222 20.4017 5.39961 20.4017H7.79961C8.277 20.4017 8.73484 20.2121 9.0724 19.8745C9.40997 19.5369 9.59961 19.0791 9.59961 18.6017V13.8017C9.59961 13.6426 9.66282 13.49 9.77535 13.3774C9.88787 13.2649 10.0405 13.2017 10.1996 13.2017H13.7996C13.9587 13.2017 14.1114 13.2649 14.2239 13.3774C14.3364 13.49 14.3996 13.6426 14.3996 13.8017V18.6017C14.3996 19.0791 14.5893 19.5369 14.9268 19.8745C15.2644 20.2121 15.7222 20.4017 16.1996 20.4017H18.5996C19.077 20.4017 19.5348 20.2121 19.8724 19.8745C20.21 19.5369 20.3996 19.0791 20.3996 18.6017V10.1357C20.3996 9.88333 20.3464 9.63379 20.2437 9.40328C20.1409 9.17278 19.9909 8.96645 19.8032 8.7977L13.2032 2.8673Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
};

export const BottomTabSwapIcon: FunctionComponent<{
  width: string;
  height: string;
}> = ({ width, height }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M5.49982 7.49976L15.4998 7.49976"
        stroke="currentColor"
        strokeWidth="1.67"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.49982 3.49976L4.49982 7.49976L8.49982 11.4998"
        stroke="currentColor"
        strokeWidth="1.67"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17.4998 16.4998L7.49982 16.4998"
        stroke="currentColor"
        strokeWidth="1.67"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.4998 12.4998L18.4998 16.4998L14.4998 20.4998"
        stroke="currentColor"
        strokeWidth="1.67"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const BottomTabHistoryIcon: FunctionComponent<{
  width: string;
  height: string;
}> = ({ width, height }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M11.8835 7.44177V12.4387L14.6596 15.2148"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M10.4318 3C6.21612 3.69293 3 7.3536 3 11.7654C3 16.1773 6.21612 19.838 10.4318 20.5309"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M15.2148 3.55524C18.5933 4.81261 21 8.06699 21 11.8835C21 15.7 18.5933 18.9544 15.2148 20.2117"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="0.01 4.44"
      />
    </svg>
  );
};

export const BottomTabStakeIcon: FunctionComponent<{
  width: string;
  height: string;
}> = ({ width, height }) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_1180_34010)">
        <path
          d="M3.66699 12.0009L11.7022 16.0185C11.8115 16.0732 11.8662 16.1005 11.9235 16.1113C11.9743 16.1208 12.0264 16.1208 12.0772 16.1113C12.1345 16.1005 12.1891 16.0732 12.2985 16.0185L20.3337 12.0009M3.66699 16.1676L11.7022 20.1852C11.8115 20.2399 11.8662 20.2672 11.9235 20.278C11.9743 20.2875 12.0264 20.2875 12.0772 20.278C12.1345 20.2672 12.1891 20.2399 12.2985 20.1852L20.3337 16.1676M3.66699 7.83428L11.7022 3.81669C11.8115 3.76203 11.8662 3.7347 11.9235 3.72394C11.9743 3.71442 12.0264 3.71442 12.0772 3.72394C12.1345 3.7347 12.1891 3.76203 12.2985 3.81669L20.3337 7.83428L12.2985 11.8519C12.1891 11.9065 12.1345 11.9339 12.0772 11.9446C12.0264 11.9541 11.9743 11.9541 11.9235 11.9446C11.8662 11.9339 11.8115 11.9065 11.7022 11.8519L3.66699 7.83428Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_1180_34010">
          <rect
            width="20"
            height="20"
            fill="white"
            transform="translate(2 2)"
          />
        </clipPath>
      </defs>
    </svg>
  );
};

export const BottomTabSettingsIcon: FunctionComponent<{
  width: string;
  height: string;
}> = ({ width, height }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M9.59353 3.94011C9.68394 3.39765 10.1533 3.00006 10.7032 3.00006H13.2972C13.8471 3.00006 14.3165 3.39765 14.4069 3.94011L14.6204 5.22116C14.6827 5.5952 14.9327 5.90677 15.2645 6.09042C15.3386 6.13148 15.412 6.17389 15.4844 6.21763C15.8094 6.4139 16.2048 6.47492 16.5603 6.34172L17.7772 5.88584C18.2922 5.6929 18.8712 5.90057 19.1461 6.37683L20.4431 8.62327C20.7181 9.09954 20.6084 9.70479 20.1839 10.0543L19.1795 10.8811C18.887 11.1219 18.742 11.4938 18.749 11.8726C18.7498 11.915 18.7502 11.9575 18.7502 12.0001C18.7502 12.0426 18.7498 12.0851 18.749 12.1275C18.742 12.5063 18.887 12.8782 19.1795 13.119L20.1839 13.9458C20.6084 14.2953 20.7181 14.9006 20.4431 15.3768L19.1461 17.6233C18.8712 18.0995 18.2922 18.3072 17.7772 18.1143L16.5603 17.6584C16.2048 17.5252 15.8094 17.5862 15.4844 17.7825C15.412 17.8262 15.3386 17.8686 15.2645 17.9097C14.9327 18.0933 14.6827 18.4049 14.6204 18.779L14.4069 20.06C14.3165 20.6025 13.8471 21.0001 13.2972 21.0001H10.7032C10.1533 21.0001 9.68394 20.6025 9.59353 20.06L9.38002 18.779C9.31768 18.4049 9.06771 18.0933 8.73594 17.9097C8.66176 17.8686 8.58844 17.8262 8.51601 17.7825C8.19098 17.5862 7.79565 17.5252 7.44008 17.6584L6.22322 18.1143C5.70822 18.3072 5.12923 18.0996 4.85426 17.6233L3.55728 15.3768C3.28231 14.9006 3.39196 14.2953 3.81654 13.9458L4.82089 13.119C5.1134 12.8782 5.2584 12.5063 5.25138 12.1275C5.2506 12.0851 5.2502 12.0426 5.2502 12.0001C5.2502 11.9575 5.2506 11.915 5.25138 11.8726C5.2584 11.4938 5.1134 11.122 4.82089 10.8812L3.81654 10.0543C3.39196 9.70481 3.28231 9.09955 3.55728 8.62329L4.85426 6.37685C5.12923 5.90058 5.70822 5.69292 6.22321 5.88585L7.44007 6.34173C7.79563 6.47493 8.19096 6.41391 8.516 6.21764C8.58843 6.1739 8.66176 6.13148 8.73594 6.09042C9.06771 5.90677 9.31768 5.5952 9.38002 5.22116L9.59353 3.94011Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15 12C15 13.6568 13.6568 15 12 15C10.3431 15 8.99997 13.6568 8.99997 12C8.99997 10.3431 10.3431 8.99998 12 8.99998C13.6568 8.99998 15 10.3431 15 12Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
