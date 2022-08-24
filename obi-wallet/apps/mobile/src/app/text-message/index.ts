import { AES, enc } from "crypto-js";
import { totp } from "otplib";
import {
  PHONE_NUMBER_KEY_SECRET,
  PHONE_NUMBER_TWILIO_PHONE_NUMBER,
  PHONE_NUMBER_TWILIO_BASIC_AUTH_USER,
  PHONE_NUMBER_TWILIO_BASIC_AUTH_PASSWORD,
} from "react-native-dotenv";

const DEV_SHARED_SECRET = PHONE_NUMBER_KEY_SECRET;
const TWILIO_NUMBER = PHONE_NUMBER_TWILIO_PHONE_NUMBER;
const TWILIO_BASIC_AUTH = `Basic ${Buffer.from(
  `${PHONE_NUMBER_TWILIO_BASIC_AUTH_USER}:${PHONE_NUMBER_TWILIO_BASIC_AUTH_PASSWORD}`
).toString("base64")}`;

export async function sendTextMessage({
  phoneNumber,
  securityAnswer,
}: {
  phoneNumber: string;
  securityAnswer: string;
}) {
  const body = await getMessageBody(`pub:${securityAnswer}`);
  const formData = new FormData();
  formData.append("To", TWILIO_NUMBER);
  formData.append("From", phoneNumber);
  formData.append("Parameters", JSON.stringify({ trigger_body: body }));

  await fetch(
    "https://studio.twilio.com/v2/Flows/FW2de98dc924361e35906dad1ed6125dc6/Executions",
    {
      body: formData,
      method: "post",
      headers: {
        Authorization: TWILIO_BASIC_AUTH,
      },
    }
  );
}

export async function getMessageBody(message: string) {
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
    return key;
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

    if (!decrypted.startsWith("pubkey:")) {
      console.error("This doesn't seem to be a public key");
      return null;
    }

    return decrypted.replace("pubkey:", "");
  } catch (e) {
    console.error(e);
  }
}

export async function sendSignMessageText({
  phoneNumber,
  securityAnswer,
  message,
}: {
  phoneNumber: string;
  securityAnswer: string;
  message: Uint8Array;
}) {
  console.log(
    `sign:${securityAnswer},${Buffer.from(message.buffer).toString("base64")}`
  );
  const body = await getMessageBody(
    `sign:${securityAnswer},${Buffer.from(message.buffer).toString("base64")}`
  );
  console.log(body);
  const formData = new FormData();
  formData.append("To", TWILIO_NUMBER);
  formData.append("From", phoneNumber);
  formData.append("Parameters", JSON.stringify({ trigger_body: body }));

  await fetch(
    "https://studio.twilio.com/v2/Flows/FW2de98dc924361e35906dad1ed6125dc6/Executions",
    {
      body: formData,
      method: "post",
      headers: {
        Authorization: TWILIO_BASIC_AUTH,
      },
    }
  );
}

export async function getSignature(key: string) {
  try {
    const result = await fetch(`https://obi-hastebin.herokuapp.com/raw/${key}`);
    const message = await result.text();

    // const token = totp.generate(DEV_SHARED_SECRET);
    // try {
    //   totp.verify({ token, secret: DEV_SHARED_SECRET });
    // } catch (err) {
    //   // Possible errors
    //   // - options validation
    //   // - "Invalid input - it is not base32 encoded string"
    //   console.error(err);
    // }

    // let decrypted = AES.decrypt(message, token).toString(enc.Utf8);
    // TODO: this is only needed as long as we don't have encryption on Twilio side
    // if (decrypted.length === 0) {
    const decrypted = message;
    // }

    if (!decrypted.startsWith("signature::")) {
      console.error("This doesn't seem to be a signature");
      return null;
    }

    const signature = decrypted.replace("signature::", "");
    return new Uint8Array(Buffer.from(signature, "base64"));
  } catch (e) {
    console.error(e);
  }
}
