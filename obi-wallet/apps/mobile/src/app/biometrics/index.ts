import ReactNativeBiometrics from "react-native-biometrics";

export const biometrics = new ReactNativeBiometrics({
  allowDeviceCredentials: false,
});

export async function isBiometricsAvailable() {
  const { available } = await biometrics.isSensorAvailable();
  return available;
}

export async function createBiometricSignature(
  ...payload: Parameters<typeof biometrics.createSignature>
) {
  const { keysExist } = await biometrics.biometricKeysExist();
  // Create keys only if we don't have them already
  if (!keysExist) await biometrics.createKeys();
  return await biometrics.createSignature(...payload);
}
