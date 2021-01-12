import React, { FunctionComponent, useMemo } from "react";

import style from "./style.module.scss";
import { SignDocWrapper } from "./wrapper";

const Buffer = require("buffer/").Buffer;

export const DataTab: FunctionComponent<{
  messageHex: string;
}> = ({ messageHex }) => {
  const wrapper = useMemo(() => {
    if (messageHex) {
      return new SignDocWrapper(Buffer.from(messageHex, "hex"));
    }
  }, [messageHex]);

  return (
    <pre className={style.message}>
      {wrapper ? wrapper.toString() : "Preparing..."}
    </pre>
  );
};
