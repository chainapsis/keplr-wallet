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

export class EthereumProviderRpcError extends Error {
  public readonly code: number;
  public readonly data?: unknown;

  constructor(code: number, message: string, data?: unknown) {
    super(message);
    this.code = code;
    this.data = data;

    Object.setPrototypeOf(this, EthereumProviderRpcError.prototype);
  }
}
