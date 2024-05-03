import React, { FunctionComponent } from "react";

import styleWarningView from "./warning-view.module.scss";
import { FormattedMessage } from "react-intl";

export const WarningView: FunctionComponent = () => {
  return (
    <div className={styleWarningView["innerContainer"]}>
      <p>
        <FormattedMessage id="setting.export.warning" />
      </p>
    </div>
  );
};
