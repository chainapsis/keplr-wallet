import { ReactNode } from "react";

import { Provider } from "../src/app/provider";

export default ({ children }: { children: ReactNode }) => {
  return <Provider>{children}</Provider>;
};
