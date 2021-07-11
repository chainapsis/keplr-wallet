import {
  EnumFontStyle,
  EnumFontWeight,
  EnumTextAlign,
  EnumTextTransform,
  StaticStylesDefinitions,
} from "./common";

export const StaticTextStyles = {
  italic: {
    fontStyle: "italic" as EnumFontStyle,
  },
  "not-italic": {
    fontStyle: "normal" as EnumFontStyle,
  },
  "font-thin": {
    fontWeight: "100" as EnumFontWeight,
  },
  "font-extralight": {
    fontWeight: "200" as EnumFontWeight,
  },
  "font-light": {
    fontWeight: "300" as EnumFontWeight,
  },
  "font-normal": {
    fontWeight: "400" as EnumFontWeight,
  },
  "font-medium": {
    fontWeight: "500" as EnumFontWeight,
  },
  "font-semibold": {
    fontWeight: "600" as EnumFontWeight,
  },
  "font-bold": {
    fontWeight: "700" as EnumFontWeight,
  },
  "font-extrabold": {
    fontWeight: "800" as EnumFontWeight,
  },
  "font-black": {
    fontWeight: "900" as EnumFontWeight,
  },
  uppercase: {
    textTransform: "uppercase" as EnumTextTransform,
  },
  lowercase: {
    textTransform: "lowercase" as EnumTextTransform,
  },
  capitalize: {
    textTransform: "capitalize" as EnumTextTransform,
  },
  "normal-case": {
    textTransform: "none" as EnumTextTransform,
  },
  "text-auto": {
    textAlign: "auto" as EnumTextAlign,
  },
  "text-left": {
    textAlign: "left" as EnumTextAlign,
  },
  "text-right": {
    textAlign: "right" as EnumTextAlign,
  },
  "text-center": {
    textAlign: "center" as EnumTextAlign,
  },
  "text-justify": {
    textAlign: "justify" as EnumTextAlign,
  },
};

export type StyleBuilderTextDefinitions = StaticStylesDefinitions<
  typeof StaticTextStyles
>;
