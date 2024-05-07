import { createContext } from "react";
import { Confirm } from "./types";

export const ConfirmContext = createContext<Confirm | null>(null);
