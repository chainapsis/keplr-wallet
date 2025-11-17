import React, { FunctionComponent, PropsWithChildren } from "react";
import { GlobalSimpleBarProvider } from "./hooks/global-simplebar";
import { Link, useLocation } from "react-router-dom";
import { ColorPalette } from "./styles";
import { useTheme } from "styled-components";
import { YAxis } from "./components/axis";
import { Caption2 } from "./components/typography";
import { Box } from "./components/box";
import { Tooltip } from "./components/tooltip";
import { useStore } from "./stores";
import { observer } from "mobx-react-lite";

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
        <GlobalSimpleBarProvider style={{ height: "100%" }}>
          {children}
        </GlobalSimpleBarProvider>
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
                        minWidth: "2.875rem",
                        height: "100%",
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
                    <YAxis alignX="center">
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
                    </YAxis>
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
        d="M5.49985 7.49976L15.4998 7.49976"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.49985 3.49976L4.49985 7.49976L8.49985 11.4998"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17.4998 16.4998L7.49982 16.4998"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.4998 12.4998L18.4998 16.4998L14.4998 20.4998"
        stroke="currentColor"
        strokeWidth="1.5"
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
      viewBox="0 0 20 20"
      fill="none"
    >
      <path
        d="M11 9.5574L14 12.5574C14.1833 12.7407 14.275 12.9741 14.275 13.2574C14.275 13.5407 14.1833 13.7741 14 13.9574C13.8167 14.1407 13.5833 14.2324 13.3 14.2324C13.0167 14.2324 12.7833 14.1407 12.6 13.9574L9.3 10.6574C9.2 10.5574 9.125 10.4451 9.075 10.3204C9.025 10.1957 9 10.0664 9 9.9324V5.9574C9 5.67406 9.096 5.43673 9.288 5.2454C9.48 5.05406 9.71733 4.95806 10 4.9574C10.2827 4.95673 10.5203 5.05273 10.713 5.2454C10.9057 5.43806 11.0013 5.6754 11 5.9574V9.5574ZM13.25 2.9574C12.9 2.9574 12.604 2.83673 12.362 2.5954C12.12 2.35406 11.9993 2.05806 12 1.7074C12.0007 1.35673 12.1217 1.06073 12.363 0.819396C12.6043 0.578063 12.9 0.457396 13.25 0.457396C13.6 0.457396 13.896 0.578396 14.138 0.820396C14.38 1.0624 14.5007 1.35806 14.5 1.7074C14.4993 2.05673 14.3783 2.35273 14.137 2.5954C13.8957 2.83806 13.6 2.95873 13.25 2.9574ZM13.25 19.4574C12.9 19.4574 12.604 19.3364 12.362 19.0944C12.12 18.8524 11.9993 18.5567 12 18.2074C12.0007 17.8581 12.1217 17.5621 12.363 17.3194C12.6043 17.0767 12.9 16.9561 13.25 16.9574C13.6 16.9587 13.896 17.0797 14.138 17.3204C14.38 17.5611 14.5007 17.8567 14.5 18.2074C14.4993 18.5581 14.3783 18.8541 14.137 19.0954C13.8957 19.3367 13.6 19.4574 13.25 19.4574ZM17.25 6.4574C16.9 6.4574 16.604 6.3364 16.362 6.0944C16.12 5.8524 15.9993 5.55673 16 5.2074C16.0007 4.85806 16.1217 4.56206 16.363 4.3194C16.6043 4.07673 16.9 3.95606 17.25 3.9574C17.6 3.95873 17.896 4.07973 18.138 4.3204C18.38 4.56106 18.5007 4.85673 18.5 5.2074C18.4993 5.55806 18.3783 5.85406 18.137 6.0954C17.8957 6.33673 17.6 6.4574 17.25 6.4574ZM17.25 15.9574C16.9 15.9574 16.604 15.8364 16.362 15.5944C16.12 15.3524 15.9993 15.0567 16 14.7074C16.0007 14.3581 16.1217 14.0621 16.363 13.8194C16.6043 13.5767 16.9 13.4561 17.25 13.4574C17.6 13.4587 17.896 13.5797 18.138 13.8204C18.38 14.0611 18.5007 14.3567 18.5 14.7074C18.4993 15.0581 18.3783 15.3541 18.137 15.5954C17.8957 15.8367 17.6 15.9574 17.25 15.9574ZM18.75 11.2074C18.4 11.2074 18.104 11.0864 17.862 10.8444C17.62 10.6024 17.4993 10.3067 17.5 9.9574C17.5007 9.60806 17.6217 9.31206 17.863 9.0694C18.1043 8.82673 18.4 8.70606 18.75 8.7074C19.1 8.70873 19.396 8.82973 19.638 9.0704C19.88 9.31106 20.0007 9.60673 20 9.9574C19.9993 10.3081 19.8783 10.6041 19.637 10.8454C19.3957 11.0867 19.1 11.2074 18.75 11.2074ZM0 9.9574C0 7.34073 0.871 5.09073 2.613 3.2074C4.355 1.32406 6.49233 0.257396 9.025 0.00739644C9.29167 -0.0259369 9.521 0.0533966 9.713 0.245397C9.905 0.437397 10.0007 0.67473 10 0.957397C10 1.22406 9.91267 1.4574 9.738 1.6574C9.56333 1.8574 9.34233 1.97406 9.075 2.0074C7.05833 2.24073 5.375 3.1074 4.025 4.6074C2.675 6.1074 2 7.89073 2 9.9574C2 12.0407 2.675 13.8284 4.025 15.3204C5.375 16.8124 7.05833 17.6747 9.075 17.9074C9.34167 17.9407 9.56267 18.0574 9.738 18.2574C9.91333 18.4574 10.0007 18.6907 10 18.9574C10 19.2407 9.904 19.4784 9.712 19.6704C9.52 19.8624 9.291 19.9414 9.025 19.9074C6.475 19.6574 4.33333 18.5907 2.6 16.7074C0.866667 14.8241 0 12.5741 0 9.9574Z"
        fill="currentColor"
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
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 20 20"
      fill="none"
    >
      <path
        d="M1.66699 10.0009L9.70218 14.0185C9.8115 14.0732 9.86616 14.1005 9.92349 14.1113C9.97427 14.1208 10.0264 14.1208 10.0772 14.1113C10.1345 14.1005 10.1891 14.0732 10.2985 14.0185L18.3337 10.0009M1.66699 14.1676L9.70218 18.1852C9.8115 18.2399 9.86616 18.2672 9.92349 18.278C9.97427 18.2875 10.0264 18.2875 10.0772 18.278C10.1345 18.2672 10.1891 18.2399 10.2985 18.1852L18.3337 14.1676M1.66699 5.83428L9.70218 1.81669C9.8115 1.76203 9.86616 1.7347 9.92349 1.72394C9.97427 1.71442 10.0264 1.71442 10.0772 1.72394C10.1345 1.7347 10.1891 1.76203 10.2985 1.81669L18.3337 5.83428L10.2985 9.85188C10.1891 9.90654 10.1345 9.93387 10.0772 9.94462C10.0264 9.95415 9.97427 9.95415 9.92349 9.94462C9.86616 9.93387 9.8115 9.90654 9.70218 9.85188L1.66699 5.83428Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
