export type StyleBuilderPaddingAllDefinitions<
  Sizes extends Record<string, string | number>
> = {
  [K in keyof Sizes as `padding-${string & K}`]: {
    padding: string | number;
  };
};

export type StyleBuilderPaddingLeftDefinitions<
  Sizes extends Record<string, string | number>
> = {
  [K in keyof Sizes as `padding-left-${string & K}`]: {
    paddingLeft: string | number;
  };
};

export type StyleBuilderPaddingRightDefinitions<
  Sizes extends Record<string, string | number>
> = {
  [K in keyof Sizes as `padding-right-${string & K}`]: {
    paddingRight: string | number;
  };
};

export type StyleBuilderPaddingTopDefinitions<
  Sizes extends Record<string, string | number>
> = {
  [K in keyof Sizes as `padding-top-${string & K}`]: {
    paddingTop: string | number;
  };
};

export type StyleBuilderPaddingBottomDefinitions<
  Sizes extends Record<string, string | number>
> = {
  [K in keyof Sizes as `padding-bottom-${string & K}`]: {
    paddingBottom: string | number;
  };
};

export type StyleBuilderPaddingXDefinitions<
  Sizes extends Record<string, string | number>
> = {
  [K in keyof Sizes as `padding-x-${string & K}`]: {
    paddingLeft: string | number;
    paddingRight: string | number;
  };
};

export type StyleBuilderPaddingYDefinitions<
  Sizes extends Record<string, string | number>
> = {
  [K in keyof Sizes as `padding-y-${string & K}`]: {
    paddingTop: string | number;
    paddingBottom: string | number;
  };
};

export type StyleBuilderPaddingDefinitions<
  Sizes extends Record<string, string | number>
> = StyleBuilderPaddingAllDefinitions<Sizes> &
  StyleBuilderPaddingLeftDefinitions<Sizes> &
  StyleBuilderPaddingRightDefinitions<Sizes> &
  StyleBuilderPaddingTopDefinitions<Sizes> &
  StyleBuilderPaddingBottomDefinitions<Sizes> &
  StyleBuilderPaddingXDefinitions<Sizes> &
  StyleBuilderPaddingYDefinitions<Sizes>;
