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

export async function sendPublicKeyTextMessage({
  phoneNumber,
  securityAnswer,
}: {
  phoneNumber: string;
  securityAnswer: string;
}) {
  try {
    await encryptAndSendMessage({
      message: `pub:${securityAnswer}`,
      phoneNumber,
    });
  } catch (e) {
    console.error(e);
    Alert.alert("Error sendPublicKeyTextMessage", e.message);
  }
}

export async function parsePublicKeyTextMessageResponse(key: string) {
  try {
    const decrypted = await fetchAndDecryptResponse(key);

    if (!decrypted.startsWith("pubkey:")) {
      console.error("This doesn't seem to be a public key");
      Alert.alert("Wrong SMS-Code?", `The code you've entered is not correct.`);
      return null;
    }

    return decrypted.replace("pubkey:", "");
  } catch (e) {
    console.error(e);
    Alert.alert("Error parsePublicKeyTextMessageResponse", e.message);
  }
}

export async function sendSignatureTextMessage({
  phoneNumber,
  securityAnswer,
  message,
}: {
  phoneNumber: string;
  securityAnswer: string;
  message: Uint8Array;
}) {
  try {
    await encryptAndSendMessage({
      message: `sign:${securityAnswer},${Buffer.from(message.buffer).toString(
        "base64"
      )}`,
      phoneNumber,
    });
  } catch (e) {
    console.error(e);
    Alert.alert("Error sendSignatureTextMessage", e.message);
  }
}

export async function parseSignatureTextMessageResponse(key: string) {
  try {
    const decrypted = await fetchAndDecryptResponse(key);

    if (!decrypted.startsWith("signature::")) {
      console.error("This doesn't seem to be a signature");
      return null;
    }

    const signature = decrypted.replace("signature::", "");
    return new Uint8Array(Buffer.from(signature, "base64"));
  } catch (e) {
    console.error(e);
    Alert.alert("Error parseSignatureTextMessageResponse", e.message);
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
  const { twilioPhoneNumber, twilioUrl } =
    rootStore.multisigStore.currentChainInformation;
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
    console.error(e);
    Alert.alert("Error fetchTwilio", e.message);
  }
}

async function fetchAndDecryptResponse(key: string) {
  try {
    const result = await fetch(`https://obi-hastebin.herokuapp.com/raw/${key}`);
    const message = await result.text();
    return message;
  } catch (e) {
    console.error(e);
    Alert.alert("Error fetchAndDecryptResponse", e.message);
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
    console.error(e);
    Alert.alert("Error getMessageBody (1)", e.message);
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
    console.error(e);
    Alert.alert("Error getMessageBody (2)", e.message);
  }
}
