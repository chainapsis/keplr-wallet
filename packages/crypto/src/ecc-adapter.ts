// https://github.com/bitcoinerlab/secp256k1
import { secp256k1, schnorr } from "@noble/curves/secp256k1";
import * as mod from "@noble/curves/abstract/modular";
import * as utils from "@noble/curves/abstract/utils";

interface XOnlyPointAddTweakResult {
  parity: 1 | 0;
  xOnlyPubkey: Uint8Array;
}

const Point = secp256k1.ProjectivePoint;

const THROW_BAD_PRIVATE = "Expected Private";
const THROW_BAD_POINT = "Expected Point";
const THROW_BAD_TWEAK = "Expected Tweak";
const THROW_BAD_SIGNATURE = "Expected Signature";
const THROW_BAD_EXTRA_DATA = "Expected Extra Data (32 bytes)";
const THROW_BAD_SCALAR = "Expected Scalar";

const HASH_SIZE = 32;
const TWEAK_SIZE = 32;
const BN32_N = new Uint8Array([
  255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
  254, 186, 174, 220, 230, 175, 72, 160, 59, 191, 210, 94, 140, 208, 54, 65, 65,
]);
const EXTRA_DATA_SIZE = 32;

const _1n = BigInt(1);

function cmpBN32(data1: Uint8Array, data2: Uint8Array): number {
  for (let i = 0; i < 32; ++i) {
    if (data1[i] !== data2[i]) {
      return data1[i] < data2[i] ? -1 : 1;
    }
  }
  return 0;
}

function isTweak(tweak: any): boolean {
  if (
    !(tweak instanceof Uint8Array) ||
    tweak.length !== TWEAK_SIZE ||
    cmpBN32(tweak, BN32_N) >= 0
  ) {
    return false;
  }
  return true;
}

function isSignature(signature: any): boolean {
  return (
    signature instanceof Uint8Array &&
    signature.length === 64 &&
    cmpBN32(signature.subarray(0, 32), BN32_N) < 0 &&
    cmpBN32(signature.subarray(32, 64), BN32_N) < 0
  );
}

function isHash(h: any): boolean {
  return h instanceof Uint8Array && h.length === HASH_SIZE;
}

function isExtraData(e: any): boolean {
  return (
    e === undefined || (e instanceof Uint8Array && e.length === EXTRA_DATA_SIZE)
  );
}

function normalizeScalar(scalar: any) {
  let num;
  if (typeof scalar === "bigint") {
    num = scalar;
  } else if (
    typeof scalar === "number" &&
    Number.isSafeInteger(scalar) &&
    scalar >= 0
  ) {
    num = BigInt(scalar);
  } else if (typeof scalar === "string") {
    if (scalar.length !== 64)
      throw new Error("Expected 32 bytes of private scalar");
    num = utils.hexToNumber(scalar);
  } else if (scalar instanceof Uint8Array) {
    if (scalar.length !== 32)
      throw new Error("Expected 32 bytes of private scalar");
    num = utils.bytesToNumberBE(scalar);
  } else {
    throw new TypeError("Expected valid private scalar");
  }
  if (num < 0) throw new Error("Expected private scalar >= 0");
  return num;
}

function normalizePrivateKey(privateKey: Uint8Array) {
  return secp256k1.utils.normPrivateKeyToScalar(privateKey);
}

function _privateAdd(privateKey: Uint8Array, tweak: Uint8Array) {
  const p = normalizePrivateKey(privateKey);
  const t = normalizeScalar(tweak);
  const add = utils.numberToBytesBE(mod.mod(p + t, secp256k1.CURVE.n), 32);
  return secp256k1.utils.isValidPrivateKey(add) ? add : null;
}

function _privateNegate(privateKey: Uint8Array) {
  const p = normalizePrivateKey(privateKey);
  const not = utils.numberToBytesBE(secp256k1.CURVE.n - p, 32);
  return secp256k1.utils.isValidPrivateKey(not) ? not : null;
}

function _pointAddScalar(
  p: Uint8Array,
  tweak: Uint8Array,
  isCompressed: boolean
) {
  const P = fromHex(p);
  const t = normalizeScalar(tweak);
  // multiplyAndAddUnsafe(P, scalar, 1) = P + scalar*G
  const Q = Point.BASE.multiplyAndAddUnsafe(P, t, _1n);
  if (!Q) throw new Error("Tweaked point at infinity");
  return Q.toRawBytes(isCompressed);
}

function assumeCompression(compressed?: boolean, p?: Uint8Array) {
  if (compressed === undefined) {
    return p !== undefined ? isPointCompressed(p) : true;
  }
  return !!compressed;
}

function throwToNull<T>(fn: () => T): T | null {
  try {
    return fn();
  } catch (e) {
    return null;
  }
}

function fromXOnly(bytes: Uint8Array) {
  return schnorr.utils.lift_x(utils.bytesToNumberBE(bytes));
}

function fromHex(bytes: Uint8Array) {
  return bytes.length === 32 ? fromXOnly(bytes) : Point.fromHex(bytes);
}

function _isPoint(p: Uint8Array, xOnly: boolean) {
  if ((p.length === 32) !== xOnly) return false;
  try {
    if (xOnly) return !!fromXOnly(p);
    else return !!Point.fromHex(p);
  } catch (e) {
    return false;
  }
}

export function isPoint(p: Uint8Array): boolean {
  return _isPoint(p, false);
}

export function isPointCompressed(p: Uint8Array): boolean {
  const PUBLIC_KEY_COMPRESSED_SIZE = 33;
  return _isPoint(p, false) && p.length === PUBLIC_KEY_COMPRESSED_SIZE;
}

export function isPrivate(d: Uint8Array): boolean {
  return secp256k1.utils.isValidPrivateKey(d);
}

export function isXOnlyPoint(p: Uint8Array): boolean {
  return _isPoint(p, true);
}

export function xOnlyPointAddTweak(
  p: Uint8Array,
  tweak: Uint8Array
): XOnlyPointAddTweakResult | null {
  if (!isXOnlyPoint(p)) {
    throw new Error(THROW_BAD_POINT);
  }
  if (!isTweak(tweak)) {
    throw new Error(THROW_BAD_TWEAK);
  }
  return throwToNull(() => {
    const P = _pointAddScalar(p, tweak, true);
    const parity = P[0] % 2 === 1 ? 1 : 0;
    return { parity, xOnlyPubkey: P.slice(1) };
  });
}

export function pointFromScalar(
  sk: Uint8Array,
  compressed?: boolean
): Uint8Array | null {
  if (!isPrivate(sk)) {
    throw new Error(THROW_BAD_PRIVATE);
  }
  return throwToNull(() =>
    secp256k1.getPublicKey(sk, assumeCompression(compressed))
  );
}

export function pointCompress(p: Uint8Array, compressed?: boolean): Uint8Array {
  if (!isPoint(p)) {
    throw new Error(THROW_BAD_POINT);
  }
  return fromHex(p).toRawBytes(assumeCompression(compressed, p));
}

export function pointAddScalar(
  p: Uint8Array,
  tweak: Uint8Array,
  compressed?: boolean
): Uint8Array | null {
  if (!isPoint(p)) {
    throw new Error(THROW_BAD_POINT);
  }
  if (!isTweak(tweak)) {
    throw new Error(THROW_BAD_TWEAK);
  }
  return throwToNull(() =>
    _pointAddScalar(p, tweak, assumeCompression(compressed, p))
  );
}

export function privateAdd(
  d: Uint8Array,
  tweak: Uint8Array
): Uint8Array | null {
  if (!isPrivate(d)) {
    throw new Error(THROW_BAD_PRIVATE);
  }
  if (!isTweak(tweak)) {
    throw new Error(THROW_BAD_TWEAK);
  }
  return throwToNull(() => _privateAdd(d, tweak));
}

export function privateNegate(d: Uint8Array): Uint8Array {
  if (!isPrivate(d)) {
    throw new Error(THROW_BAD_PRIVATE);
  }
  const result = _privateNegate(d);
  if (!result) {
    throw new Error(THROW_BAD_PRIVATE);
  }

  return result;
}

export function sign(h: Uint8Array, d: Uint8Array, e?: Uint8Array): Uint8Array {
  if (!isPrivate(d)) {
    throw new Error(THROW_BAD_PRIVATE);
  }
  if (!isHash(h)) {
    throw new Error(THROW_BAD_SCALAR);
  }
  if (!isExtraData(e)) {
    throw new Error(THROW_BAD_EXTRA_DATA);
  }
  return secp256k1.sign(h, d, { extraEntropy: e }).toCompactRawBytes();
}

export function signSchnorr(
  h: Uint8Array,
  d: Uint8Array,
  e?: Uint8Array
): Uint8Array {
  if (!isPrivate(d)) {
    throw new Error(THROW_BAD_PRIVATE);
  }
  if (!isHash(h)) {
    throw new Error(THROW_BAD_SCALAR);
  }
  if (!isExtraData(e)) {
    throw new Error(THROW_BAD_EXTRA_DATA);
  }
  return schnorr.sign(h, d, e);
}

export function verify(
  h: Uint8Array,
  Q: Uint8Array,
  signature: Uint8Array,
  strict?: boolean
): boolean {
  if (!isPoint(Q)) {
    throw new Error(THROW_BAD_POINT);
  }
  if (!isSignature(signature)) {
    throw new Error(THROW_BAD_SIGNATURE);
  }
  if (!isHash(h)) {
    throw new Error(THROW_BAD_SCALAR);
  }
  return secp256k1.verify(signature, h, Q, { lowS: strict });
}

export function verifySchnorr(
  h: Uint8Array,
  Q: Uint8Array,
  signature: Uint8Array
): boolean {
  if (!isXOnlyPoint(Q)) {
    throw new Error(THROW_BAD_POINT);
  }
  if (!isSignature(signature)) {
    throw new Error(THROW_BAD_SIGNATURE);
  }
  if (!isHash(h)) {
    throw new Error(THROW_BAD_SCALAR);
  }
  return schnorr.verify(signature, h, Q);
}
