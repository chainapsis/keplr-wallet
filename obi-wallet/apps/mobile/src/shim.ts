import "fastestsmallesttextencoderdecoder";
import "react-native-url-polyfill/auto";
import { randomBytes as getRandomBytes } from "crypto";

// eslint-disable-next-line @typescript-eslint/no-var-requires
global.Buffer = global.Buffer ?? require("buffer/").Buffer;

// This has to be before crypto
global.process = global.process ?? require("process");
// @ts-expect-error
global.process["version"] = "16.15.0";

// noinspection JSConstantReassignment
global.crypto = global.crypto ?? require("react-native-crypto");

global.crypto.getRandomValues = (values) => {
  if (
    !(values instanceof Int8Array) &&
    !(values instanceof Uint8Array) &&
    !(values instanceof Int16Array) &&
    !(values instanceof Uint16Array) &&
    !(values instanceof Int32Array) &&
    !(values instanceof Uint32Array) &&
    !(values instanceof Uint8ClampedArray)
  ) {
    throw new TypeError(
      `The provided ArrayBuffer view is not an integer-typed array`
    );
  }

  const randomBytes = getRandomBytes(values.byteLength);

  const TypedArrayConstructor = values.constructor;
  // @ts-expect-error
  const randomValues = new TypedArrayConstructor(
    randomBytes.buffer,
    randomBytes.byteOffset,
    values.length
  );
  // Copy the data into the given TypedArray, letting the VM optimize the copy if possible
  values.set(randomValues);
  return values;
};
