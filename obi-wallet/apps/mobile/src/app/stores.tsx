import { RootStore } from "@obi-wallet/common";
import { createContext, useContext } from "react";

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export const StoreContext = createContext<RootStore>(null!);

export function useStore() {
  return useContext(StoreContext);
}
