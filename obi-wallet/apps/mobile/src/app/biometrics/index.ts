import ReactNativeDeviceCrypto, {
  AccessLevel,
  BiometryParams,
} from "react-native-device-crypto";

const BIOMETRICS_KEY = "obi-wallet-biometrics";

export async function isBiometricsAvailable() {
  return ReactNativeDeviceCrypto.isBiometryEnrolled();
}

export async function getPublicKey() {
  return ReactNativeDeviceCrypto.getOrCreateAsymmetricKey(BIOMETRICS_KEY, {
    accessLevel: AccessLevel.AUTHENTICATION_REQUIRED,
    invalidateOnNewBiometry: false,
  });
}

export async function createBiometricSignature({
  payload,
  biometryParams,
}: {
  payload: string;
  biometryParams: BiometryParams;
}) {
  // Ensure that the key pair is available
  await getPublicKey();
  return ReactNativeDeviceCrypto.sign(BIOMETRICS_KEY, payload, biometryParams);
}
