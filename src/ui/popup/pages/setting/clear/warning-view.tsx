import React, { FunctionComponent, useCallback } from "react";

import styleWarningView from "./warning-view.module.scss";
import { Alert, Button } from "reactstrap";
import { useHistory } from "react-router";

export const WarningView: FunctionComponent = () => {
  const history = useHistory();

  return (
    <div className={styleWarningView.innerContainer}>
      <Alert color="warning" fade={false}>
        <div>
          Make sure you’ve backed up your mnemonic seed before proceeding.
        </div>
        <Button
          size="sm"
          style={{ float: "right", marginTop: "10px" }}
          color="white"
          outline
          onClick={useCallback(
            e => {
              e.preventDefault();

              history.push("/setting/export");
            },
            [history]
          )}
        >
          Back-up account
        </Button>
      </Alert>
      <div className={styleWarningView.trashContainer}>
        <img
          src={require("../../../public/assets/img/icons8-trash-can.svg")}
          alt="trash-can"
        />
        <div>
          By deleting your account, you will no longer have access to your
          wallet on Keplr.
        </div>
      </div>
    </div>
  );
};
