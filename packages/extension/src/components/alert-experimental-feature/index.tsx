import React, { FunctionComponent } from "react";
import style from "./style.module.scss";
import { FormattedMessage } from "react-intl";
import { Alert } from "reactstrap";

export const AlertExperimentalFeature: FunctionComponent = () => {
  return (
    <Alert className={style.warning} color="warning">
      <div className={style.imgContainer}>
        <img
          src={require("../../public/assets/img/icons8-test-tube.svg")}
          alt="experiment"
        />
      </div>
      <div className={style.content}>
        <div className={style.title}>
          <FormattedMessage id="component.waring.experimental-feature.title" />
        </div>
        <div className={style.paragraph}>
          <FormattedMessage id="component.waring.experimental-feature.paragraph" />
        </div>
      </div>
    </Alert>
  );
};
