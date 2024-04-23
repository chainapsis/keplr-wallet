import {StyledDimension} from './dimension';

export type StyleBuilderWidthDefinitions<
  Sizes extends Record<string, StyledDimension>,
> = {
  [K in keyof Sizes as `width-${string & K}`]: {
    width: StyledDimension;
  };
};

export type StyleBuilderMinWidthDefinitions<
  Sizes extends Record<string, StyledDimension>,
> = {
  [K in keyof Sizes as `min-width-${string & K}`]: {
    minWidth: StyledDimension;
  };
};

export type StyleBuilderMaxWidthDefinitions<
  Sizes extends Record<string, StyledDimension>,
> = {
  [K in keyof Sizes as `max-width-${string & K}`]: {
    maxWidth: StyledDimension;
  };
};

export type StyleBuilderHeightDefinitions<
  Sizes extends Record<string, StyledDimension>,
> = {
  [K in keyof Sizes as `height-${string & K}`]: {
    height: StyledDimension;
  };
};

export type StyleBuilderMinHeightDefinitions<
  Sizes extends Record<string, StyledDimension>,
> = {
  [K in keyof Sizes as `min-height-${string & K}`]: {
    minHeight: StyledDimension;
  };
};

export type StyleBuilderMaxHeightDefinitions<
  Sizes extends Record<string, StyledDimension>,
> = {
  [K in keyof Sizes as `max-height-${string & K}`]: {
    maxHeight: StyledDimension;
  };
};

export type StyleBuilderSizeDefinitions<
  Widths extends Record<string, StyledDimension>,
  Heights extends Record<string, StyledDimension>,
> = StyleBuilderWidthDefinitions<Widths> &
  StyleBuilderMinWidthDefinitions<Widths> &
  StyleBuilderMaxWidthDefinitions<Widths> &
  StyleBuilderHeightDefinitions<Heights> &
  StyleBuilderMinHeightDefinitions<Heights> &
  StyleBuilderMaxHeightDefinitions<Heights>;
