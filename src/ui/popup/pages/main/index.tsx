import React, { FunctionComponent, MouseEvent, useCallback } from "react";

import { HeaderLayout } from "../../layouts";

import { Card, CardBody } from "reactstrap";

import style from "./style.module.scss";
import { Menu } from "./menu";
import { AccountView } from "./account";
import { TxButtonView } from "./tx-button";
import { AssetView } from "./asset";
import { StakeView } from "./stake";

import classnames from "classnames";
import { useHistory } from "react-router";

export const MainPage: FunctionComponent = () => {
  const history = useHistory();

  const onSelectAccountClick = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();

      history.push("/setting/set-keyring");
    },
    [history]
  );

  return (
    <HeaderLayout
      showChainName
      canChangeChainInfo
      menuRenderer={<Menu />}
      rightRenderer={
        <div
          style={{
            height: "64px",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            paddingRight: "12px",
            cursor: "pointer"
          }}
        >
          <i className="fas fa-user" onClick={onSelectAccountClick} />
        </div>
      }
    >
      <Card className={classnames(style.card, "shadow")}>
        <CardBody>
          <div className={style.containerAccountInner}>
            <AccountView />
            <AssetView />
            <TxButtonView />
          </div>
        </CardBody>
      </Card>
      <Card className={classnames(style.card, "shadow")}>
        <CardBody>
          <StakeView />
        </CardBody>
      </Card>
    </HeaderLayout>
  );
};
