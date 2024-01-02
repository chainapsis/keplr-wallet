import { EnumBorderStyle, StaticStylesDefinitions } from "./common";

export const StaticBorderStyles = {
  ["border-solid"]: {
    borderStyle: "solid" as EnumBorderStyle,
  },
  ["border-dotted"]: {
    borderStyle: "dotted" as EnumBorderStyle,
  },
  ["border-dashed"]: {
    borderStyle: "dashed" as EnumBorderStyle,
  },
};

export type StyleBuilderBorderWidthDefinitions<
  Widths extends Record<string, number>
> = {
  [K in keyof Widths as `border-width-${string & K}`]: {
    borderWidth: number;
  };
};

export type StyleBuilderBorderWidthLeftDefinitions<
  Widths extends Record<string, number>
> = {
  [K in keyof Widths as `border-width-left-${string & K}`]: {
    borderLeftWidth: number;
  };
};

export type StyleBuilderBorderWidthRightDefinitions<
  Widths extends Record<string, number>
> = {
  [K in keyof Widths as `border-width-right-${string & K}`]: {
    borderRightWidth: number;
  };
};

export type StyleBuilderBorderWidthTopDefinitions<
  Widths extends Record<string, number>
> = {
  [K in keyof Widths as `border-width-top-${string & K}`]: {
    borderTopWidth: number;
  };
};

export type StyleBuilderBorderWidthBottomDefinitions<
  Widths extends Record<string, number>
> = {
  [K in keyof Widths as `border-width-bottom-${string & K}`]: {
    borderBottomWidth: number;
  };
};

export type StyleBuilderBorderRadiusDefinitions<
  Radiuses extends Record<string, number>
> = {
  [K in keyof Radiuses as `border-radius-${string & K}`]: {
    borderTopLeftRadius: number;
    borderTopRightRadius: number;
    borderBottomLeftRadius: number;
    borderBottomRightRadius: number;
  };
};

export type StyleBuilderBorderRadiusTopLeftDefinitions<
  Radiuses extends Record<string, number>
> = {
  [K in keyof Radiuses as `border-radius-top-left-${string & K}`]: {
    borderTopLeftRadius: number;
  };
};

export type StyleBuilderBorderRadiusTopRightDefinitions<
  Radiuses extends Record<string, number>
> = {
  [K in keyof Radiuses as `border-radius-top-right-${string & K}`]: {
    borderTopRightRadius: number;
  };
};

export type StyleBuilderBorderRadiusBottomLeftDefinitions<
  Radiuses extends Record<string, number>
> = {
  [K in keyof Radiuses as `border-radius-bottom-left-${string & K}`]: {
    borderBottomLeftRadius: number;
  };
};

export type StyleBuilderBorderRadiusBottomRightDefinitions<
  Radiuses extends Record<string, number>
> = {
  [K in keyof Radiuses as `border-radius-bottom-right-${string & K}`]: {
    borderBottomRightRadius: number;
  };
};

export type StyleBuilderBorderDefinitions<
  Widths extends Record<string, number>,
  Radiuses extends Record<string, number>
> = StaticStylesDefinitions<typeof StaticBorderStyles> &
  StyleBuilderBorderWidthDefinitions<Widths> &
  StyleBuilderBorderWidthLeftDefinitions<Widths> &
  StyleBuilderBorderWidthRightDefinitions<Widths> &
  StyleBuilderBorderWidthTopDefinitions<Widths> &
  StyleBuilderBorderWidthBottomDefinitions<Widths> &
  StyleBuilderBorderRadiusDefinitions<Radiuses> &
  StyleBuilderBorderRadiusTopLeftDefinitions<Radiuses> &
  StyleBuilderBorderRadiusTopRightDefinitions<Radiuses> &
  StyleBuilderBorderRadiusBottomLeftDefinitions<Radiuses> &
  StyleBuilderBorderRadiusBottomRightDefinitions<Radiuses>;
