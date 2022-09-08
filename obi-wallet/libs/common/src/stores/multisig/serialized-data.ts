import { pubkeyType } from "@cosmjs/amino";
import * as t from "io-ts";

function nullable<A>(type: t.Type<A>) {
  return t.union([type, t.null]);
}

export const SinglePublicKey = t.type({
  type: t.string,
  value: t.string,
});
export type SinglePublicKey = t.TypeOf<typeof SinglePublicKey>;

export const Secp256k1PublicKey = t.type({
  type: t.literal(pubkeyType.secp256k1),
  value: t.string,
});
export type Secp256k1PublicKey = t.TypeOf<typeof Secp256k1PublicKey>;

export const SerializedBiometricsPayloadV0 = t.type({
  publicKey: t.string,
});
export const SerializedBiometricsPayload = t.type({
  publicKey: Secp256k1PublicKey,
});
export type SerializedBiometricsPayload = t.TypeOf<
  typeof SerializedBiometricsPayload
>;

export const SerializedBiometricsPayloadAnyVersion = t.union([
  SerializedBiometricsPayloadV0,
  SerializedBiometricsPayload,
]);
export type SerializedBiometricsPayloadAnyVersion = t.TypeOf<
  typeof SerializedBiometricsPayloadAnyVersion
>;

export function migrateSerializedBiometricsPayload(
  serializedBiometricsPayload: SerializedBiometricsPayloadAnyVersion | null
): SerializedBiometricsPayload | null {
  if (SerializedBiometricsPayloadV0.is(serializedBiometricsPayload)) {
    return {
      publicKey: {
        type: pubkeyType.secp256k1,
        value: serializedBiometricsPayload.publicKey,
      },
    };
  }

  return serializedBiometricsPayload;
}

export const SerializedPhoneNumberPayloadV0 = t.type({
  publicKey: t.string,
  phoneNumber: t.string,
  securityQuestion: t.string,
});
export const SerializedPhoneNumberPayload = t.type({
  publicKey: Secp256k1PublicKey,
  phoneNumber: t.string,
  securityQuestion: t.string,
});
export type SerializedPhoneNumberPayload = t.TypeOf<
  typeof SerializedPhoneNumberPayload
>;

export const SerializedPhoneNumberPayloadAnyVersion = t.union([
  SerializedPhoneNumberPayloadV0,
  SerializedPhoneNumberPayload,
]);

export type SerializedPhoneNumberPayloadAnyVersion = t.TypeOf<
  typeof SerializedPhoneNumberPayloadAnyVersion
>;

export function migrateSerializedPhoneNumberPayload(
  serializedPhoneNumberPayload: SerializedPhoneNumberPayloadAnyVersion | null
): SerializedPhoneNumberPayload | null {
  if (SerializedPhoneNumberPayloadV0.is(serializedPhoneNumberPayload)) {
    return {
      ...serializedPhoneNumberPayload,
      publicKey: {
        type: pubkeyType.secp256k1,
        value: serializedPhoneNumberPayload.publicKey,
      },
    };
  }

  return serializedPhoneNumberPayload;
}

export const SerializedSocialPayload = t.type({
  publicKey: SinglePublicKey,
});
export type SerializedSocialPayload = t.TypeOf<typeof SerializedSocialPayload>;

export const SerializedCloudPayload = t.type({});

export type SerializedCloudPayload = t.TypeOf<typeof SerializedCloudPayload>;

export const SerializedMultisigPayloadV0 = t.type({
  biometrics: nullable(SerializedBiometricsPayloadV0),
  phoneNumber: nullable(SerializedPhoneNumberPayloadV0),
  cloud: nullable(SerializedCloudPayload),
});
export const SerializedMultisigPayloadV1 = t.type({
  biometrics: nullable(SerializedBiometricsPayload),
  phoneNumber: nullable(SerializedPhoneNumberPayload),
  cloud: nullable(SerializedCloudPayload),
});
export const SerializedMultisigPayload = t.type({
  biometrics: nullable(SerializedBiometricsPayload),
  phoneNumber: nullable(SerializedPhoneNumberPayload),
  cloud: nullable(SerializedCloudPayload),
  social: nullable(SerializedSocialPayload),
});
export type SerializedMultisigPayload = t.TypeOf<
  typeof SerializedMultisigPayload
>;

export const SerializedMultisigPayloadAnyVersion = t.union([
  SerializedMultisigPayloadV0,
  SerializedMultisigPayloadV1,
  SerializedMultisigPayload,
]);

export type SerializedMultisigPayloadAnyVersion = t.TypeOf<
  typeof SerializedMultisigPayloadAnyVersion
>;

export const migrateSerializedMultisigPayload = (
  serializedMultisigPayload: SerializedMultisigPayloadAnyVersion
): SerializedMultisigPayload => {
  if (
    SerializedMultisigPayloadV0.is(serializedMultisigPayload) ||
    SerializedMultisigPayloadV1.is(serializedMultisigPayload)
  ) {
    return {
      biometrics: migrateSerializedBiometricsPayload(
        serializedMultisigPayload.biometrics
      ),
      phoneNumber: migrateSerializedPhoneNumberPayload(
        serializedMultisigPayload.phoneNumber
      ),
      cloud: serializedMultisigPayload.cloud,
      social: null,
    };
  }

  return serializedMultisigPayload;
};

export const SerializedProxyAddressV0 = t.string;
export const SerializedProxyAddress = t.type({
  address: t.string,
  codeId: t.number,
});
export type SerializedProxyAddress = t.TypeOf<typeof SerializedProxyAddress>;

export const SerializedProxyAddressAnyVersion = t.union([
  SerializedProxyAddressV0,
  SerializedProxyAddress,
]);

export type SerializedProxyAddressAnyVersion = t.TypeOf<
  typeof SerializedProxyAddressAnyVersion
>;

export function migrateSerializedProxyAddress(
  serializedProxyAddress: SerializedProxyAddressAnyVersion | null
): SerializedProxyAddress | null {
  if (SerializedProxyAddressV0.is(serializedProxyAddress)) {
    return {
      address: serializedProxyAddress,
      codeId: 2603,
    };
  }

  return serializedProxyAddress;
}

export const SerializedProxyAddressPerChain = t.partial({
  "uni-3": nullable(SerializedProxyAddress),
  "juno-1": nullable(SerializedProxyAddress),
});
export type SerializedProxyAddressPerChain = t.TypeOf<
  typeof SerializedProxyAddressPerChain
>;

export const SerializedDataV0 = t.type({
  nextAdmin: SerializedMultisigPayloadAnyVersion,
  currentAdmin: nullable(SerializedMultisigPayloadAnyVersion),
  proxyAddress: nullable(SerializedProxyAddressAnyVersion),
});
export const SerializedData = t.type({
  nextAdmin: SerializedMultisigPayload,
  currentAdmin: nullable(SerializedMultisigPayload),
  proxyAddresses: SerializedProxyAddressPerChain,
});
export type SerializedData = t.TypeOf<typeof SerializedData>;

export const SerializedDataAnyVersion = t.union([
  SerializedDataV0,
  SerializedData,
]);
export type SerializedDataAnyVersion = t.TypeOf<
  typeof SerializedDataAnyVersion
>;

export function migrateSerializedData(
  serializedData: SerializedDataAnyVersion
): SerializedData {
  if (SerializedDataV0.is(serializedData)) {
    return {
      nextAdmin: migrateSerializedMultisigPayload(serializedData.nextAdmin),
      currentAdmin: serializedData.currentAdmin
        ? migrateSerializedMultisigPayload(serializedData.currentAdmin)
        : null,
      proxyAddresses: {
        "uni-3": migrateSerializedProxyAddress(serializedData.proxyAddress),
      },
    };
  }

  return serializedData;
}
