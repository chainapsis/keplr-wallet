export class KeplrError extends Error {
  public readonly module: string;
  public readonly code: number;

  constructor(module: string, code: number, message?: string) {
    super(message);
    this.module = module;
    this.code = code;

    Object.setPrototypeOf(this, KeplrError.prototype);
  }
}
