import React, { FunctionComponent, useCallback } from "react";

import styleMenu from "./menu.module.scss";
import { observer } from "mobx-react";
import { useStore } from "../../stores";

import { FormattedMessage } from "react-intl";
import { useHistory } from "react-router";

export const Menu: FunctionComponent = observer(() => {
  const { chainStore, keyRingStore } = useStore();

  const history = useHistory();

  return (
    <div className={styleMenu.container}>
      <div
        className={styleMenu.item}
        onClick={useCallback(() => {
          history.push({
            pathname: "/setting/address-book"
          });
        }, [history])}
      >
        <FormattedMessage id="main.menu.address-book" />
      </div>
      <div
        className={styleMenu.item}
        onClick={useCallback(() => {
          history.push({
            pathname: "/setting"
          });
        }, [history])}
      >
        <FormattedMessage id="main.menu.settings" />
      </div>
      {(chainStore.chainInfo.features ?? []).find(
        feature => feature === "cosmwasm"
      ) ? (
        <div
          className={styleMenu.item}
          onClick={() => {
            history.push({
              pathname: "/setting/token/add"
            });
          }}
        >
          Add Token
        </div>
      ) : null}
      {/* Empty div for separating last item */}
      <div style={{ flex: 1 }} />
      <div
        className={styleMenu.item}
        onClick={useCallback(() => {
          keyRingStore.lock();
        }, [keyRingStore])}
      >
        <FormattedMessage id="main.menu.sign-out" />
      </div>
      <div>
        <hr className="mx-4 my-1" />
      </div>
      <div className={styleMenu.footer}>
        <a
          className={styleMenu.inner}
          href="https://github.com/everett-protocol/keplr-extension"
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
