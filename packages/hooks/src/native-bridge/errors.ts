export class BridgeAmountError extends Error {
  constructor(m: string) {
    super(m);
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, BridgeAmountError.prototype);
  }
}
