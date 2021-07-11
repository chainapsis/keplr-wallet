export type StaticStylesDefinitions<S> = {
  [K in keyof S]: S[K];
};

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
