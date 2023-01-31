import { useState } from "react";
import { BIP44PathState } from "./state";

// CONTRACT: Use with `observer`
export const useBIP44PathState = () => {
  const [state] = useState(() => new BIP44PathState());
  return state;
};
