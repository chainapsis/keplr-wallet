import { fromBase64, fromUtf8 } from "@cosmjs/encoding";
import { InExtensionMessageRequester } from "@keplr-wallet/router-extension";
import { DecryptMessagingMessage } from "@keplr-wallet/background/build/messaging";
import { BACKGROUND_PORT } from "@keplr-wallet/router";

export const decryptMessage = async (
  chainId: string,
  content: string,
  isSender: boolean
): Promise<string> => {
  const data = Buffer.from(content, "base64").toString("ascii");
  const dataEnvelopeDecoded = JSON.parse(data);
  const decodedData = Buffer.from(dataEnvelopeDecoded.data, "base64").toString(
    "ascii"
  );
  const parsedData = JSON.parse(decodedData);

  const decryptedData = await decryptMessageContent(
    chainId,
    isSender ? parsedData.encryptedSenderData : parsedData.encryptedTargetData
  );

  const parsedDataString = JSON.parse(decryptedData);
  return parsedDataString.content.text;
};

/**
 * Attempt to decrypt the payload of a message envelope for the currently
 * selected wallet address
 *
 * @param chainId The selected chain id
 * @param content The base64 encoded cipherText to be decrypted
 */
export async function decryptMessageContent(
  chainId: string,
  content: string
): Promise<string> {
  // TODO: ideally this is cached
  const requester = new InExtensionMessageRequester();

  // build the decryption request message
  const msg = new DecryptMessagingMessage(chainId, content);
  const decoded = await requester.sendMessage(BACKGROUND_PORT, msg);

  return fromUtf8(fromBase64(decoded));
}
