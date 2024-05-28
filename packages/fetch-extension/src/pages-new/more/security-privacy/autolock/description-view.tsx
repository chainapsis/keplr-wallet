import React, { FunctionComponent } from "react";

import styleDescriptionView from "./description-view.module.scss";
import { FormattedMessage } from "react-intl";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";

export const DescriptionView: FunctionComponent = observer(() => {
  const { uiConfigStore } = useStore();

  return (
    <div className={styleDescriptionView["innerContainer"]}>
      <img
        className={styleDescriptionView["imgLock"]}
        src={require("@assets/png/ic_autolock.png")}
        alt="lock"
      />
      <div className={styleDescriptionView["heading"]}>Auto-lock timer</div>
      {uiConfigStore.platform !== "firefox" ? (
        <p>
          <FormattedMessage id="setting.autolock.description" />
        </p>
      ) : null}
    </div>
  );
});
