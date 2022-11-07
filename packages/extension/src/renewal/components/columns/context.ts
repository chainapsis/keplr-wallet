import { createContext } from "react";

interface ColumnsContextValue {
  space: string;
}

export const ColumnsContext = createContext<ColumnsContextValue>({
  space: "0px",
});
