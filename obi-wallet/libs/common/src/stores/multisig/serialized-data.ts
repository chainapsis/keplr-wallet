import * as t from "io-ts";

function nullable<A>(type: t.Type<A>) {
  return t.union([type, t.null]);
}

export const SerializedBiometricsPayload = t.type({
  publicKey: t.string,
});

export type SerializedBiometricsPayload = t.TypeOf<
  typeof SerializedBiometricsPayload
>;

export const SerializedPhoneNumberPayload = t.type({
  publicKey: t.string,
  phoneNumber: t.string,
  securityQuestion: t.string,
});

export type SerializedPhoneNumberPayload = t.TypeOf<
  typeof SerializedPhoneNumberPayload
>;

export const SerializedCloudPayload = t.type({});

export type SerializedCloudPayload = t.TypeOf<typeof SerializedCloudPayload>;

export const SerializedMultisigPayload = t.type({
  biometrics: nullable(SerializedBiometricsPayload),
  phoneNumber: nullable(SerializedPhoneNumberPayload),
  cloud: nullable(SerializedCloudPayload),
});

export type SerializedMultisigPayload = t.TypeOf<
  typeof SerializedMultisigPayload
>;

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

export const SerializedData = t.type({
  nextAdmin: SerializedMultisigPayload,
  currentAdmin: nullable(SerializedMultisigPayload),
  proxyAddress: nullable(SerializedProxyAddressAnyVersion),
});

export type SerializedData = t.TypeOf<typeof SerializedData>;
