import { Message } from "@keplr/router";
import { ROUTE } from "./constants";
import { InteractionWaitingData } from "../types";

export class PushInteractionDataMsg extends Message<void> {
  public static type() {
    return "push-interaction-data";
  }

  constructor(public readonly data: InteractionWaitingData) {
    super();
  }

  validateBasic(): void {
    if (!this.data.type) {
      throw new Error("Type should not be empty");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return PushInteractionDataMsg.type();
  }
}
