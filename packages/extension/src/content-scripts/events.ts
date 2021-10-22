import { Message, Router } from "@keplr-wallet/router";

class PushEventDataMsg extends Message<void> {
  public static type() {
    return "push-event-data";
  }

  constructor(
    public readonly data: {
      type: string;
      data: unknown;
    }
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.data.type) {
      throw new Error("Type should not be empty");
    }
  }

  route(): string {
    return "interaction-foreground";
  }

  type(): string {
    return PushEventDataMsg.type();
  }
}

export function initEvents(router: Router) {
  router.registerMessage(PushEventDataMsg);

  router.addHandler("interaction-foreground", (_, msg) => {
    switch (msg.constructor) {
      case PushEventDataMsg:
        if ((msg as PushEventDataMsg).data.type === "keystore-changed") {
          window.dispatchEvent(new Event("keplr_keystorechange"));
        }
        return;
      default:
        throw new Error("Unknown msg type");
    }
  });
}
