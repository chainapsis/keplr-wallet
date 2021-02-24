import { Buffer } from "buffer/";

export class UnknownMessage {
  constructor(
    /** Any type_url. */
    protected readonly _typeUrl: string,
    /** Any value. */
    protected readonly _value: Uint8Array
  ) {}

  get typeUrl(): string {
    return this._typeUrl;
  }

  get value(): Uint8Array {
    return this._value;
  }

  toJSON() {
    return {
      type_url: this._typeUrl,
      value: Buffer.from(this._value).toString("base64"),
    };
  }
}
