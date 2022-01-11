export type StaticStylesDefinitions<S> = {
  [K in keyof S]: S[K];
};

export type EnumDisplay = "none" | "flex";
export type EnumPosition = "absolute" | "relative";
export type EnumFlexWrap = "wrap" | "wrap-reverse" | "nowrap";
export type EnumFlexDirection =
  | "row"
  | "row-reverse"
  | "column"
  | "column-reverse";
export type EnumAlignContent =
  | "flex-start"
  | "flex-end"
  | "center"
  | "stretch"
  | "space-between"
  | "space-around";
export type EnumAlignItems =
  | "flex-start"
  | "flex-end"
  | "center"
  | "stretch"
  | "baseline";
export type EnumAlignSelf =
  | "auto"
  | "flex-start"
  | "flex-end"
  | "center"
  | "stretch"
  | "baseline";
export type EnumJustifyContent =
  | "flex-start"
  | "flex-end"
  | "center"
  | "space-between"
  | "space-around"
  | "space-evenly";

export type EnumOverflow = "visible" | "hidden" | "scroll";

export type EnumFontStyle = "normal" | "italic";

export type EnumFontWeight =
  | "normal"
  | "bold"
  | "100"
  | "200"
  | "300"
  | "400"
  | "500"
  | "600"
  | "700"
  | "800"
  | "900";

export type EnumTextTransform =
  | "none"
  | "capitalize"
  | "uppercase"
  | "lowercase";

export type EnumTextAlign = "auto" | "left" | "right" | "center" | "justify";

export type EnumTextDecorationLine =
  | "none"
  | "underline"
  | "line-through"
  | "underline line-through";

export type EnumBorderStyle = "solid" | "dotted" | "dashed";
