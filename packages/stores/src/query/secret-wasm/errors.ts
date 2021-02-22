export class WrongViewingKeyError extends Error {
  constructor(m: string) {
    super(m);
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, WrongViewingKeyError.prototype);
  }
}
