import React, {
  createContext,
  FunctionComponent,
  PropsWithChildren,
  useContext,
  useMemo,
} from 'react';
import {StyleBuilder} from './builder';
import {DeepPartial} from 'utility-types';
import {StyledDimension} from './types';

const createStyleContext = <
  Themes extends ReadonlyArray<string>,
  Custom extends Record<string, unknown>,
  Colors extends Record<string, string>,
  Widths extends Record<string, StyledDimension>,
  Heights extends Record<string, StyledDimension>,
  PaddingSizes extends Record<string, StyledDimension>,
  MarginSizes extends Record<string, StyledDimension>,
  BorderWidths extends Record<string, number>,
  BorderRadiuses extends Record<string, number>,
  Opacities extends Record<string, number>,
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
        theme: 'light' | 'dark';
        setTheme: (theme: 'light' | 'dark' | null) => void;
      }
    | undefined
  >(undefined);

export const createStyleProvider = <
  Themes extends readonly ['light'],
  Custom extends Record<string, unknown>,
  Colors extends Record<string, string>,
  Widths extends Record<string, StyledDimension>,
  Heights extends Record<string, StyledDimension>,
  PaddingSizes extends Record<string, StyledDimension>,
  MarginSizes extends Record<string, StyledDimension>,
  BorderWidths extends Record<string, number>,
  BorderRadiuses extends Record<string, number>,
  Opacities extends Record<string, number>,
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
  },
): {
  StyleProvider: FunctionComponent<PropsWithChildren>;
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
    theme: 'light' | 'dark';
    setTheme: (theme: 'light' | 'dark' | null) => void;
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
    StyleProvider: ({children}) => {
      const builder = useMemo(() => {
        return new StyleBuilder(config, themeConfigs);
      }, []);

      return (
        <context.Provider
          value={{
            builder,
            isInitializing: false,
            isAutomatic: false,
            theme: builder.theme === 'light' ? 'light' : 'dark',
            setTheme: theme => {
              console.log(`TODO: setTheme (${theme})`);
            },
          }}>
          {children}
        </context.Provider>
      );
    },
    useStyle: () => {
      const state = useContext(context);
      if (!state) throw new Error('You probably forgot to use StyleProvider');
      return state.builder;
    },
    useStyleThemeController: () => {
      const state = useContext(context);
      if (!state) throw new Error('You probably forgot to use StyleProvider');
      return state;
    },
  };
};
