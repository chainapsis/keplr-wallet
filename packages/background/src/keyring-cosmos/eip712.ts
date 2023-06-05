import Joi from "joi";
import { _TypedDataEncoder as TypedDataEncoder } from "@ethersproject/hash";

// https://eips.ethereum.org/EIPS/eip-712

// XXX: ledger의 서명을 frontend에서 다루게 되면서 밑의 함수들은 사실 frontend에서 사용된다.
//      뭔가 이상해진 부분임

export const EIP712PropertyFieldValidator = Joi.object<{
  name: string;
  type: string;
}>({
  name: Joi.string().min(1).required(),
  // TODO: Check valid types (string, bool, address, uint256...)
  type: Joi.string().min(1).required(),
});

export const EIP712DomainTypeValidator = Joi.array()
  .items(
    Joi.object<{
      name: string;
      type: string;
    }>({
      name: Joi.string().valid("name").required(),
      type: Joi.string().valid("string").required(),
    }),
    Joi.object<{
      name: string;
      type: string;
    }>({
      name: Joi.string().valid("version").required(),
      type: Joi.string().valid("string").required(),
    }),
    Joi.object<{
      name: string;
      type: string;
    }>({
      name: Joi.string().valid("chainId").required(),
      type: Joi.string().valid("uint256").required(),
    }),
    Joi.object<{
      name: string;
      type: string;
    }>({
      name: Joi.string().valid("verifyingContract").required(),
      // From https://eips.ethereum.org/EIPS/eip-712, (string) may be non-standard?
      // But, ethermint set this type as string.
      type: Joi.string().valid("address", "string").required(),
    }),
    Joi.object<{
      name: string;
      type: string;
    }>({
      name: Joi.string().valid("salt").required(),
      // From https://eips.ethereum.org/EIPS/eip-712, (string) may be non-standard?
      // But, ethermint set this type as string.
      type: Joi.string().valid("bytes32", "string").required(),
    })
  )
  .unique()
  .min(1)
  .custom((value) => {
    // Sort by name
    const domainFieldNames: Array<string> = [
      "name",
      "version",
      "chainId",
      "verifyingContract",
      "salt",
    ];

    return value.sort((a: { name: string }, b: { name: string }) => {
      return (
        domainFieldNames.indexOf(a.name) - domainFieldNames.indexOf(b.name)
      );
    });
  });

export const EIP712MessageValidator = Joi.object<{
  types: Record<string, unknown>;
  primaryType: string;
  domain: Record<string, unknown>;
  message: Record<string, unknown>;
}>({
  types: Joi.object({
    EIP712Domain: EIP712DomainTypeValidator.required(),
  })
    .unknown(true)
    .required(),
  primaryType: Joi.string().min(1).required(),
  domain: Joi.object().required(),
  message: Joi.object().required(),
});

export const domainHash = (message: {
  types: Record<string, { name: string; type: string }[]>;
  domain: Record<string, any>;
}): string =>
  TypedDataEncoder.hashStruct(
    "EIP712Domain",
    { EIP712Domain: message.types["EIP712Domain"] },
    message.domain
  );

// Seems that there is no way to set primary type and the first type becomes primary type.
export const messageHash = (message: {
  types: Record<string, { name: string; type: string }[]>;
  primaryType: string;
  message: Record<string, unknown>;
}): string =>
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
