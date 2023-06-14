import { createContext } from "react";
import { GlobalSimpleBar } from "./types";

export const GlobalSimpleBarContext = createContext<GlobalSimpleBar | null>(
  null
);
