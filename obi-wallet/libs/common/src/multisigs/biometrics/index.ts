import { randomBytes } from "crypto";
import * as Keychain from "react-native-keychain";
import secp256k1 from "secp256k1";

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

  if (credentials) {
    const privateKey = new Uint8Array(
      Buffer.from(credentials.password, "base64")
    );
    return secp256k1.ecdsaSign(payload, privateKey);
  } else {
    throw new Error("No biometrics keypair found");
  }
}
