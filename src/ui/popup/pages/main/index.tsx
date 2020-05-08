import React, { FunctionComponent } from "react";

import { HeaderLayout } from "../../layouts";

import { Card, CardBody } from "reactstrap";

import style from "./style.module.scss";
import { Menu } from "./menu";
import { AccountView } from "./account";
import { TxButtonView } from "./tx-button";
import { AssetView } from "./asset";
import { FaucetView } from "./faucet";
import { TokensView } from "./tokens";

import classnames from "classnames";

export const MainPage: FunctionComponent = () => {
  return (
    <HeaderLayout showChainName canChangeChainInfo menuRenderer={<Menu />}>
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
          <TokensView />
        </CardBody>
      </Card>
      <Card className={classnames(style.card, "shadow")}>
        <CardBody>
          <FaucetView />
        </CardBody>
      </Card>
    </HeaderLayout>
  );
};
