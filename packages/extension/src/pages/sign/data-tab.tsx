import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { SignDocHelper } from "@keplr-wallet/hooks";

import style from "./style.module.scss";

export const DataTab: FunctionComponent<{
  signDocHelper: SignDocHelper;
}> = observer(({ signDocHelper }) => {
  return (
    <pre className={style.message}>
      {JSON.stringify(signDocHelper.signDocJson, undefined, 2)}
    </pre>
  );
});
