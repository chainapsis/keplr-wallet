export type StyleBuilderPaddingAllDefinitions<
  Sizes extends Record<string, string | number>
> = {
  [K in keyof Sizes as `padding-${string & K}`]: {
    // There is "padding" prop on the styling,
    // but, the "flatten" method overlaps by latter prop
    // in this case, "flatten" makes {padding:0}, {paddingBottom:4}, {padding:2} as {padding:2, paddingBottom:4}
    // so the result style has the padding bottom.
    // To prevent this problem, just use all padding props to set the padding.
    paddingTop: string | number;
    paddingBottom: string | number;
    paddingLeft: string | number;
    paddingRight: string | number;
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
