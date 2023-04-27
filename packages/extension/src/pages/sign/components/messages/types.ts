import React from "react";
import { Msg } from "@keplr-wallet/types";
import { AnyWithUnpacked } from "@keplr-wallet/cosmos";

export interface IMessageRenderer {
  process(msg: Msg | AnyWithUnpacked):
    | {
        icon: React.ReactElement;
        title: string;
        content: string | React.ReactElement;
      }
    | undefined;
}

export interface IMessageRenderRegistry {
  register(renderer: IMessageRenderer): void;

  render(msg: Msg | AnyWithUnpacked): {
    icon: React.ReactElement;
    title: string;
    content: string | React.ReactElement;
  };
}
