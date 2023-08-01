import { FunctionComponent, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useGlobarSimpleBar } from "./hooks/global-simplebar";

export const PageChangeScrollTop: FunctionComponent = () => {
  const { pathname } = useLocation();

  const simplebar = useGlobarSimpleBar();

  useEffect(() => {
    if (simplebar.ref.current) {
      simplebar.ref.current.getScrollElement()?.scrollTo({
        top: 0,
        left: 0,
        // XXX: There is spec on MDN https://developer.mozilla.org/en-US/docs/Web/API/Window/scrollTo
        //      However, typescript doesn't have "instant" as type.
        behavior: "instant" as any,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return null;
};
