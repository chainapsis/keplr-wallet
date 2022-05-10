export class KeplrError extends Error {
  module: string;
  code: number;

  constructor(module: string, code: number, message?: string) {
    super(message);
    this.module = module;
    this.code = code;

    Object.setPrototypeOf(this, KeplrError.prototype);
  }
}
