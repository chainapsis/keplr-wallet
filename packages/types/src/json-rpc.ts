export interface JsonRpcResponse<T, V extends string = "2.0"> {
  jsonrpc: V;
  id: number | string;
  result?: T;
  error?: JsonRpcError;
}

export interface JsonRpcError {
  code: number;
  message: string;
  data?: unknown;
}
