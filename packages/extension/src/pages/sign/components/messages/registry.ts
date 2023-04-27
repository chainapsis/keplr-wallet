import React from "react";
import { IMessageRenderer, IMessageRenderRegistry } from "./types";
import { Msg } from "@keplr-wallet/types";
import { AnyWithUnpacked } from "@keplr-wallet/cosmos";
import { UnknownMessage } from "./unknown";
import { ClaimRewardsMessage } from "./render/claim-rewards";

export class MessageRenderRegistry implements IMessageRenderRegistry {
  protected renderers: IMessageRenderer[] = [];

  register(renderer: IMessageRenderer): void {
    this.renderers.push(renderer);
  }

  render(msg: Msg | AnyWithUnpacked): {
    icon: React.ReactElement;
    title: string;
    content: string | React.ReactElement;
  } {
    try {
      for (const renderer of this.renderers) {
        const res = renderer.process(msg);
        if (res) {
          return res;
        }
      }
    } catch (e) {
      console.log(e);
      // Fallback to unknown message
    }

    return UnknownMessage.process(msg);
  }
}

export const defaultRegistry = new MessageRenderRegistry();
defaultRegistry.register(ClaimRewardsMessage);
