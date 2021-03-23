import React, { FunctionComponent } from "react";
import { Button } from "reactstrap";
import { useHistory } from "react-router";

import styleTransfer from "./ibc-transfer.module.scss";
import classnames from "classnames";

export const IBCTransferView: FunctionComponent = () => {
  const history = useHistory();

  return (
    <div className={styleTransfer.containerInner}>
      <div className={styleTransfer.vertical}>
        <p
          className={classnames(
            "h2",
            "my-0",
            "font-weight-normal",
            styleTransfer.paragraphMain
          )}
        >
          IBC Transfer
        </p>
        <p
          className={classnames(
            "h4",
            "my-0",
            "font-weight-normal",
            styleTransfer.paragraphSub
          )}
        >
          Send tokens over IBC
        </p>
      </div>
      <div style={{ flex: 1 }} />
      <Button
        className={styleTransfer.button}
        color="primary"
        size="sm"
        onClick={(e) => {
          e.preventDefault();

          history.push("/ibc-transfer");
        }}
      >
        Transfer
      </Button>
    </div>
  );
};
