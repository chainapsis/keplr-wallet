// The JSON encoder that supports the `Uint8Array`.
import { fromHex, toHex } from "./hex";

export class JSONUint8Array {
  static parse(text: string) {
    return JSON.parse(text, (key, value) => {
      // Prevent potential prototype poisoning.
      if (key === "__proto__") {
        throw new Error("__proto__ is disallowed");
      }

      if (
        value &&
        typeof value === "string" &&
        value.startsWith("__uint8array__")
      ) {
        return fromHex(value.replace("__uint8array__", ""));
      }

      return value;
    });
  }

  static stringify(obj: unknown): string {
    return JSON.stringify(obj, (key, value) => {
      // Prevent potential prototype poisoning.
      if (key === "__proto__") {
        throw new Error("__proto__ is disallowed");
      }

      if (
        value &&
        (value instanceof Uint8Array ||
          (typeof value === "object" &&
            "type" in value &&
            "data" in value &&
            value.type === "Buffer" &&
            Array.isArray(value.data)))
      ) {
        const array =
          value instanceof Uint8Array ? value : new Uint8Array(value.data);

        return `__uint8array__${toHex(array)}`;
      }

      return value;
    });
  }

  static wrap(obj: any): any {
    if (obj === undefined) return undefined;

    return JSON.parse(JSONUint8Array.stringify(obj));
  }

  static unwrap(obj: any): any {
    if (obj === undefined) return undefined;

    return JSONUint8Array.parse(JSON.stringify(obj));
  }
}
