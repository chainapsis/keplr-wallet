import classnames from "classnames";
import React, { FunctionComponent } from "react";
import { Card, CardBody } from "reactstrap";
import { SwitchUser } from "../../components/switch-user";
import { HeaderLayout } from "../../layouts";
import { IBCTransferView } from "../main/ibc-transfer";
import { Menu } from "../main/menu";
import style from "./style.module.scss";

export const MorePage: FunctionComponent = () => {
  return (
    <HeaderLayout
      showChainName={true}
      canChangeChainInfo={true}
      menuRenderer={<Menu />}
      rightRenderer={<SwitchUser />}
    >
      <Card className={classnames(style.card, "shadow")}>
        <CardBody>
          <IBCTransferView />
        </CardBody>
      </Card>
    </HeaderLayout>
  );
};
