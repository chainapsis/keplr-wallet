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
import { serializeSignDoc } from "@cosmjs/launchpad";

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
    new GetMessagingPublicKey(chainId, "", null)
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
