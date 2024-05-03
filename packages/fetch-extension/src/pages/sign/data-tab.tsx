import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { SignDocHelper } from "@keplr-wallet/hooks";

import style from "./style.module.scss";
import { EthSignType } from "@keplr-wallet/types";

export const DataTab: FunctionComponent<{
  signDocHelper: SignDocHelper;
  ethSignType?: EthSignType;
}> = observer(({ signDocHelper, ethSignType }) => {
  if (
    ethSignType === EthSignType.TRANSACTION &&
    signDocHelper.signDocWrapper &&
    signDocHelper.signDocWrapper.mode === "amino" &&
    signDocHelper.signDocWrapper.aminoSignDoc.msgs.length === 1 &&
    signDocHelper.signDocWrapper.aminoSignDoc.msgs[0].type ===
      "sign/MsgSignData"
  ) {
    const decoder = new TextDecoder();
    const jsonStr = decoder.decode(
      Buffer.from(
        signDocHelper.signDocWrapper.aminoSignDoc.msgs[0].value.data,
        "base64"
      )
    );
    const ethPayload = JSON.stringify(JSON.parse(jsonStr), undefined, 2);
    return <pre className={style["message"]}>{ethPayload}</pre>;
  }

  const content = JSON.stringify(signDocHelper.signDocJson, undefined, 2);
  return <pre className={style["message"]}>{content}</pre>;
});
