import React, {
  createContext,
  FunctionComponent,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { StyleBuilder } from "./builder";
import { Appearance, AppState, Platform } from "react-native";
import { DeepPartial } from "utility-types";

const createStyleContext = <
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
      }
    | undefined
  >(undefined);

export const createStyleProvider = <
  Custom extends Record<string, unknown>,
  Colors extends Record<string, string>,
  Widths extends Record<string, string | number>,
  Heights extends Record<string, string | number>,
  PaddingSizes extends Record<string, string | number>,
  MarginSizes extends Record<string, string | number>,
  BorderWidths extends Record<string, number>,
  BorderRadiuses extends Record<string, number>,
  Opacities extends Record<string, number>,
  ThemeCustom = DeepPartial<Custom>,
  ThemeColors = DeepPartial<Colors>,
  ThemeWidths = DeepPartial<Widths>,
  ThemeHeights = DeepPartial<Heights>,
  ThemePaddingSizes = DeepPartial<PaddingSizes>,
  ThemeMarginSizes = DeepPartial<MarginSizes>,
  ThemeBorderWidths = DeepPartial<BorderWidths>,
  ThemeBorderRadiuses = DeepPartial<BorderRadiuses>,
  ThemeOpacities = DeepPartial<Opacities>
>(
  configs: {
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
  themes?: {
    dark?: {
      custom?: ThemeCustom;
      colors?: ThemeColors;
      widths?: ThemeWidths;
      heights?: ThemeHeights;
      paddingSizes?: ThemePaddingSizes;
      marginSizes?: ThemeMarginSizes;
      borderWidths?: ThemeBorderWidths;
      borderRadiuses?: ThemeBorderRadiuses;
      opacities?: ThemeOpacities;
    };
  }
): {
  StyleProvider: FunctionComponent;
  useStyle: () => StyleBuilder<
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
} => {
  const context = createStyleContext<
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

      useEffect(() => {
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
      }, []);

      const builder = useMemo(() => {
        if (isDarkMode && themes?.dark) {
          return new StyleBuilder(
            configs,
            isDarkMode ? "dark" : "light",
            themes.dark
          );
        }

        return new StyleBuilder(configs);
      }, [isDarkMode]);

      return (
        <context.Provider
          value={{
            builder,
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
  };
};
