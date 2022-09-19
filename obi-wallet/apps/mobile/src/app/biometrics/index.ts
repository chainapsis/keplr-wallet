import {
  coins,
  pubkeyToAddress,
  pubkeyType,
  Secp256k1Wallet,
} from "@cosmjs/amino";
import { chains } from "@obi-wallet/common";
import { randomBytes } from "crypto";
import * as Keychain from "react-native-keychain";
import secp256k1 from "secp256k1";

import { rootStore } from "../../background/root-store";
import { createSigningStargateClient, createStargateClient } from "../clients";
import { lendFees } from "../fee-lender-worker";

const BIOMETRICS_KEY = "obi-wallet-biometrics";

export async function isBiometricsAvailable() {
  return false;
}

export async function getBiometricsPublicKey() {
  const credentials = await Keychain.getGenericPassword({
    authenticationPrompt: {
      title: "Authentication Required",
    },
    service: BIOMETRICS_KEY,
    accessControl:
      Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET_OR_DEVICE_PASSCODE,
  });

  if (credentials) {
    return credentials.username;
  } else {
    const privateKeyBuffer = randomBytes(32);
    const publicKeyBuffer = secp256k1.publicKeyCreate(privateKeyBuffer);

    const privateKey = Buffer.from(privateKeyBuffer).toString("base64");
    const publicKey = Buffer.from(publicKeyBuffer).toString("base64");

    await Keychain.setGenericPassword(publicKey, privateKey, {
      service: BIOMETRICS_KEY,
      accessControl:
        Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET_OR_DEVICE_PASSCODE,
    });
    return publicKey;
  }
}

export async function getBiometricsPrivateKey() {
  const credentials = await Keychain.getGenericPassword({
    authenticationPrompt: {
      title: "Authentication Required",
    },
    service: BIOMETRICS_KEY,
    accessControl:
      Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET_OR_DEVICE_PASSCODE,
  });

  if (credentials) {
    return credentials.password;
  } else {
    throw new Error("No biometrics keypair found");
  }
}

export async function getBiometricsKeyPair() {
  const credentials = await Keychain.getGenericPassword({
    authenticationPrompt: {
      title: "Authentication Required",
    },
    service: BIOMETRICS_KEY,
    accessControl:
      Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET_OR_DEVICE_PASSCODE,
  });

  if (credentials) {
    return {
      publicKey: credentials.username,
      privateKey: credentials.password,
    };
  } else {
    throw new Error("No biometrics keypair found");
  }
}

export async function createBiometricSignature({
  payload,
}: {
  payload: Uint8Array;
}) {
  const credentials = await Keychain.getGenericPassword({
    authenticationPrompt: {
      title: "Authentication Required",
    },
    service: BIOMETRICS_KEY,
    accessControl:
      Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET_OR_DEVICE_PASSCODE,
  });

  if (!credentials) throw new Error("No biometrics keypair found");

  const { chainStore } = rootStore;
  const chainId = chainStore.currentChain;
  const { prefix, denom } = chains[chainId];
  const client = await createStargateClient(chainId);

  const address = pubkeyToAddress(
    {
      type: pubkeyType.secp256k1,
      value: credentials.username,
    },
    prefix
  );

  if (!(await client.getAccount(address))) {
    await lendFees({ chainId, address });
  }

  if (!(await client.getAccount(address))?.pubkey) {
    const signer = await Secp256k1Wallet.fromKey(
      new Uint8Array(Buffer.from(credentials.password, "base64")),
      prefix
    );
    const signingClient = await createSigningStargateClient({
      chainId,
      signer,
    });

    const fee = {
      amount: coins(6000, chainStore.currentChainInformation.denom),
      gas: "200000",
    };

    await signingClient.sendTokens(address, address, coins(1, denom), fee, "");
  }

  const privateKey = new Uint8Array(
    Buffer.from(credentials.password, "base64")
  );
  return secp256k1.ecdsaSign(payload, privateKey);
}
