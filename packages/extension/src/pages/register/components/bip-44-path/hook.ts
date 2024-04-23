import { useState } from "react";
import { BIP44PathState } from "./state";

// CONTRACT: Use with `observer`
export const useBIP44PathState = (isLedger?: boolean) => {
  const [state] = useState(() => new BIP44PathState(isLedger));
  state.setIsLedger(isLedger ?? false);
  return state;
};
