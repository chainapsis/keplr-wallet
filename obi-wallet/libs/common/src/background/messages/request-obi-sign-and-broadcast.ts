import { EncodeObject } from "@cosmjs/proto-signing";
import { DeliverTxResponse } from "@cosmjs/stargate";
import { BACKGROUND_PORT, Message } from "@keplr-wallet/router";

import { MessageRequesterInternal } from "../../message-requester";
import { Multisig, MultisigKey } from "../../stores";

export interface RequestObiSignAndBroadcastPayload {
  readonly id: string;
  readonly multisig: Multisig | null;
  readonly encodeObjects: EncodeObject[];
  readonly wrap?: boolean;
  readonly cancelable?: boolean;
  readonly hiddenKeyIds?: MultisigKey[];
  readonly isOnboarding?: boolean;
}

export class RequestObiSignAndBroadcastMsg extends Message<DeliverTxResponse> {
  public static type() {
    return "request-obi-sign-and-broadcast";
  }

  public static async send(payload: RequestObiSignAndBroadcastPayload) {
    const msg = new RequestObiSignAndBroadcastMsg(payload);
    return await new MessageRequesterInternal().sendMessage(
      BACKGROUND_PORT,
      msg
    );
  }

  constructor(public readonly payload: RequestObiSignAndBroadcastPayload) {
    super();
  }

  validateBasic(): void {
    if (!this.payload.id) {
      throw new Error("id not set");
    }

    if (!this.payload.encodeObjects) {
      throw new Error("encodeObjects not set");
    }
  }

  route(): string {
    return "obi";
  }

  type(): string {
    return RequestObiSignAndBroadcastMsg.type();
  }
}
