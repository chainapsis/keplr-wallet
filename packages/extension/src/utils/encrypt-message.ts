import { toBase64, toUtf8 } from "@cosmjs/encoding";
import { InExtensionMessageRequester } from "@keplr-wallet/router-extension";
import { BACKGROUND_PORT } from "@keplr-wallet/router";
import {
  EncryptMessagingMessage,
  GetMessagingPublicKey,
  SignMessagingPayload,
} from "@keplr-wallet/background/build/messaging";
import { MESSAGE_CHANNEL_ID } from "@keplr-wallet/background/build/messaging/constants";

export interface MessageEnvelope {
  data: string; // base64 encoded
  senderPublicKey: string; // base64 encoded
  targetPublicKey: string; // base64 encoded
  groupLastSeenTimestamp: Date;
  lastSeenTimestamp: Date;
  signature: string; // base64 encoded signature
  channelId: string;
}

export interface MessagePrimitive {
  sender: string;
  target: string;
  groupLastSeenTimestamp: Date;
  lastSeenTimestamp: Date;
  type: 1 | 2;
  content: {
    text: string;
  };
}

export const encryptAllData = async (
  accessToken: string,
  chainId: string,
  messageData: any,
  senderAddress: string,
  targetAddress: string
): Promise<string> => {
  const dataEnvelope = await encryptToEnvelope(
    chainId,
    messageData,
    senderAddress,
    targetAddress,
    accessToken
  );
  return toBase64(Buffer.from(JSON.stringify(dataEnvelope)));
};

/**
 * Encrypts the specified message and generates an envelope that can be submitted
 * to the memorandum service
 *
 * @param chainId The current chainId
 * @param messageStr The plain text message to be encrypted
 * @param senderAddress The senders address
 * @param targetAddress The target address for the message recipient
 * @param accessToken The access token for the memorandum service
 */
export async function encryptToEnvelope(
  chainId: string,
  messageData: any,
  senderAddress: string,
  targetAddress: string,
  accessToken: string
): Promise<MessageEnvelope> {
  // TODO: ideally this is cached
  const requester = new InExtensionMessageRequester();

  // lookup both our (sender) and target public keys
  const senderPublicKey = await requester.sendMessage(
    BACKGROUND_PORT,
    new GetMessagingPublicKey(chainId, accessToken, senderAddress)
  );

  const targetPublicKey = await requester.sendMessage(
    BACKGROUND_PORT,
    new GetMessagingPublicKey(chainId, accessToken, targetAddress)
  );

  if (!senderPublicKey.publicKey || !targetPublicKey.publicKey) {
    throw new Error("Public key not available");
  }

  const isString = typeof messageData === "string";

  const message: MessagePrimitive = {
    sender: senderPublicKey.publicKey, //public key
    target: targetPublicKey.publicKey, // public key
    groupLastSeenTimestamp: new Date(),
    lastSeenTimestamp: new Date(),
    type: isString ? 1 : 2, //private_message
    content: {
      text: isString ? messageData : JSON.stringify(messageData),
    },
  };

  // encrypt the message
  const senderCipher = await requester.sendMessage(
    BACKGROUND_PORT,
    new EncryptMessagingMessage(
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
    groupLastSeenTimestamp: new Date(),
    lastSeenTimestamp: new Date(),
    signature,
    channelId: MESSAGE_CHANNEL_ID,
  };
}
