import { decryptMessageContent } from "./decrypt-message";

/**
 * Attempt to decrypt the payload of a group timestamp envelope for the currently
 * selected wallet address
 *
 * @param chainId The selected chain id
 * @param content The base64 encoded cipherText to be decrypted
 * @param isSender The encrypted payload selection based on value
 */
export const decryptGroupTimestamp = async (
  chainId: string,
  content: string,
  isSender: boolean
): Promise<string> => {
  try {
    const data = Buffer.from(content, "base64").toString("ascii");
    const dataEnvelopeDecoded = JSON.parse(data);
    const decodedData = Buffer.from(
      dataEnvelopeDecoded.data,
      "base64"
    ).toString("ascii");
    const parsedData = JSON.parse(decodedData);

    const decryptedData = await decryptMessageContent(
      chainId,
      isSender ? parsedData.encryptedSenderData : parsedData.encryptedTargetData
    );

    const parsedDataString = JSON.parse(decryptedData);
    return parsedDataString.content;
  } catch (e) {
    return content;
  }
};
