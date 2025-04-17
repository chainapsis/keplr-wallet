import { Message, Router } from "@keplr-wallet/router";

class PushEventDataMsg<D = unknown> extends Message<void> {
  public static type() {
    return "push-event-data";
  }

  constructor(
    public readonly data: {
      type: string;
      data: D;
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
        switch ((msg as PushEventDataMsg).data.type) {
          case "keystore-changed":
            return window.dispatchEvent(new Event("keplr_keystorechange"));
          case "keplr_chainChanged":
            return window.dispatchEvent(
              new CustomEvent("keplr_chainChanged", {
                detail: {
                  ...(
                    msg as PushEventDataMsg<{
                      origin: string;
                      evmChainId: number;
                    }>
                  ).data.data,
                },
              })
            );
          case "keplr_starknetChainChanged":
            return window.dispatchEvent(
              new CustomEvent("keplr_starknetChainChanged", {
                detail: {
                  ...(
                    msg as PushEventDataMsg<{
                      origin: string;
                      starknetChainId: string;
                    }>
                  ).data.data,
                },
              })
            );
          case "keplr_bitcoinChainChanged":
            return window.dispatchEvent(
              new CustomEvent("keplr_bitcoinChainChanged", {
                detail: {
                  ...(
                    msg as PushEventDataMsg<{
                      origin: string;
                      bitcoinChainId: string;
                      network: string;
                    }>
                  ).data.data,
                },
              })
            );
          case "keplr_ethSubscription":
            return window.dispatchEvent(
              new CustomEvent("keplr_ethSubscription", {
                detail: {
                  ...(
                    msg as PushEventDataMsg<{
                      origin: string;
                      data: { subscription: string; result: any };
                    }>
                  ).data.data,
                },
              })
            );
          case "keplr_bitcoinAccountsChanged":
            return window.dispatchEvent(
              new CustomEvent("keplr_bitcoinAccountsChanged", {
                detail: {
                  ...(msg as PushEventDataMsg<{ paymentType: string }>).data
                    .data,
                },
              })
            );
        }
        return;
      default:
        throw new Error("Unknown msg type");
    }
  });
}
