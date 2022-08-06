import { AES, enc } from "crypto-js";
import { totp } from "otplib";
import { Linking } from "react-native";

// TODO: env
const DEV_SHARED_SECRET =
  "12766cbqtpp5x6fplhkbmecj67290gynn090dlhrdj17u36fbcdpg";
// TODO: env
const TWILIO_NUMBER = "+19705509509";

export async function sendTextMessage(securityAnswer: string) {
  const body = await getMessageBody(securityAnswer);
  // TODO: env
  await Linking.openURL(`sms:${TWILIO_NUMBER}&body=${body}`);
}

export async function sendWhatsAppMessage(securityAnswer: string) {
  const body = await getMessageBody(securityAnswer);
  // TODO: env
  await Linking.openURL(`sms:${TWILIO_NUMBER}&body=${body}`);
}

export async function getMessageBody(securityAnswer: string) {
  const message = `pub:${securityAnswer}`;
  // TODO: env

  // absurdly large step for dev convenience
  totp.options = { digits: 64, step: 600 };
  const token = totp.generate(DEV_SHARED_SECRET);
  try {
    totp.verify({ token, secret: DEV_SHARED_SECRET });
  } catch (err) {
    // Possible errors
    // - options validation
    // - "Invalid input - it is not base32 encoded string"
    console.error(err);
  }
  const encrypted = AES.encrypt(message, token).toString();

  try {
    const result = await fetch("https://hastebin.com/documents", {
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
  }
}

export async function getPublicKey(key: string) {
  try {
    const result = await fetch(`https://hastebin.com/raw/${key}`);
    const message = await result.text();

    console.log({ message });

    const token = totp.generate(DEV_SHARED_SECRET);
    try {
      totp.verify({ token, secret: DEV_SHARED_SECRET });
    } catch (err) {
      // Possible errors
      // - options validation
      // - "Invalid input - it is not base32 encoded string"
      console.error(err);
    }
    const decrypted = AES.decrypt(message, token).toString(enc.Utf8);
    console.log({ decrypted });
    // TODO: check that this is actually a valid public key
  } catch (e) {
    console.error(e);
  }
}
