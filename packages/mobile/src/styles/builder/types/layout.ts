import {
  EnumAlignContent,
  EnumAlignItems,
  EnumAlignSelf,
  EnumDisplay,
  EnumFlexDirection,
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
