import { MultisigThresholdPubkey } from "@cosmjs/amino";

import {
  SerializedBiometricsPayload,
  SerializedCloudPayload,
  SerializedPhoneNumberPayload,
  SerializedSocialPayload,
} from "./serialized-data";

export type MultisigThresholdPublicKey = MultisigThresholdPubkey;

export type WithAddress<T> = T & { address: string };

export interface Multisig {
  multisig: WithAddress<{
    publicKey: MultisigThresholdPublicKey;
  }> | null;
  biometrics: WithAddress<SerializedBiometricsPayload> | null;
  phoneNumber: WithAddress<SerializedPhoneNumberPayload> | null;
  social: WithAddress<SerializedSocialPayload> | null;
  cloud: WithAddress<SerializedCloudPayload> | null;
  email: null;
}

export type MultisigKey = keyof Omit<Multisig, "multisig">;

export enum MultisigState {
  LOADING = "Loading",
  EMPTY = "Empty",
  READY = "Ready",
  OUTDATED = "Outdated",
  INITIALIZED = "Initialized",
}

export * from "./serialized-data";

export interface ProxyWallet {
  contract: string;
  signers: string[];
}
