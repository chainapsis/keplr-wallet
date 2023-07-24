import { toBase64, toUtf8 } from "@cosmjs/encoding";
import {
  EncryptMessagingMessage,
  GetMessagingPublicKey,
  SignMessagingPayload,
} from "@keplr-wallet/background/build/messaging";
import { MESSAGE_CHANNEL_ID } from "@keplr-wallet/background/build/messaging/constants";
import { BACKGROUND_PORT } from "@keplr-wallet/router";
import { InExtensionMessageRequester } from "@keplr-wallet/router-extension";
import {
  decryptEncryptedSymmetricKey,
  encryptGroupData,
} from "./symmetric-key";
import { GRAPHQL_URL } from "../config.ui.var";

export interface GroupTimestampUpdateEnvelope {
  data: string; // base64 encoded
  senderPublicKey: string; // base64 encoded
  targetPublicKey: string; // base64 encoded
  signature: string; // base64 encoded signature
  channelId: string;
}
export interface GroupTimestampUpdatePrimitive {
  sender: string;
  target: string;
  content: Date;
}

export enum GroupMessageType {
  message,
  event,
}

export interface GroupMessageEnvelope {
  data: string; // base64 encoded
  senderPublicKey: string; // base64 encoded
  targetGroupId: string; // base64 encoded
  signature: string; // base64 encoded signature
  channelId: string;
}

export const encryptGroupTimestamp = async (
  accessToken: string,
  chainId: string,
  timestamp: Date,
  senderAddress: string,
  targetAddress: string
): Promise<string> => {
  const dataEnvelope = await encryptGroupTimestampToEnvelope(
    chainId,
    timestamp,
    senderAddress,
    targetAddress,
    accessToken
  );
  return toBase64(Buffer.from(JSON.stringify(dataEnvelope)));
};

/**
 * Encrypts the specified group timestamp and generates an envelope that can be submitted
 * to the memorandum service
 *
 * @param chainId The current chainId
 * @param messageStr The plain text message to be encrypted
 * @param senderAddress The senders address
 * @param targetAddress The target address for the message recipient
 * @param accessToken The access token for the memorandum service
 */
export async function encryptGroupTimestampToEnvelope(
  chainId: string,
  timestamp: Date,
  senderAddress: string,
  targetAddress: string,
  accessToken: string
): Promise<GroupTimestampUpdateEnvelope> {
  // TODO: ideally this is cached
  const requester = new InExtensionMessageRequester();

  // lookup both our (sender) and target public keys
  const senderPublicKey = await requester.sendMessage(
    BACKGROUND_PORT,
    new GetMessagingPublicKey(
      GRAPHQL_URL.MESSAGING_SERVER,
      chainId,
      accessToken,
      senderAddress
    )
  );

  const targetPublicKey = await requester.sendMessage(
    BACKGROUND_PORT,
    new GetMessagingPublicKey(
      GRAPHQL_URL.MESSAGING_SERVER,
      chainId,
      accessToken,
      targetAddress
    )
  );

  if (!senderPublicKey.publicKey || !targetPublicKey.publicKey) {
    throw new Error("Public key not available");
  }

  const message: GroupTimestampUpdatePrimitive = {
    sender: senderPublicKey.publicKey, //public key
    target: targetPublicKey.publicKey, // public key
    content: timestamp,
  };

  // encrypt the message
  const senderCipher = await requester.sendMessage(
    BACKGROUND_PORT,
    new EncryptMessagingMessage(
      GRAPHQL_URL.MESSAGING_SERVER,
      chainId,
      senderAddress,
      toBase64(toUtf8(JSON.stringify(message))),
      accessToken
    )
  );

  // encrypt the message
  const targetCipher = await requester.sendMessage(
    BACKGROUND_PORT,
    new EncryptMessagingMessage(
      GRAPHQL_URL.MESSAGING_SERVER,
      chainId,
      targetAddress,
      toBase64(toUtf8(JSON.stringify(message))),
      accessToken
    )
  );

  const dataPayload = {
    encryptedSenderData: senderCipher,
    encryptedTargetData: targetCipher,
  };

  const encodedData = toBase64(Buffer.from(JSON.stringify(dataPayload)));

  // get the signature for the payload
  const signature = await requester.sendMessage(
    BACKGROUND_PORT,
    new SignMessagingPayload(chainId, encodedData)
  );
  return {
    data: encodedData,
    senderPublicKey: senderPublicKey.publicKey,
    targetPublicKey: targetPublicKey.publicKey,
    signature,
    channelId: MESSAGE_CHANNEL_ID,
  };
}

export const encryptGroupMessage = async (
  chainId: string,
  messageStr: string,
  messageType: GroupMessageType,
  encryptedSymmetricKey: string,
  senderAddress: string,
  targetGroupId: string,
  accessToken: string
): Promise<string> => {
  const dataEnvelope = await encryptGroupMessageToEnvelope(
    chainId,
    messageStr,
    messageType,
    encryptedSymmetricKey,
    senderAddress,
    targetGroupId,
    accessToken
  );
  return toBase64(Buffer.from(JSON.stringify(dataEnvelope)));
};

export async function encryptGroupMessageToEnvelope(
  chainId: string,
  messageStr: string,
  messageType: GroupMessageType,
  encryptedSymmetricKey: string,
  senderAddress: string,
  targetGroupId: string,
  accessToken: string
): Promise<GroupMessageEnvelope> {
  // TODO: ideally this is cached
  const requester = new InExtensionMessageRequester();

  // lookup both our (sender) and target public keys
  const senderPublicKey = await requester.sendMessage(
    BACKGROUND_PORT,
    new GetMessagingPublicKey(
      GRAPHQL_URL.MESSAGING_SERVER,
      chainId,
      accessToken,
      senderAddress
    )
  );

  if (!senderPublicKey.publicKey) {
    throw new Error("Sender Public key not available");
  }

  const symmetricKey = await decryptEncryptedSymmetricKey(
    chainId,
    encryptedSymmetricKey
  );
  const message = {
    senderPublicKey,
    targetGroupId,
    content: {
      text: messageStr,
      type: GroupMessageType[messageType],
    },
  };
  const encodedData = toBase64(Buffer.from(JSON.stringify(message)));

  const encryptedContent = encryptGroupData(symmetricKey, encodedData);
  const encodedContent = toBase64(
    Buffer.from(JSON.stringify(encryptedContent))
  );
  // get the signature for the payload
  const signature = await requester.sendMessage(
    BACKGROUND_PORT,
    new SignMessagingPayload(chainId, encodedContent)
  );
  return {
    data: encodedContent,
    senderPublicKey: senderPublicKey.publicKey,
    targetGroupId,
    signature,
    channelId: MESSAGE_CHANNEL_ID,
  };
}
