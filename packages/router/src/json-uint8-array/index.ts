import { Buffer } from "buffer/";

// The JSON encoder that supports the `Uint8Array`.
export class JSONUint8Array {
  static parse(text: string) {
    return JSON.parse(text, (_, value) => {
      if (
        value &&
        typeof value === "string" &&
        value.startsWith("__uint8array__")
      ) {
        return new Uint8Array(
          Buffer.from(value.replace("__uint8array__", ""), "hex")
        );
      }

      return value;
    });
  }

  static stringify(obj: unknown): string {
    return JSON.stringify(obj, (_, value) => {
      if (
        value &&
        (value instanceof Uint8Array ||
          (typeof value === "object" &&
            "type" in value &&
            "data" in value &&
            value.type === "Buffer" &&
            Array.isArray(value.data)))
      ) {
        return `__uint8array__${Buffer.from(value).toString("hex")}`;
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
