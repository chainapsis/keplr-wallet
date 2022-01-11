import { Keplr } from "@keplr-wallet/types";
import WalletConnect from "@walletconnect/client";
import { KeplrQRCodeModalV1 } from "@keplr-wallet/wc-qrcode-modal";
import { KeplrWalletConnectV1 } from "@keplr-wallet/wc-client";
import { BroadcastMode, StdTx } from "@cosmjs/launchpad";
import Axios from "axios";
import { EmbedChainInfos } from "./config";
import { Buffer } from "buffer/";

let keplr: Keplr | undefined = undefined;
let promise: Promise<Keplr> | undefined = undefined;

async function sendTx(
  chainId: string,
  stdTx: StdTx,
  mode: BroadcastMode
): Promise<Uint8Array> {
  const params = {
    tx: stdTx,
    mode,
  };

  const restInstance = Axios.create({
    baseURL: EmbedChainInfos.find((chainInfo) => chainInfo.chainId === chainId)!
      .rest,
  });

  const result = await restInstance.post("/txs", params);

  return Buffer.from(result.data.txhash, "hex");
}

export function getWCKeplr(): Promise<Keplr> {
  if (keplr) {
    return Promise.resolve(keplr);
  }

  const fn = () => {
    const connector = new WalletConnect({
      bridge: "https://bridge.walletconnect.org", // Required
      signingMethods: [
        "keplr_enable_wallet_connect_v1",
        "keplr_sign_amino_wallet_connect_v1",
      ],
      qrcodeModal: new KeplrQRCodeModalV1(),
    });

    // Check if connection is already established
    if (!connector.connected) {
      // create new session
      connector.createSession();

      return new Promise<Keplr>((resolve, reject) => {
        connector.on("connect", (error) => {
          if (error) {
            reject(error);
          } else {
            keplr = new KeplrWalletConnectV1(connector, {
              sendTx,
            });
            resolve(keplr);
          }
        });
      });
    } else {
      keplr = new KeplrWalletConnectV1(connector, {
        sendTx,
      });
      return Promise.resolve(keplr);
    }
  };

  if (!promise) {
    promise = fn();
  }

  return promise;
}
