import axios from "axios";

import { Window as KeplrWindow } from "@keplr-wallet/types";
import { BACKGROUND_PORT } from "@keplr-wallet/router";
import {
  SignMessagingPayload,
  GetMessagingPublicKey,
} from "@keplr-wallet/background/build/messaging";
import { InExtensionMessageRequester } from "@keplr-wallet/router-extension";
import { rawSecp256k1PubkeyToRawAddress } from "@cosmjs/amino";
import { toBase64, Bech32, fromHex } from "@cosmjs/encoding";
import { serializeSignDoc } from "@keplr-wallet/cosmos";
import { AGENT_FEEDBACK_URL, GRAPHQL_URL } from "../config.ui.var";

declare let window: Window;

class RequestError extends Error {
  constructor(message: string) {
    super(`Request failed: ${message}`);
    this.name = "RequestError";
  }
}

class RejectError extends Error {
  constructor(message: string) {
    super(`Request rejected: ${message}`);
    this.name = "RejectError";
  }
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Window extends KeplrWindow {}
}

const signArbitrary = async (
  chainId: string,
  addr: string,
  pubKey: string,
  data: string,
  requester: any // TODO(!!!): Update types
) => {
  const encoder = new TextEncoder();
  const encoded = encoder.encode(data);

  const signDoc = {
    chain_id: "",
    account_number: "0",
    sequence: "0",
    fee: {
      gas: "0",
      amount: [],
    },
    msgs: [
      {
        type: "sign/MsgSignData",
        value: {
          signer: addr,
          data: toBase64(encoded),
        },
      },
    ],
    memo: "",
  };

  const signature = await requester.sendMessage(
    BACKGROUND_PORT,
    new SignMessagingPayload(chainId, toBase64(serializeSignDoc(signDoc)))
  );

  return {
    signature,
    public_key: pubKey,
    signed_bytes: toBase64(serializeSignDoc(signDoc)),
  };
};

export const getJWT = async (chainId: string, url: string) => {
  if (window === undefined) {
    return "";
  }
  const config = {
    headers: { "Access-Control-Allow-Origin": "*" },
  };

  const requester = new InExtensionMessageRequester();

  const pubKey = await requester.sendMessage(
    BACKGROUND_PORT,
    new GetMessagingPublicKey(GRAPHQL_URL.MESSAGING_SERVER, chainId, "", null)
  );

  if (!pubKey.publicKey) throw new Error("public key not found");

  const addr = Bech32.encode(
    "fetch",
    rawSecp256k1PubkeyToRawAddress(fromHex(pubKey.publicKey))
  );
  const request = {
    address: addr,
    public_key: pubKey.publicKey,
  };

  const r1 = await axios.post(`${url}/request_token`, request, config);

  if (r1.status !== 200) throw new RequestError(r1.statusText);

  let loginRequest = undefined;

  try {
    loginRequest = await signArbitrary(
      chainId,
      addr,
      pubKey.publicKey,
      r1.data.payload,
      requester
    );
  } catch (err: any) {
    throw new RejectError(err.toString());
  }

  if (loginRequest === undefined) {
    return undefined;
  }

  const r2 = await axios.post(`${url}/login`, loginRequest, config);

  if (r2.status !== 200) {
    throw new RequestError(r1.statusText);
  }

  return r2.data.token;
};
function generateUUID() {
  // Public Domain/MIT
  let d = new Date().getTime(); //Timestamp
  let d2 =
    (typeof performance !== "undefined" &&
      performance.now &&
      performance.now() * 1000) ||
    0; //Time in microseconds since page-load or 0 if unsupported
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    let r = Math.random() * 16; //random number between 0 and 16
    if (d > 0) {
      //Use timestamp until depleted
      r = (d + r) % 16 | 0;
      d = Math.floor(d / 16);
    } else {
      //Use microseconds since page-load if supported
      r = (d2 + r) % 16 | 0;
      d2 = Math.floor(d2 / 16);
    }
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export const updateMessageFeedback = async (
  messageId: string,
  chainId: string,
  rating: number,
  target: string
) => {
  try {
    const expires = parseInt(`${new Date().getTime() / 1000 + 30}`);
    const payload = toBase64(
      Buffer.from(JSON.stringify({ rating, msg_id: messageId }))
    );
    const session = generateUUID();
    const request = {
      version: 1,
      sender: "user16n6nwpyg7glp2swpre6zmvcp9tm2qjnthq25wt72l5yxzrqq0ucq0nte05", // Hardcode this
      protocol:
        "model:f2c077f790a58566a495c3eb993c8265c3dfdb925876603127b0eb3b21a6eb31", // Hardcode this
      target, // Fetchbot address
      session, // Any random generated UUID
      payload, // Base64 encoded string for payload.
      expires, // Current time + 30 seconds
    };
    const r1 = await axios.post(
      `${AGENT_FEEDBACK_URL[chainId]}/submit`,
      request
    );
    console.log(r1);
  } catch (err) {
    console.error("err", err);
  }
};
