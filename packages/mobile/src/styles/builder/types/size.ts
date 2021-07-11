export type StyleBuilderWidthDefinitions<
  Sizes extends Record<string, string | number>
> = {
  [K in keyof Sizes as `width-${string & K}`]: {
    width: string | number;
  };
};

export type StyleBuilderMinWidthDefinitions<
  Sizes extends Record<string, string | number>
> = {
  [K in keyof Sizes as `min-width-${string & K}`]: {
    minWidth: string | number;
  };
};

export type StyleBuilderMaxWidthDefinitions<
  Sizes extends Record<string, string | number>
> = {
  [K in keyof Sizes as `max-width-${string & K}`]: {
    maxWidth: string | number;
  };
};

export type StyleBuilderHeightDefinitions<
  Sizes extends Record<string, string | number>
> = {
  [K in keyof Sizes as `height-${string & K}`]: {
    height: string | number;
  };
};

export type StyleBuilderMinHeightDefinitions<
  Sizes extends Record<string, string | number>
> = {
  [K in keyof Sizes as `min-height-${string & K}`]: {
    minHeight: string | number;
  };
};

export type StyleBuilderMaxHeightDefinitions<
  Sizes extends Record<string, string | number>
> = {
  [K in keyof Sizes as `max-height-${string & K}`]: {
    maxHeight: string | number;
  };
};

export type StyleBuilderSizeDefinitions<
  Widths extends Record<string, string | number>,
  Heights extends Record<string, string | number>
> = StyleBuilderWidthDefinitions<Widths> &
  StyleBuilderMinWidthDefinitions<Widths> &
  StyleBuilderMaxWidthDefinitions<Widths> &
  StyleBuilderHeightDefinitions<Heights> &
  StyleBuilderMinHeightDefinitions<Heights> &
  StyleBuilderMaxHeightDefinitions<Heights>;
