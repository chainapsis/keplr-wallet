import React, { FunctionComponent, MouseEvent, useCallback } from "react";

import styleWarningView from "./warning-view.module.scss";
import { Alert, Button } from "reactstrap";
import { useNavigate } from "react-router";
import { FormattedMessage } from "react-intl";

import { MultiKeyStoreInfoWithSelectedElem } from "@keplr-wallet/background";

export const WarningView: FunctionComponent<{
  index: number;
  keyStore: MultiKeyStoreInfoWithSelectedElem;
}> = ({ index, keyStore }) => {
  const navigate = useNavigate();

  const onBackUpMnemonicButtonClick = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();

      navigate(`/setting/export/${index}`);
    },
    [history, index]
  );

  return (
    <div className={styleWarningView.innerContainer}>
      {keyStore.type === "mnemonic" ? (
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
};
