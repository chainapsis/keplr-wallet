import React, { FunctionComponent } from "react";
import { GlobalSimpleBarProvider } from "./hooks/global-simplebar";
import { Link, useLocation } from "react-router-dom";
import { ColorPalette } from "./styles";
import { useTheme } from "styled-components";

export const BottomTabsHeightRem = "3.75rem";

export const BottomTabsRouteProvider: FunctionComponent<{
  isNotReady: boolean;

  tabs: {
    pathname: string;
    icon: React.ReactNode;
  }[];

  forceHideBottomTabs?: boolean;
}> = ({ children, isNotReady, tabs, forceHideBottomTabs }) => {
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
          }}
        >
          {tabs.map((tab, i) => {
            const isActive = tab.pathname === location.pathname;

            return (
              <Link to={tab.pathname} key={i}>
                <div
                  style={{
                    opacity: isNotReady ? 0 : 1,
                    color: (() => {
                      if (theme.mode === "light") {
                        return isActive
                          ? ColorPalette["blue-400"]
                          : ColorPalette["gray-100"];
                      }

                      return isActive
                        ? ColorPalette["gray-100"]
                        : ColorPalette["gray-400"];
                    })(),
                  }}
                >
                  {tab.icon}
                </div>
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
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
      fill="none"
      stroke="none"
      viewBox="0 0 28 28"
    >
      <path
        fill="currentColor"
        d="M2.652 6.563A5.23 5.23 0 016.125 5.25h15.75a5.23 5.23 0 013.473 1.313A3.5 3.5 0 0021.875 3.5H6.125a3.5 3.5 0 00-3.473 3.063zM2.652 10.063A5.23 5.23 0 016.125 8.75h15.75a5.23 5.23 0 013.473 1.313A3.5 3.5 0 0021.875 7H6.125a3.5 3.5 0 00-3.473 3.063zM6.125 10.5a3.5 3.5 0 00-3.5 3.5v7a3.5 3.5 0 003.5 3.5h15.75a3.5 3.5 0 003.5-3.5v-7a3.5 3.5 0 00-3.5-3.5H17.5a.875.875 0 00-.875.875 2.625 2.625 0 01-5.25 0 .875.875 0 00-.875-.875H6.125z"
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
      <g clipPath="url(#clip0_6795_1355)">
        <path
          fill="currentColor"
          d="M7.207 12.429L1 18.714 7.207 25v-4.714H18.11v-3.143H7.207v-4.714zM27 9.286L20.793 3v4.714H9.89v3.143h10.904v4.714L27 9.286z"
        />
      </g>
      <defs>
        <clipPath id="clip0_6795_1355">
          <path fill="#fff" d="M0 0H28V28H0z" />
        </clipPath>
      </defs>
    </svg>
  );
};

export const BottomTabSettingIcon: FunctionComponent<{
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
      <path
        fill="currentColor"
        d="M14 2.333c-.616 0-1.22.053-1.809.154l-.363 1.518c-.564 2.36-2.968 3.762-5.272 3.074L5.29 6.7c-.76.99-1.369 2.114-1.79 3.33l.94.912a4.274 4.274 0 010 6.115l-.94.912a11.8 11.8 0 001.79 3.33l1.266-.378c2.304-.688 4.708.714 5.272 3.074l.363 1.518a10.72 10.72 0 003.618 0l.363-1.518c.564-2.36 2.968-3.762 5.272-3.074l1.266.379c.76-.99 1.369-2.115 1.79-3.331l-.94-.912a4.274 4.274 0 010-6.115l.94-.911A11.802 11.802 0 0022.71 6.7l-1.266.379c-2.304.688-4.708-.714-5.272-3.074l-.363-1.518c-.59-.101-1.193-.154-1.809-.154zm0 8.485c1.74 0 3.15 1.425 3.15 3.182s-1.41 3.182-3.15 3.182-3.15-1.425-3.15-3.182c0-1.758 1.41-3.182 3.15-3.182z"
      />
    </svg>
  );
};
