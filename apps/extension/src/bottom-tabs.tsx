import React, { FunctionComponent, PropsWithChildren } from "react";
import { GlobalSimpleBarProvider } from "./hooks/global-simplebar";
import { Link, useLocation } from "react-router-dom";
import { ColorPalette } from "./styles";
import { useTheme } from "styled-components";
import { YAxis } from "./components/axis";
import { Caption2 } from "./components/typography";
import { Box } from "./components/box";

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
    }[];

    forceHideBottomTabs?: boolean;
  }>
> = ({ children, isNotReady, tabs, forceHideBottomTabs }) => {
  const location = useLocation();

  const theme = useTheme();

  const shouldBottomTabsShown =
    !forceHideBottomTabs &&
    tabs.find((tab) => tab.pathname === location.pathname);

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
            const isActive = tab.pathname === location.pathname;

            return (
              <Box
                key={i}
                style={{
                  // text의 길이와 상관없이 모든 tab이 균등하게 나눠져야 하므로 상위에 width: 1px를 주는 trick을 사용한다.
                  width: "1px",
                }}
              >
                <Link
                  to={tab.pathname}
                  style={{
                    textDecoration: "none",
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: isNotReady ? 0 : 1,
                      color: (() => {
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
                    <YAxis alignX="center">
                      <BottomTabActiveStateContext.Provider
                        value={{
                          isActive,
                        }}
                      >
                        <Box>{tab.icon}</Box>
                        <Caption2
                          style={{
                            textDecoration: "none",
                            whiteSpace: "nowrap",
                            wordBreak: "keep-all",
                          }}
                          color={(() => {
                            if (theme.mode === "light") {
                              return isActive
                                ? ColorPalette["blue-400"]
                                : ColorPalette["gray-200"];
                            }

                            return isActive
                              ? ColorPalette["white"]
                              : ColorPalette["gray-300"];
                          })()}
                        >
                          {tab.text}
                        </Caption2>
                      </BottomTabActiveStateContext.Provider>
                    </YAxis>
                  </div>
                </Link>
              </Box>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};

const useIsTabActive = () => {
  const context = React.useContext(BottomTabActiveStateContext);
  if (context == null) {
    throw new Error(
      "useIsTabActive must be used within BottomTabActiveStateContext"
    );
  }
  return context.isActive;
};

export const BottomTabHomeIcon: FunctionComponent<{
  width: string;
  height: string;
}> = ({ width, height }) => {
  const isActive = useIsTabActive();

  return isActive ? (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      fill="none"
      stroke="none"
      viewBox="0 0 28 28"
    >
      <path
        fill="currentColor"
        d="M15.403 3.844a2.1 2.1 0 00-2.807 0l-7.7 6.918a2.1 2.1 0 00-.697 1.561V22.2a2.1 2.1 0 002.1 2.1h2.8a2.1 2.1 0 002.1-2.1v-5.6a.7.7 0 01.7-.7h4.2a.7.7 0 01.7.7v5.6a2.1 2.1 0 002.1 2.1h2.8a2.1 2.1 0 002.1-2.1v-9.877a2.098 2.098 0 00-.696-1.56l-7.7-6.92z"
      />
    </svg>
  ) : (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      fill="none"
      stroke="none"
      viewBox="0 0 28 28"
    >
      <path
        stroke="currentColor"
        strokeWidth="2.2"
        d="M15.403 3.844a2.1 2.1 0 00-2.807 0l-7.7 6.918a2.1 2.1 0 00-.697 1.561V22.2a2.1 2.1 0 002.1 2.1h2.8a2.1 2.1 0 002.1-2.1v-5.6a.7.7 0 01.7-.7h4.2a.7.7 0 01.7.7v5.6a2.1 2.1 0 002.1 2.1h2.8a2.1 2.1 0 002.1-2.1v-9.877a2.098 2.098 0 00-.696-1.56l-7.7-6.92z"
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
      fill="none"
      stroke="none"
      viewBox="0 0 28 28"
    >
      <g clipPath="url(#clip0_5910_45809)">
        <path
          fill="currentColor"
          d="M7.207 12.929L1 19.214 7.207 25.5v-4.714H18.11v-3.143H7.207v-4.714zM27 9.786L20.793 3.5v4.714H9.89v3.143h10.904v4.714L27 9.786z"
        />
      </g>
      <defs>
        <clipPath id="clip0_5910_45809">
          <path fill="#fff" d="M0 0H28V28H0z" transform="translate(0 .5)" />
        </clipPath>
      </defs>
    </svg>
  );
};

export const BottomTabActivityIcon: FunctionComponent<{
  width: string;
  height: string;
}> = ({ width, height }) => {
  const isActive = useIsTabActive();

  return isActive ? (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      fill="none"
      viewBox="0 0 28 28"
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M7 4.5a1 1 0 00-1 1v18a1 1 0 001 1h14a1 1 0 001-1v-13a1 1 0 00-.293-.707l-5-5A1 1 0 0016 4.5H7zM16 6l4 4h-4V6zm-7 9.5a1 1 0 011-1h8a1 1 0 010 2h-8a1 1 0 01-1-1zm0 4a1 1 0 011-1h8a1 1 0 010 2h-8a1 1 0 01-1-1z"
        clipRule="evenodd"
      />
    </svg>
  ) : (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      fill="none"
      stroke="none"
      viewBox="0 0 28 28"
    >
      <path
        fill="currentColor"
        d="M17.584 6.167h-9.75V23.5h13V9.417h-3.25v-3.25zM7.834 4h10.833L23 8.334V23.5a2.166 2.166 0 01-2.166 2.167h-13A2.167 2.167 0 015.667 23.5V6.167A2.167 2.167 0 017.834 4zM10 13.75h8.667v2.167H10V13.75zm0 4.334h8.667v2.166H10v-2.166z"
      />
    </svg>
  );
};

export const BottomTabSettingIcon: FunctionComponent<{
  width: string;
  height: string;
}> = ({ width, height }) => {
  const isActive = useIsTabActive();

  return isActive ? (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      fill="none"
      viewBox="0 0 28 28"
    >
      <path
        fill="currentColor"
        d="M14 2.833c-.616 0-1.22.053-1.809.153l-.363 1.519c-.564 2.36-2.968 3.762-5.272 3.074l-1.266-.38c-.76.99-1.369 2.115-1.79 3.332l.94.911a4.274 4.274 0 010 6.115l-.94.912a11.799 11.799 0 001.79 3.33l1.266-.378c2.304-.689 4.708.714 5.272 3.074l.363 1.518a10.73 10.73 0 003.618 0l.363-1.518c.564-2.36 2.968-3.763 5.272-3.075l1.266.38c.76-.99 1.369-2.115 1.79-3.331l-.94-.912a4.274 4.274 0 010-6.115l.94-.911A11.801 11.801 0 0022.71 7.2l-1.266.379c-2.304.688-4.708-.714-5.272-3.074l-.363-1.519c-.59-.1-1.193-.153-1.809-.153zm0 8.485c1.74 0 3.15 1.424 3.15 3.182 0 1.757-1.41 3.181-3.15 3.181s-3.15-1.424-3.15-3.181c0-1.758 1.41-3.182 3.15-3.182z"
      />
    </svg>
  ) : (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      fill="none"
      stroke="none"
      viewBox="0 0 28 28"
    >
      <path
        fill="currentColor"
        d="M23.12 15.259a1.138 1.138 0 010-1.518l1.5-1.656a1.134 1.134 0 00.14-1.345l-2.341-3.978a1.164 1.164 0 00-.536-.476 1.19 1.19 0 00-.717-.076l-2.2.437c-.28.056-.572.01-.82-.13a1.155 1.155 0 01-.527-.63l-.714-2.104a1.152 1.152 0 00-.428-.567c-.2-.14-.439-.215-.684-.214h-4.682a1.186 1.186 0 00-.72.197c-.21.141-.37.346-.45.584l-.656 2.105c-.091.266-.279.49-.527.63s-.54.185-.82.129L5.68 6.21a1.19 1.19 0 00-.67.102 1.163 1.163 0 00-.501.45L2.168 10.74a1.134 1.134 0 00.117 1.345l1.487 1.656a1.138 1.138 0 010 1.518l-1.487 1.656a1.14 1.14 0 00-.117 1.345l2.341 3.978c.123.21.31.377.535.476.225.099.476.126.718.076l2.2-.437c.28-.056.572-.01.82.13.248.139.435.363.526.63l.714 2.104c.082.238.24.443.452.584.211.141.464.21.719.197h4.682c.245.001.485-.074.684-.214.2-.14.35-.34.428-.567l.714-2.105c.091-.266.279-.49.527-.63s.54-.185.82-.129l2.2.437c.241.05.492.023.717-.076.225-.1.412-.266.535-.476l2.341-3.978a1.133 1.133 0 00-.14-1.345l-1.58-1.656zm-1.743 1.54l.936 1.035-1.498 2.553-1.382-.276a3.566 3.566 0 00-2.464.396 3.463 3.463 0 00-1.574 1.904l-.445 1.288h-2.996l-.422-1.311a3.463 3.463 0 00-1.574-1.904 3.566 3.566 0 00-2.464-.396l-1.381.276-1.522-2.541.936-1.035a3.415 3.415 0 00.895-2.3c0-.848-.319-1.667-.895-2.3l-.936-1.034 1.498-2.53 1.382.276c.843.17 1.72.029 2.464-.395A3.463 3.463 0 0011.509 6.6l.445-1.3h2.996l.445 1.311c.27.803.83 1.48 1.574 1.904a3.566 3.566 0 002.464.396l1.382-.276 1.498 2.552-.936 1.035a3.415 3.415 0 00-.884 2.288c0 .844.314 1.658.884 2.289zm-7.925-6.898c-.926 0-1.831.27-2.601.775a4.618 4.618 0 00-1.725 2.064 4.524 4.524 0 00-.266 2.657c.18.893.626 1.712 1.281 2.355a4.709 4.709 0 002.398 1.259 4.76 4.76 0 002.705-.262 4.665 4.665 0 002.101-1.694c.515-.756.79-1.645.79-2.555 0-1.22-.494-2.39-1.372-3.252A4.725 4.725 0 0013.452 9.9zm0 6.899c-.463 0-.916-.135-1.3-.388a2.31 2.31 0 01-.863-1.032 2.262 2.262 0 01-.133-1.329c.09-.446.313-.856.64-1.177a2.38 2.38 0 012.551-.498c.429.173.794.468 1.052.846a2.27 2.27 0 01-.292 2.904 2.362 2.362 0 01-1.655.674z"
      />
    </svg>
  );
};
