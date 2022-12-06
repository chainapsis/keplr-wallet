import { _TypedDataEncoder as TypedDataEncoder } from "@ethersproject/hash";

export const domainHash = (message: any) =>
  TypedDataEncoder.hashStruct(
    "EIP712Domain",
    { EIP712Domain: message.types.EIP712Domain },
    message.domain
  );

// Seems that there is no way to set primary type and the first type becomes primary type.
export const messageHash = (message: any) =>
  TypedDataEncoder.from(
    (() => {
      const types = { ...message.types };

      delete types["EIP712Domain"];

      const primary = types[message.primaryType];

      if (!primary) {
        throw new Error(`No matched primary type: ${message.primaryType}`);
      }

      delete types[message.primaryType];

      return {
        [message.primaryType]: primary,
        ...types,
      };
    })()
  ).hash(message.message);
