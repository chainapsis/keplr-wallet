import { InExtensionMessageRequester } from "@keplr-wallet/router-extension";
import React, {
  createContext,
  FunctionComponent,
  PropsWithChildren,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import { ThemeProvider } from "styled-components";
import { SetThemeOptionMsg } from "@keplr-wallet/background";
import { BACKGROUND_PORT } from "@keplr-wallet/router";

export type ThemeOption = "dark" | "light" | "auto";

interface Theme {
  option: ThemeOption;
  setTheme: (option: ThemeOption) => void;
}

const initOption = () => {
  const theme = localStorage.getItem("theme-option");

  if (!theme) {
    return "dark";
  }

  return theme as ThemeOption;
};

const AppThemeContext = createContext<Theme | null>(null);

export const useAppTheme = () => {
  const theme = useContext(AppThemeContext);

  if (!theme) {
    throw new Error("You have forgot to use theme provider");
  }

  return theme;
};

export const AppThemeProvider: FunctionComponent<PropsWithChildren> = ({
  children,
}) => {
  const [option, _setOption] = useState<ThemeOption>(() => initOption());
  const [displayTheme, setDisplayTheme] = useState<"dark" | "light">(() => {
    if (!option) {
      return "dark";
    }

    if (option === "auto") {
      return window.matchMedia("(prefers-color-scheme: light)").matches
        ? "light"
        : "dark";
    }

    return option;
  });

  useEffect(() => {
    new InExtensionMessageRequester().sendMessage(
      BACKGROUND_PORT,
      new SetThemeOptionMsg(option)
    );
  }, [option]);

  const setTheme = (option: ThemeOption) => {
    localStorage.setItem("theme-option", option);

    if (option === "auto") {
      setDisplayTheme(
        window.matchMedia("(prefers-color-scheme: light)").matches
          ? "light"
          : "dark"
      );
    } else {
      setDisplayTheme(option);
    }

    _setOption(option);
  };

  useLayoutEffect(() => {
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", (event) => {
        const newColorScheme = event.matches ? "dark" : "light";

        if (option === "auto") {
          setDisplayTheme(newColorScheme);
        }
      });
  }, [option]);

  return (
    <AppThemeContext.Provider
      value={{
        option,
        setTheme,
      }}
    >
      <ThemeProvider theme={{ mode: displayTheme }}>{children}</ThemeProvider>
    </AppThemeContext.Provider>
  );
};
