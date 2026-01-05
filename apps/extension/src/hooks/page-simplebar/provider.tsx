import React, {
  FunctionComponent,
  PropsWithChildren,
  useMemo,
  useRef,
} from "react";
import { PageSimpleBarContext } from "./internal";
import SimpleBar from "simplebar-react";
import SimpleBarCore from "simplebar-core";

export const PageSimpleBarProvider: FunctionComponent<
  PropsWithChildren<{
    style: React.CSSProperties;
  }>
> = ({ children, style }) => {
  const ref = useRef<SimpleBarCore | null>(null);

  return (
    <PageSimpleBarContext.Provider
      value={useMemo(() => {
        return {
          ref,
        };
      }, [])}
    >
      <SimpleBar style={style} ref={ref}>
        {children}
      </SimpleBar>
    </PageSimpleBarContext.Provider>
  );
};
