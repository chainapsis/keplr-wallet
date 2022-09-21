import { EncodeObject } from "@cosmjs/proto-signing";
import { DeliverTxResponse } from "@cosmjs/stargate";
import { Keplr } from "@keplr-wallet/provider";
import { BACKGROUND_PORT, Message } from "@keplr-wallet/router";
import { MessageRequesterExternal } from "@obi-wallet/common";
import { useMemo } from "react";

export class RequestObiSignAndBroadcastMsg extends Message<DeliverTxResponse> {
  public static type() {
    return "request-obi-sign-and-broadcast";
  }

  constructor(
    public readonly address: string,
    public readonly messages: EncodeObject[]
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.address) {
      throw new Error("address not set");
    }

    if (!this.messages) {
      throw new Error("messages not set");
    }
  }

  route(): string {
    return "obi";
  }

  type(): string {
    return RequestObiSignAndBroadcastMsg.type();
  }
}

class ConcreteKeplr extends Keplr {
  public async obiSignAndBroadcast(
    address: string,
    messages: EncodeObject[]
  ): Promise<DeliverTxResponse> {
    const msg = new RequestObiSignAndBroadcastMsg(address, messages);
    return await this.requester.sendMessage(BACKGROUND_PORT, msg);
  }
}

export function useKeplr({ url }: { url: string }) {
  const keplr = useMemo(() => {
    return new ConcreteKeplr(
      "0.10.10",
      "core",
      new MessageRequesterExternal({
        url: url,
        origin: new URL(url).origin,
      })
    );
  }, [url]);
  return keplr;
}
