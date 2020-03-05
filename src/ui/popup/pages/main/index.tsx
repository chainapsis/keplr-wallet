import React, { FunctionComponent, useCallback, useState } from "react";

import { HeaderLayout } from "../../layouts";

import { Card, CardBody, Tooltip } from "reactstrap";

import style from "./style.module.scss";
import { Menu } from "./menu";
import { AccountView } from "./account";
import { TxButtonView } from "./tx-button";
import { AssetView } from "./asset";
import { StakeView } from "./stake";

import classnames from "classnames";
import { useStore } from "../../stores";
import { observer } from "mobx-react";
import { FormattedMessage } from "react-intl";

const SignOutButton: FunctionComponent = observer(() => {
  const { keyRingStore } = useStore();

  const [tooltipOpen, setTooltipOpen] = useState(false);
  const toggleTooltip = useCallback(() => {
    setTooltipOpen(!tooltipOpen);
  }, [tooltipOpen]);

  return (
    <div className={style.right}>
      <div style={{ flex: 1 }} />
      <div className={style.signOut}>
        <i
          id="btn-sign-out"
          className="fas fa-sign-out-alt"
          onClick={() => {
            keyRingStore.lock();
          }}
        />
        <Tooltip
          placement="bottom"
          isOpen={tooltipOpen}
          target="btn-sign-out"
          toggle={toggleTooltip}
          fade
        >
          <FormattedMessage id="main.menu.sign-out" />
        </Tooltip>
      </div>
      <div style={{ flex: 1 }} />
    </div>
  );
});

export const MainPage: FunctionComponent = () => {
  return (
    <HeaderLayout
      showChainName
      canChangeChainInfo
      menuRenderer={
        process.env.NODE_ENV === "development" ? <Menu /> : undefined
      }
      rightRenderer={<SignOutButton />}
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
