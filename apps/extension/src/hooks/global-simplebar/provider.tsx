import React, {
  FunctionComponent,
  PropsWithChildren,
  useMemo,
  useRef,
} from "react";
import { GlobalSimpleBarContext } from "./internal";
import SimpleBar from "simplebar-react";
import SimpleBarCore from "simplebar-core";

export const GlobalSimpleBarProvider: FunctionComponent<
  PropsWithChildren<{
    style: React.CSSProperties;
  }>
> = ({ children, style }) => {
  const ref = useRef<SimpleBarCore | null>(null);

  return (
    <GlobalSimpleBarContext.Provider
      value={useMemo(() => {
        return {
          ref,
        };
      }, [])}
    >
      <SimpleBar style={style} ref={ref}>
        {children}
      </SimpleBar>
    </GlobalSimpleBarContext.Provider>
  );
};
