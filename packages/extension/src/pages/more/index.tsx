import React, { FunctionComponent } from "react";
import { useHistory } from "react-router";
import { HeaderLayout } from "../../layouts";
import { Card, CardBody } from "reactstrap";
import { IBCTransferView } from "../main/ibc-transfer";
import classnames from "classnames";
import style from "./style.module.scss";
import { Menu } from "../main/menu";

export const MorePage: FunctionComponent = () => {
  const history = useHistory();

  return (
    <HeaderLayout
      showChainName={true}
      canChangeChainInfo={true}
      menuRenderer={<Menu />}
      rightRenderer={
        <div
          style={{
            height: "64px",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            paddingRight: "20px",
          }}
        >
          <div
            style={{ width: "16px", cursor: "pointer" }}
            onClick={(e) => {
              e.preventDefault();

              history.push("/setting/set-keyring");
            }}
          >
            <i className="fa fa-user" aria-hidden="true"></i>
          </div>
        </div>
      }
    >
      <Card className={classnames(style.card, "shadow")}>
        <CardBody>
          <IBCTransferView />
        </CardBody>
      </Card>
    </HeaderLayout>
  );
};
