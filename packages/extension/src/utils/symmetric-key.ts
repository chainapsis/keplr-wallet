import { toBase64, toUtf8 } from "@cosmjs/encoding";
import { EncryptMessagingMessage } from "@keplr-wallet/background/build/messaging";
import { BACKGROUND_PORT } from "@keplr-wallet/router";
import { InExtensionMessageRequester } from "@keplr-wallet/router-extension";
import crypto from "crypto";
import { GroupMembers } from "@chatTypes";
import { decryptMessageContent } from "./decrypt-message";
import { GRAPHQL_URL } from "../config.ui.var";

function generateSymmetricKey() {
  const secret = "fetchwallet";
  const key = crypto
    .createHash("sha256")
    .update(String(secret))
    .digest("base64");
  return key;
}

export async function decryptEncryptedSymmetricKey(
  chainId: string,
  encryptedSymmetricKey: string
) {
  const symmetricKey = await decryptMessageContent(
    chainId,
    encryptedSymmetricKey
  );
  return symmetricKey.substring(1, symmetricKey.length - 1);
}

export async function encryptSymmetricKey(
  chainId: string,
  accessToken: string,
  symmetricKey: string,
  address: string
) {
  const requester = new InExtensionMessageRequester();
  const encryptMsg = new EncryptMessagingMessage(
    GRAPHQL_URL.MESSAGING_SERVER,
    chainId,
    address,
    toBase64(toUtf8(JSON.stringify(symmetricKey))),
    accessToken
  );
  const encryptSymmetricKey = await requester.sendMessage(
    BACKGROUND_PORT,
    encryptMsg
  );
  return encryptSymmetricKey;
}

export const createEncryptedSymmetricKeyForAddresses = async (
  addresses: GroupMembers[],
  chainId: string,
  accessToken: string
) => {
  const newAddresses = [];
  const newSymmetricKey = generateSymmetricKey();
  for (let i = 0; i < addresses.length; i++) {
    const groupAddress = addresses[i];
    const encryptedSymmetricKey = await encryptSymmetricKey(
      chainId,
      accessToken,
      newSymmetricKey,
      groupAddress.address
    );
    newAddresses[i] = { ...groupAddress, encryptedSymmetricKey };
  }
  return newAddresses;
};

export function encryptGroupData(key: string, data: string) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(key, "base64"),
    iv
  );
  let encrypted = cipher.update(data, "utf8", "base64");
  encrypted += cipher.final("base64");
  return `${iv.toString("base64")}:${encrypted}`;
}

export function decryptGroupData(key: string, data: string) {
  const [iv, encrypted] = data.split(":");
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(key, "base64"),
    Buffer.from(iv, "base64")
  );
  let decrypted = decipher.update(encrypted, "base64", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
