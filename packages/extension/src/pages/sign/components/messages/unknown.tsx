import React from "react";
import { Msg } from "@keplr-wallet/types";
import { AnyWithUnpacked } from "@keplr-wallet/cosmos";

export const UnknownMessage = {
  process(msg: Msg | AnyWithUnpacked): {
    icon: React.ReactElement;
    title: string;
    content: string | React.ReactElement;
  } {
    return {
      icon: <div>test</div>,
      title: "Unknown message",
      content: "TODO",
    };
  },
};
