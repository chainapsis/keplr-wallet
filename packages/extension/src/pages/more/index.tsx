import React, { FunctionComponent } from "react";
import { useHistory } from "react-router";
import { HeaderLayout } from "../../layouts";
import bellIcon from "../../public/assets/icon/bell.png";
import { Card, CardBody } from "reactstrap";
import { IBCTransferView } from "../main/ibc-transfer";
import classnames from "classnames";
import style from "./style.module.scss";

export const MorePage: FunctionComponent = () => {
  const history = useHistory();

  return (
    <HeaderLayout
      showChainName={true}
      canChangeChainInfo={true}
      onBackButton={() => {
        history.goBack();
      }}
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
          <img
            src={bellIcon}
            alt="notification"
            style={{ width: "16px", cursor: "pointer" }}
            onClick={(e) => {
              e.preventDefault();

              history.push("/setting/set-keyring");
            }}
          />
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
