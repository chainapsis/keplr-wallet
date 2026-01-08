import { createContext } from "react";
import { PageSimpleBar } from "./types";

export const PageSimpleBarContext = createContext<PageSimpleBar | null>(null);
