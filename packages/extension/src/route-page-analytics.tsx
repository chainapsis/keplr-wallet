import { FunctionComponent, useEffect, useRef } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "./stores";
import { useLocation } from "react-router-dom";
import { Properties } from "@keplr-wallet/analytics";

export const RoutePageAnalytics: FunctionComponent<{
  prefix?: string;
}> = observer(({ prefix = "" }) => {
  const { analyticsStore } = useStore();

  const prevPathname = useRef("");
  const location = useLocation();

  useEffect(() => {
    let p: Properties = {
      page_location: `https://keplr.ext${prefix}${location.pathname}`,
      page_title: `${prefix}${location.pathname}`,
    };
    if (prevPathname.current) {
      p = {
        ...p,
        page_referrer: `https://keplr.ext${prefix}${prevPathname.current}`,
      };
    }

    analyticsStore.logEvent("page_view", p);

    prevPathname.current = location.pathname;
  }, [analyticsStore, location.pathname, prefix]);

  return null;
});
