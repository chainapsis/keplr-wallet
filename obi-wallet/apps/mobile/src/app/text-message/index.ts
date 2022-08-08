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
    const result = await fetch("https://obi-hastebin.herokuapp.com/documents", {
      headers: {
        "Content-type": "application/text",
      },
      method: "POST",
      body: encrypted,
    });
    const { key } = JSON.parse(await result.text());
    return `My Obi magic message word is: ${key}`;
  } catch (e) {
    console.error(e);
  }
}

export async function getPublicKey(key: string) {
  try {
    const result = await fetch(`https://obi-hastebin.herokuapp.com/raw/${key}`);
    const message = await result.text();

    const token = totp.generate(DEV_SHARED_SECRET);
    try {
      totp.verify({ token, secret: DEV_SHARED_SECRET });
    } catch (err) {
      // Possible errors
      // - options validation
      // - "Invalid input - it is not base32 encoded string"
      console.error(err);
    }

    let decrypted = AES.decrypt(message, token).toString(enc.Utf8);
    // TODO: this is only needed as long as we don't have encryption on Twilio side
    if (decrypted.length === 0) {
      decrypted = message;
    }

    // TODO: better check that this is actually a valid public key
    if (!decrypted.startsWith("pubkey:")) {
      console.error("This doesn't seem to be a public key");
      return null;
    }

    return decrypted.replace("pubkey:", "");
  } catch (e) {
    console.error(e);
  }
}
