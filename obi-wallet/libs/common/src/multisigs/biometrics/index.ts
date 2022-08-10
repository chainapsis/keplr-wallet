import ReactNativeDeviceCrypto, {
  AccessLevel,
  BiometryParams,
} from "react-native-device-crypto";

const BIOMETRICS_KEY = "obi-wallet-biometrics";

export async function isBiometricsAvailable() {
  return ReactNativeDeviceCrypto.isBiometryEnrolled();
}

export async function getBiometricsPublicKey() {
  const publicKey = await ReactNativeDeviceCrypto.getOrCreateAsymmetricKey(
    BIOMETRICS_KEY,
    {
      accessLevel: AccessLevel.AUTHENTICATION_REQUIRED,
      invalidateOnNewBiometry: false,
    }
  );
  return compressSec256k1PublicKey(publicKey);
}

export async function createBiometricSignature({
  payload,
  biometryParams,
}: {
  payload: string;
  biometryParams: BiometryParams;
}) {
  // Ensure that the key pair is available
  await getBiometricsPublicKey();
  return ReactNativeDeviceCrypto.sign(BIOMETRICS_KEY, payload, biometryParams);
}

export function compressSec256k1PublicKey(publicKey: string): string {
  // This function assumes that public key is a valid sec256k1 public key

  // Firstly, we get the base64 representation of the public key
  // For this, we need to remove the "-----BEGIN PUBLIC KEY-----" and "-----END PUBLIC KEY-----" header resp. footer
  // After that, we remove type information of the ASN1.encoding
  // (public key starts after a leading zero byte 0x00)
  // See https://stackoverflow.com/questions/18039401/how-can-i-transform-between-the-two-styles-of-public-key-format-one-begin-rsa
  const uncompressed = publicKey
    .replace("-----BEGIN PUBLIC KEY-----", "")
    .replace("-----END PUBLIC KEY-----", "")
    .replace(/\r\n|\r|\n/gm, "");
  const buffer = Buffer.from(uncompressed, "base64");
  const startIndex = buffer.indexOf("00", 0, "hex");

  // Basically we go from the uncompressed form
  //    04 [32 byte x value] [32 byte y value]
  // to the compressed form
  //    [03 if y is odd else 02] [32 byte x value]
  // See https://matthewdowney.github.io/compress-bitcoin-public-key.html
  const uncompressedBuffer = buffer.slice(startIndex + 2);
  const x = uncompressedBuffer.slice(0, 32);
  const y = uncompressedBuffer.slice(32);
  const parity =
    parseInt(y.toString("hex"), 16) & 1
      ? Buffer.from("03", "hex")
      : Buffer.from("04", "hex");
  return Buffer.concat([parity, x]).toString("base64");
}
