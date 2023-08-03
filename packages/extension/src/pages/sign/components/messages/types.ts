import React from "react";
import { Msg } from "@keplr-wallet/types";
import { AnyWithUnpacked, ProtoCodec } from "@keplr-wallet/cosmos";

export interface IMessageRenderer {
  process(
    chainId: string,
    msg: Msg | AnyWithUnpacked,
    protoCodec: ProtoCodec
  ):
    | {
        icon: React.ReactElement;
        title: string | React.ReactElement;
        content: string | React.ReactElement;
      }
    | undefined;
}

export interface IMessageRenderRegistry {
  register(renderer: IMessageRenderer): void;

  render(
    chainId: string,
    protoCodec: ProtoCodec,
    msg: Msg | AnyWithUnpacked
  ): {
    icon: React.ReactElement;
    title: string | React.ReactElement;
    content: string | React.ReactElement;
  };
}
