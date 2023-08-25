import { BroadcastMode, Keplr } from "@keplr-wallet/types";
import SignClient from "@walletconnect/sign-client";
import { KeplrQRCodeModalV2 } from "@keplr-wallet/wc-qrcode-modal";
import { KeplrWalletConnectV2 } from "@keplr-wallet/wc-client";
import { EmbedChainInfos } from "./config";
import { simpleFetch } from "@keplr-wallet/simple-fetch";

let keplr: Keplr | undefined = undefined;
let promise: Promise<Keplr> | undefined = undefined;

type sendResponse = {
  tx_response: {
    txhash?: string;
    code?: number;
    raw_log?: string;
  };
};

async function sendTx(
  chainId: string,
  tx: Uint8Array,
  mode: BroadcastMode
): Promise<Uint8Array> {
  const params = {
    tx_bytes: Buffer.from(tx as any).toString("base64"),
    mode: (() => {
      switch (mode) {
        case "async":
          return "BROADCAST_MODE_ASYNC";
        case "block":
          return "BROADCAST_MODE_BLOCK";
        case "sync":
          return "BROADCAST_MODE_SYNC";
        default:
          return "BROADCAST_MODE_UNSPECIFIED";
      }
    })(),
  };
  const baseUrl = EmbedChainInfos.find(
    (chainInfo) => chainInfo.chainId === chainId
  )?.rest;

  const response = await simpleFetch<sendResponse>(
    `${baseUrl}/cosmos/tx/v1beta1/txs`,
    {
      method: "POST",
      body: JSON.stringify(params),
    }
  );

  if (
    response.data.tx_response.code != null &&
    response.data.tx_response.code !== 0
  ) {
    throw new Error(response.data.tx_response["raw_log"]);
  }

  if (response.data.tx_response.txhash == null) {
    throw new Error("Invalid response");
  }

  return Buffer.from(response.data.tx_response.txhash, "hex");
}

export function getWCKeplr(): Promise<Keplr> {
  if (keplr) {
    return Promise.resolve(keplr);
  }

  const fn = async () => {
    const signClient = await SignClient.init({
      // If do you have your own project id, you can set it.
      projectId: "8d611785b5b4298436793509ca6198df",
      metadata: {
        name: "WC Test Dapp",
        description: "WC Test Dapp",
        url: "http://localhost:1234/",
        icons: [
          "https://raw.githubusercontent.com/chainapsis/keplr-wallet/master/packages/extension/src/public/assets/logo-256.png",
        ],
      },
    });

    if (signClient.session.getAll().length <= 0) {
      const modal = new KeplrQRCodeModalV2(signClient);

      // You can pass the chain ids that you want to connect to the modal.
      const sessionProperties = await modal.connect(["cosmoshub-4"]);

      keplr = new KeplrWalletConnectV2(signClient, {
        sendTx,
        sessionProperties,
      });
    } else {
      keplr = new KeplrWalletConnectV2(signClient, {
        sendTx,
      });
    }

    return Promise.resolve(keplr);
  };

  if (!promise) {
    promise = fn();
  }

  return promise;
}
