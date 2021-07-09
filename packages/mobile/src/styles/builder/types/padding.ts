export type StyleBuilderPaddingAllDefinitions<
  Sizes extends Record<string, string | number>
> = {
  [K in keyof Sizes as `padding-${string & K}`]: {
    padding: string;
  };
};

export type StyleBuilderPaddingLeftDefinitions<
  Sizes extends Record<string, string | number>
> = {
  [K in keyof Sizes as `padding-left-${string & K}`]: {
    paddingLeft: string;
  };
};

export type StyleBuilderPaddingRightDefinitions<
  Sizes extends Record<string, string | number>
> = {
  [K in keyof Sizes as `padding-right-${string & K}`]: {
    paddingRight: string;
  };
};

export type StyleBuilderPaddingTopDefinitions<
  Sizes extends Record<string, string | number>
> = {
  [K in keyof Sizes as `padding-top-${string & K}`]: {
    paddingTop: string;
  };
};

export type StyleBuilderPaddingBottomDefinitions<
  Sizes extends Record<string, string | number>
> = {
  [K in keyof Sizes as `padding-bottom-${string & K}`]: {
    paddingBottom: string;
  };
};

export type StyleBuilderPaddingXDefinitions<
  Sizes extends Record<string, string | number>
> = {
  [K in keyof Sizes as `padding-x-${string & K}`]: {
    paddingLeft: string;
    paddingRight: string;
  };
};

export type StyleBuilderPaddingYDefinitions<
  Sizes extends Record<string, string | number>
> = {
  [K in keyof Sizes as `padding-y-${string & K}`]: {
    paddingTop: string;
    paddingBottom: string;
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
