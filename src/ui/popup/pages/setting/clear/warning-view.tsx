import React, { FunctionComponent, MouseEvent, useCallback } from "react";

import styleWarningView from "./warning-view.module.scss";
import { Alert, Button } from "reactstrap";
import { useHistory } from "react-router";
import { FormattedMessage } from "react-intl";
import { observer } from "mobx-react";
import { useStore } from "../../../stores";

export const WarningView: FunctionComponent = observer(() => {
  const history = useHistory();

  const { keyRingStore } = useStore();

  const onBackUpMnemonicButtonClick = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();

      history.push("/setting/export");
    },
    [history]
  );

  return (
    <div className={styleWarningView.innerContainer}>
      {keyRingStore.keyRingType === "mnemonic" ? (
        <Alert color="warning" fade={false}>
          <div>
            <FormattedMessage id="setting.clear.alert" />
          </div>
          <Button
            size="sm"
            style={{ float: "right", marginTop: "10px" }}
            color="white"
            outline
            onClick={onBackUpMnemonicButtonClick}
          >
            <FormattedMessage id="setting.clear.button.back-up" />
          </Button>
        </Alert>
      ) : null}
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
});
