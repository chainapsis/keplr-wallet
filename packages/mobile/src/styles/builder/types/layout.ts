import { StaticStylesDefinitions } from "./common";

export const StaticLayouts = {
  absolute: {
    position: "absolute",
  },
  relative: {
    position: "relative",
  },
  "absolute-fill": {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },

  flex: {
    display: "flex",
  },
  ["display-none"]: {
    display: "none",
  },

  ["flex-row"]: {
    flexDirection: "row",
  },
  ["flex-row-reverse"]: {
    flexDirection: "row-reverse",
  },
  ["flex-column"]: {
    flexDirection: "column",
  },
  ["flex-column-reverse"]: {
    flexDirection: "column-reverse",
  },

  ["content-start"]: {
    alignContent: "flex-start",
  },
  ["content-center"]: {
    alignContent: "center",
  },
  ["content-end"]: {
    alignContent: "flex-end",
  },
  ["content-stretch"]: {
    alignContent: "stretch",
  },
  ["content-between"]: {
    alignContent: "space-between",
  },
  ["content-around"]: {
    alignContent: "space-around",
  },

  ["items-start"]: {
    alignItems: "flex-start",
  },
  ["items-center"]: {
    alignItems: "center",
  },
  ["items-end"]: {
    alignItems: "flex-end",
  },
  ["items-stretch"]: {
    alignItems: "stretch",
  },
  ["items-baseline"]: {
    alignItems: "baseline",
  },

  ["self-auto"]: {
    alignSelf: "auto",
  },
  ["self-start"]: {
    alignSelf: "flex-start",
  },
  ["self-center"]: {
    alignSelf: "center",
  },
  ["self-end"]: {
    alignSelf: "flex-end",
  },
  ["self-stretch"]: {
    alignSelf: "stretch",
  },
  ["self-baseline"]: {
    alignSelf: "baseline",
  },

  ["justify-start"]: {
    justifyContent: "flex-start",
  },
  ["justify-center"]: {
    justifyContent: "center",
  },
  ["justify-end"]: {
    justifyContent: "flex-end",
  },
  ["justify-between"]: {
    justifyContent: "space-between",
  },
  ["justify-around"]: {
    justifyContent: "space-around",
  },
  ["justify-evenly"]: {
    justifyContent: "space-evenly",
  },

  ["overflow-visible"]: {
    overflow: "visible",
  },
  ["overflow-hidden"]: {
    overflow: "hidden",
  },
  ["overflow-scroll"]: {
    overflow: "scroll",
  },
};

export type StyleBuilderLayoutDefinitions = StaticStylesDefinitions<
  typeof StaticLayouts
>;
