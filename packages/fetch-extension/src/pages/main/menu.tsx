/* eslint-disable import/no-extraneous-dependencies */
import React, { FunctionComponent } from "react";

import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import styleMenu from "./menu.module.scss";

import { FormattedMessage } from "react-intl";
import { useNavigate } from "react-router";

export const Menu: FunctionComponent = observer(() => {
  const { chainStore, keyRingStore, analyticsStore } = useStore();
  const navigate = useNavigate();
  return (
    <div className={styleMenu["container"]}>
      <div
        className={styleMenu["item"]}
        onClick={() => {
          analyticsStore.logEvent("address_book_click", { pageName: "drawer" });
          navigate({
            pathname: "/setting/address-book",
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
      {(chainStore.current.features ?? []).find(
        (feature) =>
          feature === "cosmwasm" ||
          feature === "secretwasm" ||
          feature === "evm"
      ) ? (
        <div
          className={styleMenu["item"]}
          onClick={() => {
            navigate({
              pathname: "/setting/token/add",
            });
            analyticsStore.logEvent("add_token_click");
          }}
        >
          <FormattedMessage id="setting.token.add" />
        </div>
      ) : null}
      {(chainStore.current.features ?? []).find(
        (feature) =>
          feature === "cosmwasm" ||
          feature === "secretwasm" ||
          feature === "evm"
      ) ? (
        <div
          className={styleMenu["item"]}
          onClick={() => {
            navigate({
              pathname: "/setting/token/manage",
            });
            analyticsStore.logEvent("token_list_click");
          }}
        >
          <FormattedMessage id="main.menu.token-list" />
        </div>
      ) : null}
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
