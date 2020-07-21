import React, { FunctionComponent, useCallback } from "react";

import styleWarningView from "./warning-view.module.scss";
import { Alert, Button } from "reactstrap";
import { useHistory } from "react-router";
import { FormattedMessage } from "react-intl";

export const WarningView: FunctionComponent = () => {
  const history = useHistory();

  return (
    <div className={styleWarningView.innerContainer}>
      <Alert color="warning" fade={false}>
        <div>
          <FormattedMessage id="setting.clear.alert" />
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
          <FormattedMessage id="setting.clear.button.back-up" />
        </Button>
      </Alert>
      <div className={styleWarningView.trashContainer}>
        <img
          src={require("../../../public/assets/img/icons8-trash-can.svg")}
          alt="trash-can"
        />
        <div>
          <FormattedMessage id="setting.clear.warning" />
        </div>
      </div>
    </div>
  );
};
