import React, {
  createContext,
  FunctionComponent,
  useContext,
  useState,
} from "react";
import { StyleBuilder } from "./builder";

const createStyleContext = <
  Custom extends Record<string, unknown>,
  Colors extends Record<string, string>,
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
  PaddingSizes extends Record<string, string | number>,
  MarginSizes extends Record<string, string | number>,
  BorderWidths extends Record<string, number>,
  BorderRadiuses extends Record<string, number>,
  Opacities extends Record<string, number>
>(configs: {
  custom: Custom;
  colors: Colors;
  paddingSizes: PaddingSizes;
  marginSizes: MarginSizes;
  borderWidths: BorderWidths;
  borderRadiuses: BorderRadiuses;
  opacities: Opacities;
}): {
  StyleProvider: FunctionComponent;
  useStyle: () => StyleBuilder<
    Custom,
    Colors,
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
    PaddingSizes,
    MarginSizes,
    BorderWidths,
    BorderRadiuses,
    Opacities
  >();

  return {
    // eslint-disable-next-line react/display-name
    StyleProvider: ({ children }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [builder] = useState(() => new StyleBuilder(configs));

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
