export interface Result {
  /**
   * NOTE: If `error` is of type `{ module: string; code: number; message: string }`,
   * it should be considered and processed as `KeplrError`.
   * Also, if `error` is of type `{ code: number; message: string; data: unknown }`,
   * it should be considered and processed as `EthereumProviderRpcError`.
   */
  error?:
    | string
    | {
        module: string;
        code: number;
        message: string;
      }
    | {
        code: number;
        message: string;
        data: unknown;
      };
  return?: any;
}
