export class ChannelNotSetError extends Error {
  constructor(m: string) {
    super(m);
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, ChannelNotSetError.prototype);
  }
}
