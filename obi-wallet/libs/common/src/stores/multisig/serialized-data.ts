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

export const SerializedData = t.type({
  nextAdmin: SerializedMultisigPayload,
  currentAdmin: nullable(SerializedMultisigPayload),
  proxyAddress: nullable(t.string),
});

export type SerializedData = t.TypeOf<typeof SerializedData>;
