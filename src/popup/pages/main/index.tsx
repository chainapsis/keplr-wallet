import React from "react";

import { HeaderLayout } from "../../layouts/HeaderLayout";

import { AccountInfo } from "./account-info";

import style from "./style.module.scss";

const Test: React.FunctionComponent = () => {
  return (
    <aside className="menu">
      <p className="menu-label">General</p>
      <ul className="menu-list">
        <li>
          <a>Test</a>
        </li>
      </ul>
    </aside>
  );
};

export class MainPage extends React.Component {
  public render() {
    return (
      <HeaderLayout showChainName canChangeChainInfo menuRenderer={<Test />}>
        <div className={style.containerAccount}>
          <AccountInfo />
        </div>
        <div className={style.containerTxs} />
      </HeaderLayout>
    );
  }
}
