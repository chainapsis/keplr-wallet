export enum KeplrErrorType {
  Invalid,
  KeyRing,
  Ledger,
  NotImplemented,
}

export class KeplrError extends Error {
  code: number;

  constructor(code: KeplrErrorType, message?: string) {
    super(message);
    this.code = code;
  }
}
