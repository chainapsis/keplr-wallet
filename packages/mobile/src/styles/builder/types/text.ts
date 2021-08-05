import {
  EnumFontStyle,
  EnumTextAlign,
  EnumTextTransform,
  StaticStylesDefinitions,
} from "./common";
import { getPlatformFontWeight } from "../utils";

export const StaticTextStyles = {
  italic: {
    fontStyle: "italic" as EnumFontStyle,
  },
  "not-italic": {
    fontStyle: "normal" as EnumFontStyle,
  },
  "font-thin": getPlatformFontWeight("100"),
  "font-extralight": getPlatformFontWeight("200"),
  "font-light": getPlatformFontWeight("300"),
  "font-normal": getPlatformFontWeight("400"),
  "font-medium": getPlatformFontWeight("500"),
  "font-semibold": getPlatformFontWeight("600"),
  "font-bold": getPlatformFontWeight("700"),
  "font-extrabold": getPlatformFontWeight("800"),
  "font-black": getPlatformFontWeight("900"),
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
