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
    if (msg.constructor === PushEventDataMsg) {
      switch ((msg as PushEventDataMsg).data.type) {
        case "keystore-changed":
          window.dispatchEvent(new Event("keplr_keystorechange"));
          return;
        case "chain-changed":
          const { chainId } = (msg as PushEventDataMsg).data.data as any;
          window.dispatchEvent(
            new CustomEvent("keplr_chainchange", {
              detail: chainId,
            })
          );
          return;
      }
    } else {
      throw new Error("Unknown msg type");
    }
  });
}
