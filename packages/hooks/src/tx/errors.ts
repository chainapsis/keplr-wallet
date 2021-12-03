export class EmptyAddressError extends Error {
  constructor(m: string) {
    super(m);
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, EmptyAddressError.prototype);
  }
}

export class InvalidBech32Error extends Error {
  constructor(m: string) {
    super(m);
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, InvalidBech32Error.prototype);
  }
}

export class ENSNotSupportedError extends Error {
  constructor(m: string) {
    super(m);
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, ENSNotSupportedError.prototype);
  }
}

export class ENSIsFetchingError extends Error {
  constructor(m: string) {
    super(m);
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, ENSIsFetchingError.prototype);
  }
}

export class ENSFailedToFetchError extends Error {
  constructor(m: string) {
    super(m);
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, ENSFailedToFetchError.prototype);
  }
}

export class EmptyAmountError extends Error {
  constructor(m: string) {
    super(m);
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, EmptyAmountError.prototype);
  }
}

export class InvalidNumberAmountError extends Error {
  constructor(m: string) {
    super(m);
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, InvalidNumberAmountError.prototype);
  }
}

export class ZeroAmountError extends Error {
  constructor(m: string) {
    super(m);
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, ZeroAmountError.prototype);
  }
}

export class NegativeAmountError extends Error {
  constructor(m: string) {
    super(m);
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, NegativeAmountError.prototype);
  }
}

export class InsufficientAmountError extends Error {
  constructor(m: string) {
    super(m);
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, InsufficientAmountError.prototype);
  }
}

export class NotLoadedFeeError extends Error {
  constructor(m: string) {
    super(m);
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, NotLoadedFeeError.prototype);
  }
}

export class InsufficientFeeError extends Error {
  constructor(m: string) {
    super(m);
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, InsufficientFeeError.prototype);
  }
}
