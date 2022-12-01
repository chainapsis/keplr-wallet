import React, { FunctionComponent } from "react";

import styleDescriptionView from "./description-view.module.scss";
import { FormattedMessage } from "react-intl";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";

export const DescriptionView: FunctionComponent = observer(() => {
  const { uiConfigStore } = useStore();

  return (
    <div className={styleDescriptionView.innerContainer}>
      <img
        className={styleDescriptionView.imgLock}
        src={require("../../../public/assets/img/icons8-lock.svg")}
        alt="lock"
      />

      {/* On firefox, idle api can't detect that device go sleep */}
      {uiConfigStore.platform !== "firefox" ? (
        <p>
          <FormattedMessage id="setting.autolock.description" />
        </p>
      ) : null}

      {/* <p>
        <FormattedMessage id="setting.autolock.description.title" />
      </p>
      <b>
        <FormattedMessage
          id="setting.autolock.description.note"
          values={{
            br: <br />,
          }}
        />
      </b> */}
    </div>
  );
});
