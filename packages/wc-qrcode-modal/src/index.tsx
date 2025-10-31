import React from "react";
import ReactDom from "react-dom";
import { Modal, ModalUIOptions } from "./modal";
import SignClient from "@walletconnect/sign-client";
import { ProposalTypes } from "@walletconnect/types";
import SessionProperties = ProposalTypes.SessionProperties;

export class KeplrQRCodeModalV2 {
  constructor(
    public readonly signClient: SignClient,
    protected readonly uiOptions?: ModalUIOptions
  ) {}

  async connect(chainIds: string[]): Promise<SessionProperties | undefined> {
    const { uri, approval } = await this.signClient.connect({
      requiredNamespaces: {
        cosmos: {
          methods: [
            "cosmos_getAccounts",
            "cosmos_signDirect",
            "cosmos_signAmino",
            "keplr_getKey",
            "keplr_signAmino",
            "keplr_signDirect",
            "keplr_signArbitrary",
            "keplr_enable",
            "keplr_signEthereum",
            "keplr_experimentalSuggestChain",
            "keplr_suggestToken",
          ],
          chains: [...chainIds.map((chainId) => `cosmos:${chainId}`)],
          events: ["accountsChanged", "chainChanged", "keplr_accountsChanged"],
        },
      },
    });

    if (!uri) {
      throw new Error("No uri");
    }

    try {
      this.open(uri, () => {});
      const session = await approval();
      return session.sessionProperties;
    } catch (e) {
      console.error(e);
    } finally {
      this.close();
    }
  }

  /**
   * Opens the QR code modal with the provided URI.
   * @param uri - The WalletConnect URI to display in the QR code
   * @param cb - Callback function to execute when the modal is closed (used for cleanup logic)
   */
  open(uri: string, cb: any) {
    const wrapper = document.createElement("div");
    wrapper.setAttribute("id", "keplr-qrcode-modal-v2");
    document.body.appendChild(wrapper);

    ReactDom.render(
      <Modal
        uri={uri}
        close={() => {
          this.close();
          cb();
        }}
        uiOptions={this.uiOptions}
      />,
      wrapper
    );
  }

  close() {
    const wrapper = document.getElementById("keplr-qrcode-modal-v2");
    if (wrapper) {
      document.body.removeChild(wrapper);
    }
  }
}
