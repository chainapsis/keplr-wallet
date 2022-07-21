import React, {
  createContext,
  FunctionComponent,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { StyleBuilder } from "./builder";
import { Appearance, AppState, Platform } from "react-native";
import { DeepPartial } from "utility-types";
import { AsyncKVStore } from "../../common";

const createStyleContext = <
  Themes extends ReadonlyArray<string>,
  Custom extends Record<string, unknown>,
  Colors extends Record<string, string>,
  Widths extends Record<string, string | number>,
  Heights extends Record<string, string | number>,
  PaddingSizes extends Record<string, string | number>,
  MarginSizes extends Record<string, string | number>,
  BorderWidths extends Record<string, number>,
  BorderRadiuses extends Record<string, number>,
  Opacities extends Record<string, number>
>() =>
  createContext<
    | {
        builder: StyleBuilder<
          Themes,
          Custom,
          Colors,
          Widths,
          Heights,
          PaddingSizes,
          MarginSizes,
          BorderWidths,
          BorderRadiuses,
          Opacities
        >;
        isInitializing: boolean;
        isAutomatic: boolean;
        theme: "light" | "dark";
        setTheme: (theme: "light" | "dark" | null) => void;
      }
    | undefined
  >(undefined);

export const createStyleProvider = <
  Themes extends readonly ["dark"],
  Custom extends Record<string, unknown>,
  Colors extends Record<string, string>,
  Widths extends Record<string, string | number>,
  Heights extends Record<string, string | number>,
  PaddingSizes extends Record<string, string | number>,
  MarginSizes extends Record<string, string | number>,
  BorderWidths extends Record<string, number>,
  BorderRadiuses extends Record<string, number>,
  Opacities extends Record<string, number>
>(
  config: {
    themes: Themes;
    custom: Custom;
    colors: Colors;
    widths: Widths;
    heights: Heights;
    paddingSizes: PaddingSizes;
    marginSizes: MarginSizes;
    borderWidths: BorderWidths;
    borderRadiuses: BorderRadiuses;
    opacities: Opacities;
  },
  themeConfigs?: {
    [K in Themes[number]]?: DeepPartial<{
      custom: Custom;
      colors: Colors;
      widths: Widths;
      heights: Heights;
      paddingSizes: PaddingSizes;
      marginSizes: MarginSizes;
      borderWidths: BorderWidths;
      borderRadiuses: BorderRadiuses;
      opacities: Opacities;
    }>;
  }
): {
  StyleProvider: FunctionComponent;
  useStyle: () => StyleBuilder<
    Themes,
    Custom,
    Colors,
    Widths,
    Heights,
    PaddingSizes,
    MarginSizes,
    BorderWidths,
    BorderRadiuses,
    Opacities
  >;
  useStyleThemeController: () => {
    isInitializing: boolean;
    isAutomatic: boolean;
    theme: "light" | "dark";
    setTheme: (theme: "light" | "dark" | null) => void;
  };
} => {
  const context = createStyleContext<
    Themes,
    Custom,
    Colors,
    Widths,
    Heights,
    PaddingSizes,
    MarginSizes,
    BorderWidths,
    BorderRadiuses,
    Opacities
  >();

  return {
    // eslint-disable-next-line react/display-name
    StyleProvider: ({ children }) => {
      const [isDarkMode, setIsDarkMode] = useState(
        Appearance.getColorScheme() === "dark"
      );

      const [kvStore] = useState(
        () => new AsyncKVStore("__app-theme-setting__")
      );
      const [isInitializing, setIsInitializing] = useState(false);
      const [isAutomatic, setIsAutomatic] = useState(true);

      useEffect(() => {
        kvStore.get("theme").then((theme) => {
          setIsInitializing(false);

          switch (theme) {
            case "light":
              setIsAutomatic(false);
              setIsDarkMode(false);
              break;
            case "dark":
              setIsAutomatic(false);
              setIsDarkMode(true);
              break;
            default:
              setIsAutomatic(true);
              setIsDarkMode(Appearance.getColorScheme() === "dark");
              break;
          }
        });
      }, [kvStore]);

      useEffect(() => {
        if (isInitializing || !isAutomatic) {
          return;
        }

        const listener = () => {
          setIsDarkMode(Appearance.getColorScheme() === "dark");
        };

        Appearance.addChangeListener(listener);
        // On android, appearance's listener not work.
        // So, just check the color scheme whenever app get focused.
        if (Platform.OS === "android") {
          AppState.addEventListener("focus", listener);
        }

        return () => {
          Appearance.removeChangeListener(listener);
          if (Platform.OS === "android") {
            AppState.removeEventListener("focus", listener);
          }
        };
      }, [isInitializing, isAutomatic]);

      const setTheme = useCallback(
        (theme: "light" | "dark" | null) => {
          if (isInitializing) {
            return;
          }

          switch (theme) {
            case "light":
              setIsAutomatic(false);
              setIsDarkMode(false);
              kvStore.set("theme", "light");
              break;
            case "dark":
              setIsAutomatic(false);
              setIsDarkMode(true);
              kvStore.set("theme", "dark");
              break;
            default:
              setIsAutomatic(true);
              setIsDarkMode(Appearance.getColorScheme() === "dark");
              kvStore.set("theme", null);
              break;
          }
        },
        [isInitializing, kvStore]
      );

      const builder = useMemo(() => {
        const builder = new StyleBuilder(config, themeConfigs);

        if (isDarkMode) {
          builder.setTheme("dark");
        }

        return builder;
      }, [isDarkMode]);

      return (
        <context.Provider
          value={{
            builder,
            isInitializing,
            isAutomatic,
            theme: builder.theme === "dark" ? "dark" : "light",
            setTheme,
          }}
        >
          {children}
        </context.Provider>
      );
    },
    useStyle: () => {
      const state = useContext(context);
      if (!state) throw new Error("You probably forgot to use StyleProvider");
      return state.builder;
    },
    useStyleThemeController: () => {
      const state = useContext(context);
      if (!state) throw new Error("You probably forgot to use StyleProvider");
      return state;
    },
  };
};
