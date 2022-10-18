import { randomBytes } from "crypto";
import * as Keychain from "react-native-keychain";
import secp256k1 from "secp256k1";

import { prepareWalletAndSign } from "../secp256k1";

const BIOMETRICS_KEY = "obi-wallet-biometrics";

const DEMO_PUBLIC_KEY = "A4TlI8UUTtpSI+oZ9q0dnXJoK9GiE/iMoy5cdMO2HNTI";
const DEMO_PRIVATE_KEY = "jrfHogEDo91xaC0Kym/BMheAhlm5z93fVwMT8mKTGy4=";

export async function resetBiometricsKeyPair() {
  await Keychain.resetGenericPassword({ service: BIOMETRICS_KEY });
}

export async function getBiometricsPublicKey({
  demoMode,
}: {
  demoMode: boolean;
}) {
  const { publicKey } = await getBiometricsKeyPair({ demoMode });
  return publicKey;
}

export async function getBiometricsPrivateKey({
  demoMode,
}: {
  demoMode: boolean;
}) {
  const { privateKey } = await getBiometricsKeyPair({ demoMode });
  return privateKey;
}

export async function getBiometricsKeyPair({
  demoMode,
}: {
  demoMode: boolean;
}) {
  if (demoMode) {
    return {
      privateKey: DEMO_PRIVATE_KEY,
      publicKey: DEMO_PUBLIC_KEY,
    };
  }

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
    // Fake-AuthPrompt (set+get) to trigger Prompt at initial App-Start
    await Keychain.resetGenericPassword({ service: "fake-prompt" });
    await Keychain.setGenericPassword("fake1", "fake2", {
      service: "fake-prompt",
      accessControl:
        Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET_OR_DEVICE_PASSCODE,
    });
    await Keychain.getGenericPassword({
      authenticationPrompt: {
        title: "Authentication Required",
      },
      service: "fake-prompt",
      accessControl:
        Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET_OR_DEVICE_PASSCODE,
    });

    const privateKeyBuffer = randomBytes(32);
    const publicKeyBuffer = secp256k1.publicKeyCreate(privateKeyBuffer);

    const privateKey = Buffer.from(privateKeyBuffer).toString("base64");
    const publicKey = Buffer.from(publicKeyBuffer).toString("base64");

    await Keychain.setGenericPassword(publicKey, privateKey, {
      service: BIOMETRICS_KEY,
      accessControl:
        Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET_OR_DEVICE_PASSCODE,
    });
    return {
      publicKey,
      privateKey,
    };
  }
}

export async function createBiometricSignature({
  payload,
  demoMode,
}: {
  payload: Uint8Array;
  demoMode: boolean;
}) {
  const { publicKey, privateKey } = await getBiometricsKeyPair({ demoMode });
  return await prepareWalletAndSign({
    publicKey,
    privateKey,
    payload,
  });
}
