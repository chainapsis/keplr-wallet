import { AES } from "crypto-js";
import { totp } from "otplib";
import { Alert } from "react-native";
import {
  PHONE_NUMBER_KEY_SECRET,
  PHONE_NUMBER_TWILIO_BASIC_AUTH_PASSWORD,
  PHONE_NUMBER_TWILIO_BASIC_AUTH_USER,
} from "react-native-dotenv";

import { rootStore } from "../../background/root-store";
import { envInvariant } from "../../helpers/invariant";
import { prepareWalletAndSign } from "../secp256k1";

envInvariant("PHONE_NUMBER_KEY_SECRET", PHONE_NUMBER_KEY_SECRET);
envInvariant(
  "PHONE_NUMBER_TWILIO_BASIC_AUTH_USER",
  PHONE_NUMBER_TWILIO_BASIC_AUTH_USER
);
envInvariant(
  "PHONE_NUMBER_TWILIO_BASIC_AUTH_PASSWORD",
  PHONE_NUMBER_TWILIO_BASIC_AUTH_PASSWORD
);

const DEV_SHARED_SECRET = PHONE_NUMBER_KEY_SECRET;
const TWILIO_BASIC_AUTH = `Basic ${Buffer.from(
  `${PHONE_NUMBER_TWILIO_BASIC_AUTH_USER}:${PHONE_NUMBER_TWILIO_BASIC_AUTH_PASSWORD}`
).toString("base64")}`;

const DEMO_PUBLIC_KEY = "A6J4MMAkdwzopAESgMqCAqy33l873BIbWy/nzdyoXkoe";
const DEMO_PRIVATE_KEY = "eZWdYnw59qFVTHLPIVyUN1xgNXKMuURUCp2wsWF29Aw=";
let DEMO_PAYLOAD: Uint8Array = new Uint8Array();

export async function sendPublicKeyTextMessage({
  phoneNumber,
  securityAnswer,
  demoMode,
}: {
  phoneNumber: string;
  securityAnswer: string;
  demoMode: boolean;
}) {
  if (demoMode) return;

  try {
    await encryptAndSendMessage({
      message: `pub:${securityAnswer}`,
      phoneNumber,
    });
  } catch (e) {
    const error = e as Error;
    console.error(error);
    Alert.alert("Error sendPublicKeyTextMessage", error.message);
  }
}

export async function parsePublicKeyTextMessageResponse({
  key,
  demoMode,
}: {
  key: string;
  demoMode: boolean;
}) {
  if (demoMode) return DEMO_PUBLIC_KEY;

  try {
    const decrypted = await fetchAndDecryptResponse(key);

    if (!decrypted?.startsWith("pubkey:")) {
      console.error("This doesn't seem to be a public key");
      Alert.alert("Wrong SMS-Code?", `The code you've entered is not correct.`);
      return null;
    }

    return decrypted.replace("pubkey:", "");
  } catch (e) {
    const error = e as Error;
    console.error(error);
    Alert.alert("Error parsePublicKeyTextMessageResponse", error.message);
    return null;
  }
}

export async function sendSignatureTextMessage({
  phoneNumber,
  securityAnswer,
  message,
  demoMode,
}: {
  phoneNumber: string;
  securityAnswer: string;
  message: Uint8Array;
  demoMode: boolean;
}) {
  if (demoMode) {
    DEMO_PAYLOAD = message;
    return;
  }

  try {
    await encryptAndSendMessage({
      message: `sign:${securityAnswer},${Buffer.from(message.buffer).toString(
        "base64"
      )}`,
      phoneNumber,
    });
  } catch (e) {
    const error = e as Error;
    console.error(error);
    Alert.alert("Error sendSignatureTextMessage", error.message);
  }
}

export async function parseSignatureTextMessageResponse({
  key,
  demoMode,
}: {
  key: string;
  demoMode: boolean;
}): Promise<Uint8Array | null> {
  if (demoMode) {
    const { signature } = await prepareWalletAndSign({
      publicKey: DEMO_PUBLIC_KEY,
      privateKey: DEMO_PRIVATE_KEY,
      payload: DEMO_PAYLOAD,
    });
    return signature;
  }

  try {
    const decrypted = await fetchAndDecryptResponse(key);

    if (!decrypted?.startsWith("signature::")) {
      console.error("This doesn't seem to be a signature");
      return null;
    }

    const signature = decrypted.replace("signature::", "");
    return new Uint8Array(Buffer.from(signature, "base64"));
  } catch (e) {
    const error = e as Error;
    console.error(error);
    Alert.alert("Error parseSignatureTextMessageResponse", error.message);
    return null;
  }
}

async function encryptAndSendMessage({
  message,
  phoneNumber,
}: {
  message: string;
  phoneNumber: string;
}) {
  const body = await getMessageBody(message);
  const formData = new FormData();
  const { twilioPhoneNumbers, twilioUrl } =
    rootStore.chainStore.currentChainInformation;
  const twilioPhoneNumber =
    twilioPhoneNumbers[Math.floor(Math.random() * twilioPhoneNumbers.length)];
  formData.append("To", twilioPhoneNumber);
  formData.append("From", phoneNumber);
  formData.append("Parameters", JSON.stringify({ trigger_body: body }));

  try {
    await fetch(twilioUrl, {
      body: formData,
      method: "post",
      headers: {
        Authorization: TWILIO_BASIC_AUTH,
      },
    });
  } catch (e) {
    const error = e as Error;
    console.error(error);
    Alert.alert("Error fetchTwilio", error.message);
  }
}

async function fetchAndDecryptResponse(key: string) {
  try {
    const result = await fetch(`https://obi-hastebin.herokuapp.com/raw/${key}`);
    return await result.text();
  } catch (e) {
    const error = e as Error;
    console.error(error);
    Alert.alert("Error fetchAndDecryptResponse", error.message);
    return null;
  }

  // Decryption hasn't been implemented on Twilio yet
  // const token = totp.generate(DEV_SHARED_SECRET);
  // try {
  //   totp.verify({ token, secret: DEV_SHARED_SECRET });
  // } catch (err) {
  //   // Possible errors
  //   // - options validation
  //   // - "Invalid input - it is not base32 encoded string"
  //   console.error(err);
  // }
  // const decrypted = AES.decrypt(message, token).toString(enc.Utf8);
}

export async function getMessageBody(message: string) {
  // absurdly large step for dev convenience
  totp.options = { digits: 64, step: 600 };
  const token = totp.generate(DEV_SHARED_SECRET);
  try {
    totp.verify({ token, secret: DEV_SHARED_SECRET });
  } catch (e) {
    // Possible errors
    // - options validation
    // - "Invalid input - it is not base32 encoded string"
    const error = e as Error;
    console.error(error);
    Alert.alert("Error getMessageBody (1)", error.message);
  }
  const encrypted = AES.encrypt(message, token).toString();

  try {
    const result = await fetch("https://obi-hastebin.herokuapp.com/documents", {
      headers: {
        "Content-type": "application/text",
      },
      method: "POST",
      body: encrypted,
    });
    const { key } = JSON.parse(await result.text());
    return key;
  } catch (e) {
    const error = e as Error;
    console.error(error);
    Alert.alert("Error getMessageBody (2)", error.message);
  }
}
