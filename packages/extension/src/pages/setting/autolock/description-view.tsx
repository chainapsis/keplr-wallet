import React, { FunctionComponent } from "react";

import styleDescriptionView from "./description-view.module.scss";
import { FormattedMessage } from "react-intl";

export const DescriptionView: FunctionComponent = () => {
  return (
    <div className={styleDescriptionView.innerContainer}>
      <img
        className={styleDescriptionView.imgLock}
        src={require("../../../public/assets/img/icons8-lock.svg")}
        alt="lock"
      />
      <p>
        <FormattedMessage id="setting.autolock.description" />
      </p>
    </div>
  );
};
