import React, { FunctionComponent, useMemo } from "react";
import { observer } from "mobx-react-lite";
import { SignDocHelper } from "@keplr-wallet/hooks";

import style from "./style.module.scss";
import { EthSignType } from "@keplr-wallet/types";

export const DataTab: FunctionComponent<{
  signDocHelper: SignDocHelper;
  ethSignType?: EthSignType;
}> = observer(({ signDocHelper, ethSignType }) => {
  const content = useMemo(() => {
    if (
      ethSignType !== EthSignType.TRANSACTION ||
      !signDocHelper.signDocWrapper ||
      signDocHelper.signDocWrapper.aminoSignDoc.msgs.length !== 1 ||
      signDocHelper.signDocWrapper.aminoSignDoc.msgs[0].type !==
        "sign/MsgSignData"
    ) {
      return JSON.stringify(signDocHelper.signDocJson, undefined, 2);
    }

    const decoder = new TextDecoder();
    const jsonStr = decoder.decode(
      Buffer.from(
        signDocHelper.signDocWrapper.aminoSignDoc.msgs[0].value.data,
        "base64"
      )
    );
    return JSON.stringify(JSON.parse(jsonStr), undefined, 2);
  }, [signDocHelper.signDocWrapper?.aminoSignDoc.msgs, ethSignType]);

  return <pre className={style["message"]}>{content}</pre>;
});
