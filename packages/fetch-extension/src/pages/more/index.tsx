import { FNSView } from "@components/fns-view";
import { ProposalView } from "@components/proposal/proposal-view";
import { SwitchUser } from "@components/switch-user";
import { HeaderLayout } from "@layouts/index";
import classnames from "classnames";
import React, { FunctionComponent } from "react";
import { Card, CardBody } from "reactstrap";
import { FNS_CONFIG } from "../../config.ui.var";
import { useStore } from "../../stores";
import { IBCTransferView } from "../main/ibc-transfer";
import { Menu } from "../main/menu";
import style from "./style.module.scss";
export const MorePage: FunctionComponent = () => {
  const { chainStore } = useStore();
  return (
    <HeaderLayout
      showChainName={true}
      canChangeChainInfo={true}
      menuRenderer={<Menu />}
      rightRenderer={<SwitchUser />}
    >
      <Card className={classnames(style["card"], "shadow")}>
        <CardBody>
          <IBCTransferView />
        </CardBody>
      </Card>

      {chainStore.current.govUrl && (
        <Card className={classnames(style["card"], "shadow")}>
          <CardBody>
            <ProposalView />
          </CardBody>
        </Card>
      )}

      {Object.keys(FNS_CONFIG).includes(chainStore.current.chainId) && (
        <Card className={classnames(style["card"], "shadow")}>
          <CardBody>
            <FNSView />
          </CardBody>
        </Card>
      )}
    </HeaderLayout>
  );
};
