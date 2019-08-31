import React from "react";

import { Header } from "../../components/header";

import { AccountInfo } from "./account-info";

import style from "./style.scss";

class MainPage extends React.Component {
  public render() {
    return (
      <div className={style.container}>
        <Header
          left={
            <img
              className={style["menu-img"]}
              src={require("assets/_ionicons_svg_md-menu.svg")}
            />
          }
        />
        <div className={style.containerAccount}>
          <AccountInfo />
        </div>
        <div className={style.containerTxs} />
      </div>
    );
  }
}

export default MainPage;
