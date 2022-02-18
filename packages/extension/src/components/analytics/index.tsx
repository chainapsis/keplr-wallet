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

  const { chainStore, accountStore, analytics } = useStore();
  const language = useLanguage();

  const account = accountStore.getAccount("cosmoshub-4");

  useEffect(() => {
    if (analytics.isInitialized && loggingPageName) {
      const eventProperties = {
        chainId: chainStore.current.chainId,
        chainName: chainStore.current.chainName,
      };

      account.bech32Address && analytics.setUserId(account.bech32Address);
      analytics.setUserProperties({
        currency: language.fiatCurrency,
        language: language.language,
      });
      analytics.logPageView(loggingPageName, eventProperties);
    }
  }, [analytics.isInitialized, loggingPageName]);

  return <>{children}</>;
};
