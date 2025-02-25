export function encodeLegacyMessage(
  message: string,
  messagePrefix?: string
): Uint8Array {
  const encoder = new TextEncoder();

  const magicBytes = encoder.encode(
    messagePrefix || "\u0018Bitcoin Signed Message:\n"
  );
  const messageBytes = encoder.encode(message);

  const messageLength = encodeVarInt(messageBytes.length);

  const totalLength =
    magicBytes.length + messageLength.length + messageBytes.length;
  const buffer = new Uint8Array(totalLength);

  let offset = 0;
  buffer.set(magicBytes, offset);
  offset += magicBytes.length;
  buffer.set(messageLength, offset);
  offset += messageLength.length;
  buffer.set(messageBytes, offset);

  return buffer;
}

// https://github.com/bitcoinjs/bitcoinjs-message
export function encodeLegacySignature(
  r: Uint8Array,
  s: Uint8Array,
  recovery: number,
  compressed: boolean,
  segwitType: "p2wpkh" | "p2sh-p2wpkh"
) {
  if (segwitType !== undefined) {
    recovery += 8;
    if (segwitType === "p2wpkh") recovery += 4;
  } else {
    if (compressed) recovery += 4;
  }
  return Buffer.concat([Buffer.alloc(1, recovery + 27), r, s]);
}

function encodeVarInt(value: number): Uint8Array {
  let buffer: Uint8Array;
  let dataView: DataView;

  if (value < 253) {
    buffer = new Uint8Array(1);
    buffer[0] = value;
  } else if (value < 0x10000) {
    buffer = new Uint8Array(3);
    buffer[0] = 253;
    dataView = new DataView(buffer.buffer);
    dataView.setUint16(1, value, true);
  } else if (value < 0x100000000) {
    buffer = new Uint8Array(5);
    buffer[0] = 254;
    dataView = new DataView(buffer.buffer);
    dataView.setUint32(1, value, true);
  } else {
    buffer = new Uint8Array(9);
    buffer[0] = 255;
    dataView = new DataView(buffer.buffer);
    dataView.setInt32(1, value & -1, true);
    dataView.setUint32(5, Math.floor(value / 0x100000000), true);
  }
  return buffer;
}
