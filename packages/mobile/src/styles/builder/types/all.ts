import { StyleBuilderColorDefinitions } from "./color";
import { StyleBuilderPaddingDefinitions } from "./padding";
import { StyleBuilderMarginDefinitions } from "./margin";
import { StaticBorderStyles, StyleBuilderBorderDefinitions } from "./border";
import { StaticLayouts, StyleBuilderLayoutDefinitions } from "./layout";
import { StyleBuilderOpacityDefinitions } from "./opacity";
import { StaticImageStyles, StyleBuilderImageDefinitions } from "./image";
import { StaticTextStyles, StyleBuilderTextDefinitions } from "./text";
import { StaticStylesDefinitions } from "./common";
import { StyleBuilderSizeDefinitions } from "./size";

export const StaticStyles = {
  ...StaticLayouts,
  ...StaticBorderStyles,
  ...StaticImageStyles,
  ...StaticTextStyles,
};

export type StyleBuilderDefinitions<
  Custom extends Record<string, unknown>,
  Colors extends Record<string, string>,
  Widths extends Record<string, string | number>,
  Heights extends Record<string, string | number>,
  PaddingSizes extends Record<string, string | number>,
  MarginSizes extends Record<string, string | number>,
  BorderWidths extends Record<string, number>,
  BorderRadiuses extends Record<string, number>,
  Opacities extends Record<string, number>
> = StaticStylesDefinitions<Custom> &
  StyleBuilderLayoutDefinitions &
  StyleBuilderColorDefinitions<Colors> &
  StyleBuilderSizeDefinitions<Widths, Heights> &
  StyleBuilderPaddingDefinitions<PaddingSizes> &
  StyleBuilderMarginDefinitions<MarginSizes> &
  StyleBuilderBorderDefinitions<BorderWidths, BorderRadiuses> &
  StyleBuilderOpacityDefinitions<Opacities> &
  StyleBuilderImageDefinitions &
  StyleBuilderTextDefinitions;
