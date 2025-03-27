const MAGIC_BYTES = new TextEncoder().encode("Bitcoin Signed Message:\n");

export function encodeLegacyMessage(message: string, prefix?: string) {
  const magicBytes = prefix ? new TextEncoder().encode(prefix) : MAGIC_BYTES;
  const magicLength = encodeVarInt(magicBytes.length);
  const messageBytes = new TextEncoder().encode(message);
  const messageLength = encodeVarInt(messageBytes.length);

  const totalLength =
    magicLength.length +
    magicBytes.length +
    messageLength.length +
    messageBytes.length;

  const buffer = Buffer.alloc(totalLength);

  let offset = 0;
  buffer.set(magicLength, offset);
  offset += magicLength.length;
  buffer.set(magicBytes, offset);
  offset += magicBytes.length;
  buffer.set(messageLength, offset);
  offset += messageLength.length;
  buffer.set(messageBytes, offset);

  return buffer;
}

export function encodeLegacySignature(
  r: Uint8Array,
  s: Uint8Array,
  recovery: number,
  compressed?: boolean
) {
  if (!(recovery === 0 || recovery === 1 || recovery === 2 || recovery === 3)) {
    throw new Error("recovery must be 0, 1, 2, or 3");
  }

  const headerByte = recovery + 27 + (compressed ? 4 : 0);
  return Buffer.concat([
    Uint8Array.of(headerByte),
    Uint8Array.from(r),
    Uint8Array.from(s),
  ]).toString("base64");
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
