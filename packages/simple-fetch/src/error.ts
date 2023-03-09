import { SimpleFetchResponse } from "./types";

export class SimpleFetchError extends Error {
  constructor(
    public readonly baseURL: string,
    public readonly url: string,
    public readonly response: SimpleFetchResponse<any> | undefined
  ) {
    super(`Failed to get response from ${new URL(url, baseURL).toString()}`);
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, SimpleFetchError.prototype);
  }
}

export function isSimpleFetchError(payload: any): payload is SimpleFetchError {
  return payload instanceof SimpleFetchError;
}
