import React, { FunctionComponent } from "react";
import { ResMsg } from "../types";
import { MsgRelationSend } from "./send";

export const MsgItemRender: FunctionComponent<{
  msg: ResMsg;
  prices?: Record<string, Record<string, number | undefined> | undefined>;
  targetDenom: string;
}> = ({ msg, prices, targetDenom }) => {
  switch (msg.relation) {
    case "send": {
      return (
        <MsgRelationSend msg={msg} prices={prices} targetDenom={targetDenom} />
      );
    }
  }

  // TODO: 임시적인 alternative?
  return null;
};
