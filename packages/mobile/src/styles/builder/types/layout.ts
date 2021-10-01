import {
  EnumAlignContent,
  EnumAlignItems,
  EnumAlignSelf,
  EnumDisplay,
  EnumFlexDirection,
  EnumFlexWrap,
  EnumJustifyContent,
  EnumOverflow,
  EnumPosition,
  StaticStylesDefinitions,
} from "./common";

export const StaticLayouts = {
  absolute: {
    position: "absolute" as EnumPosition,
  },
  relative: {
    position: "relative" as EnumPosition,
  },
  "absolute-fill": {
    position: "absolute" as EnumPosition,
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },

  flex: {
    display: "flex" as EnumDisplay,
  },
  ["display-none"]: {
    display: "none" as EnumDisplay,
  },

  ["flex-0"]: {
    flex: 0,
  },
  ["flex-1"]: {
    flex: 1,
  },
  ["flex-2"]: {
    flex: 2,
  },
  ["flex-3"]: {
    flex: 3,
  },
  ["flex-4"]: {
    flex: 4,
  },
  ["flex-5"]: {
    flex: 5,
  },
  ["flex-6"]: {
    flex: 6,
  },
  ["flex-7"]: {
    flex: 7,
  },
  ["flex-8"]: {
    flex: 8,
  },
  ["flex-9"]: {
    flex: 9,
  },
  ["flex-10"]: {
    flex: 10,
  },

  ["flex-grow-0"]: {
    flexGrow: 0,
  },
  ["flex-grow-1"]: {
    flexGrow: 1,
  },
  ["flex-grow-2"]: {
    flexGrow: 2,
  },
  ["flex-grow-3"]: {
    flexGrow: 3,
  },
  ["flex-grow-4"]: {
    flexGrow: 4,
  },
  ["flex-grow-5"]: {
    flexGrow: 5,
  },
  ["flex-grow-6"]: {
    flexGrow: 6,
  },
  ["flex-grow-7"]: {
    flexGrow: 7,
  },
  ["flex-grow-8"]: {
    flexGrow: 8,
  },
  ["flex-grow-9"]: {
    flexGrow: 9,
  },
  ["flex-grow-10"]: {
    flexGrow: 10,
  },

  ["flex-shrink-0"]: {
    flexShrink: 0,
  },
  ["flex-shrink-1"]: {
    flexShrink: 1,
  },
  ["flex-shrink-2"]: {
    flexShrink: 2,
  },
  ["flex-shrink-3"]: {
    flexShrink: 3,
  },
  ["flex-shrink-4"]: {
    flexShrink: 4,
  },
  ["flex-shrink-5"]: {
    flexShrink: 5,
  },
  ["flex-shrink-6"]: {
    flexShrink: 6,
  },
  ["flex-shrink-7"]: {
    flexShrink: 7,
  },
  ["flex-shrink-8"]: {
    flexShrink: 8,
  },
  ["flex-shrink-9"]: {
    flexShrink: 9,
  },
  ["flex-shrink-10"]: {
    flexShrink: 10,
  },

  ["flex-wrap"]: {
    flexWrap: "wrap" as EnumFlexWrap,
  },
  ["flex-wrap-reverse"]: {
    flexWrap: "wrap-reverse" as EnumFlexWrap,
  },
  ["flex-nowrap"]: {
    flexWrap: "nowrap" as EnumFlexWrap,
  },

  ["flex-row"]: {
    flexDirection: "row" as EnumFlexDirection,
  },
  ["flex-row-reverse"]: {
    flexDirection: "row-reverse" as EnumFlexDirection,
  },
  ["flex-column"]: {
    flexDirection: "column" as EnumFlexDirection,
  },
  ["flex-column-reverse"]: {
    flexDirection: "column-reverse" as EnumFlexDirection,
  },

  ["content-start"]: {
    alignContent: "flex-start" as EnumAlignContent,
  },
  ["content-center"]: {
    alignContent: "center" as EnumAlignContent,
  },
  ["content-end"]: {
    alignContent: "flex-end" as EnumAlignContent,
  },
  ["content-stretch"]: {
    alignContent: "stretch" as EnumAlignContent,
  },
  ["content-between"]: {
    alignContent: "space-between" as EnumAlignContent,
  },
  ["content-around"]: {
    alignContent: "space-around" as EnumAlignContent,
  },

  ["items-start"]: {
    alignItems: "flex-start" as EnumAlignItems,
  },
  ["items-center"]: {
    alignItems: "center" as EnumAlignItems,
  },
  ["items-end"]: {
    alignItems: "flex-end" as EnumAlignItems,
  },
  ["items-stretch"]: {
    alignItems: "stretch" as EnumAlignItems,
  },
  ["items-baseline"]: {
    alignItems: "baseline" as EnumAlignItems,
  },

  ["self-auto"]: {
    alignSelf: "auto" as EnumAlignSelf,
  },
  ["self-start"]: {
    alignSelf: "flex-start" as EnumAlignSelf,
  },
  ["self-center"]: {
    alignSelf: "center" as EnumAlignSelf,
  },
  ["self-end"]: {
    alignSelf: "flex-end" as EnumAlignSelf,
  },
  ["self-stretch"]: {
    alignSelf: "stretch" as EnumAlignSelf,
  },
  ["self-baseline"]: {
    alignSelf: "baseline" as EnumAlignSelf,
  },

  ["justify-start"]: {
    justifyContent: "flex-start" as EnumJustifyContent,
  },
  ["justify-center"]: {
    justifyContent: "center" as EnumJustifyContent,
  },
  ["justify-end"]: {
    justifyContent: "flex-end" as EnumJustifyContent,
  },
  ["justify-between"]: {
    justifyContent: "space-between" as EnumJustifyContent,
  },
  ["justify-around"]: {
    justifyContent: "space-around" as EnumJustifyContent,
  },
  ["justify-evenly"]: {
    justifyContent: "space-evenly" as EnumJustifyContent,
  },

  ["overflow-visible"]: {
    overflow: "visible" as EnumOverflow,
  },
  ["overflow-hidden"]: {
    overflow: "hidden" as EnumOverflow,
  },
  ["overflow-scroll"]: {
    overflow: "scroll" as EnumOverflow,
  },
};

export type StyleBuilderLayoutDefinitions = StaticStylesDefinitions<
  typeof StaticLayouts
>;
