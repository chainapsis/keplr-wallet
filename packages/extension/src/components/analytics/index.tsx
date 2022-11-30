import React, { FunctionComponent, useEffect } from "react";
import { useLocation } from "react-router";
import { useLanguage } from "../../languages";
import { useStore } from "../../stores";

type PathnameToPageName = {
  [pathname: string]: string | undefined;
};

const pathnameToPageName: PathnameToPageName = {
  "/": "Home dashboard",
  "/register": "Register",
  "/setting/address-book": "Address book",
  "/setting/set-keyring": "Select account",
};

export const LogPageViewWrapper: FunctionComponent = ({ children }) => {
  const location = useLocation();
  const loggingPageName = pathnameToPageName[location.pathname];

  const { chainStore, analyticsStore } = useStore();
  const language = useLanguage();

  useEffect(() => {
    if (loggingPageName) {
      const eventProperties = {
        chainId: chainStore.current.chainId,
        chainName: chainStore.current.chainName,
      };

      analyticsStore.setUserProperties({
        currency: language.fiatCurrency,
        language: language.language,
      });
      analyticsStore.logPageView(loggingPageName, eventProperties);
    }
  }, [
    analyticsStore,
    chainStore,
    language.fiatCurrency,
    language.language,
    loggingPageName,
  ]);

  return <React.Fragment>{children}</React.Fragment>;
};
