import React from "react";
import { FunctionComponent } from "react";
import style from "./style.module.scss";
import classnames from "classnames";
import { FormattedMessage } from "react-intl";
import { Button } from "reactstrap";
import { useHistory } from "react-router";

export const FNSView: FunctionComponent = () => {
  const history = useHistory();
  return (
    <div className={style.containerInner}>
      <div className={style.vertical}>
        <p
          className={classnames(
            "h2",
            "my-0",
            "font-weight-normal",
            style.paragraphMain
          )}
        >
          <FormattedMessage id="main.fns.title" />
        </p>
        <p
          className={classnames(
            "h4",
            "my-0",
            "font-weight-normal",
            style.paragraphSub
          )}
        >
          <FormattedMessage id="main.fns.paragraph" />
        </p>
      </div>
      <div style={{ flex: 1 }} />

      <Button
        className={style.button}
        color="primary"
        size="sm"
        onClick={() => {
          history.push("/fetch-name-service");
        }}
      >
        <FormattedMessage id="main.fns.button" />
      </Button>
    </div>
  );
};
