import { StaticStylesDefinitions } from "./common";

export const StaticImageStyles = {
  ["resize-cover"]: {
    resizeMode: "cover",
  },
  ["resize-contain"]: {
    resizeMode: "contain",
  },
  ["resize-stretch"]: {
    resizeMode: "stretch",
  },
  ["resize-repeat"]: {
    resizeMode: "repeat",
  },
  ["resize-center"]: {
    resizeMode: "center",
  },
};

export type StyleBuilderImageDefinitions = StaticStylesDefinitions<
  typeof StaticImageStyles
>;
