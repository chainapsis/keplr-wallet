import { TypedDataUtils } from "eth-sig-util";

export const domainHash = (message: any) =>
  TypedDataUtils.hashStruct(
    "EIP712Domain",
    message.domain,
    message.types,
    true
  );

export const messageHash = (message: any) =>
  TypedDataUtils.hashStruct(
    message.primaryType,
    message.message,
    message.types,
    true
  );
