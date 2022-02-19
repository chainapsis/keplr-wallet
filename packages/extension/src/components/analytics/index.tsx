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

  const { chainStore, accountStore, analyticsStore } = useStore();
  const language = useLanguage();

  const account = accountStore.getAccount("cosmoshub-4");

  useEffect(() => {
    if (loggingPageName) {
      const eventProperties = {
        chainId: chainStore.current.chainId,
        chainName: chainStore.current.chainName,
      };

      if (account.bech32Address) {
        analyticsStore.setUserId(account.bech32Address);
      }
      analyticsStore.setUserProperties({
        currency: language.fiatCurrency,
        language: language.language,
      });
      analyticsStore.logPageView(loggingPageName, eventProperties);
    }
  }, [
    account.bech32Address,
    analyticsStore,
    chainStore,
    language.fiatCurrency,
    language.language,
    loggingPageName,
  ]);

  return <React.Fragment>{children}</React.Fragment>;
};
