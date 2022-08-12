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

interface BiometryParams {
  biometryTitle: string;
  biometrySubTitle: string;
  biometryDescription: string;
}

export async function createBiometricSignature({
  payload,
  biometryParams,
}: {
  payload: string;
  biometryParams: BiometryParams;
}) {
  console.error("Not implemented yet");
}
