/* eslint-disable import/no-extraneous-dependencies */
import React, { FunctionComponent } from "react";

import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import styleMenu from "./menu.module.scss";

import { FormattedMessage } from "react-intl";
import { useNavigate } from "react-router";

export const Menu: FunctionComponent = observer(() => {
  const { keyRingStore, analyticsStore } = useStore();
  const navigate = useNavigate();
  return (
    <div className={styleMenu["container"]}>
      <div
        className={styleMenu["item"]}
        onClick={() => {
          analyticsStore.logEvent("address_book_click", { pageName: "drawer" });
          navigate({
            pathname: "/more/address-book",
          });
        }}
      >
        <FormattedMessage id="main.menu.address-book" />
      </div>

      <div
        className={styleMenu["item"]}
        onClick={() => {
          navigate({
            pathname: "/setting",
          });
          analyticsStore.logEvent("settings_click", { pageName: "Drawer" });
        }}
      >
        <FormattedMessage id="main.menu.settings" />
      </div>
      <a
        className={styleMenu["item"]}
        href="https://docs.fetch.ai/fetch-wallet/"
        target="_blank"
        rel="noopener noreferrer"
      >
        <FormattedMessage id="main.menu.guide" />
      </a>
      {/* Empty div for separating last item */}
      <div style={{ flex: 1 }} />
      <div
        className={styleMenu["item"]}
        onClick={() => {
          keyRingStore.lock();
          analyticsStore.logEvent("sign_out_click");
          navigate("/");
        }}
      >
        <FormattedMessage id="main.menu.sign-out" />
      </div>
      <div>
        <hr className="mx-4 my-1" />
      </div>
      <div className={styleMenu["footer"]}>
        <a
          className={styleMenu["inner"]}
          href="https://github.com/fetchai/keplr-extension"
          target="_blank"
          rel="noopener noreferrer"
        >
          <i className="fab fa-github" />
          <FormattedMessage id="main.menu.footer.github" />
        </a>
      </div>
    </div>
  );
});
