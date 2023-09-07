import {StyleBuilderColorDefinitions} from './color';
import {StyleBuilderPaddingDefinitions} from './padding';
import {StyleBuilderMarginDefinitions} from './margin';
import {StaticBorderStyles, StyleBuilderBorderDefinitions} from './border';
import {StaticLayouts, StyleBuilderLayoutDefinitions} from './layout';
import {StyleBuilderOpacityDefinitions} from './opacity';
import {StaticImageStyles, StyleBuilderImageDefinitions} from './image';
import {StaticTextStyles, StyleBuilderTextDefinitions} from './text';
import {StaticStylesDefinitions} from './common';
import {StyleBuilderSizeDefinitions} from './size';
import {StyledDimension} from './dimension';
import {StyleBuilderGapDefinitions} from './gap';

export const StaticStyles = {
  ...StaticLayouts,
  ...StaticBorderStyles,
  ...StaticImageStyles,
  ...StaticTextStyles,
};

export type StyleBuilderDefinitions<
  Custom extends Record<string, unknown>,
  Colors extends Record<string, string>,
  Widths extends Record<string, StyledDimension>,
  Heights extends Record<string, StyledDimension>,
  PaddingSizes extends Record<string, StyledDimension>,
  MarginSizes extends Record<string, StyledDimension>,
  BorderWidths extends Record<string, number>,
  BorderRadiuses extends Record<string, number>,
  Opacities extends Record<string, number>,
  Gaps extends Record<string, number>,
> = StaticStylesDefinitions<Custom> &
  StyleBuilderLayoutDefinitions &
  StyleBuilderColorDefinitions<Colors> &
  StyleBuilderSizeDefinitions<Widths, Heights> &
  StyleBuilderPaddingDefinitions<PaddingSizes> &
  StyleBuilderMarginDefinitions<MarginSizes> &
  StyleBuilderBorderDefinitions<BorderWidths, BorderRadiuses> &
  StyleBuilderOpacityDefinitions<Opacities> &
  StyleBuilderGapDefinitions<Gaps> &
  StyleBuilderImageDefinitions &
  StyleBuilderTextDefinitions;
