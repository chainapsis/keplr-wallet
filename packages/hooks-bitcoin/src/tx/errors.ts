export class EmptyAddressError extends Error {
  constructor(m: string) {
    super(m);
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, EmptyAddressError.prototype);
  }
}

export class InvalidBitcoinAddressError extends Error {
  constructor(m: string) {
    super(m);
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, InvalidBitcoinAddressError.prototype);
  }
}

export class InvalidBech32Error extends Error {
  constructor(m: string) {
    super(m);
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, InvalidBech32Error.prototype);
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

export class DustAmountError extends Error {
  constructor(m: string) {
    super(m);
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, DustAmountError.prototype);
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

export class UnknownCurrencyError extends Error {
  constructor(m: string) {
    super(m);
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, UnknownCurrencyError.prototype);
  }
}

export class NotSupportedCurrencyError extends Error {
  constructor(m: string) {
    super(m);
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, UnknownCurrencyError.prototype);
  }
}

export class MemoSuspectMnemonicInclusion extends Error {
  constructor(m: string) {
    super(m);
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, MemoSuspectMnemonicInclusion.prototype);
  }
}

export class UnableToFindProperUtxosError extends Error {
  constructor(m: string) {
    super(m);
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, UnableToFindProperUtxosError.prototype);
  }
}

export class MaximumFeeRateReachedError extends Error {
  constructor(m: string) {
    super(m);
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, MaximumFeeRateReachedError.prototype);
  }
}
