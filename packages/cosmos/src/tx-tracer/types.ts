export enum WsReadyState {
  CONNECTING,
  OPEN,
  CLOSING,
  CLOSED,
  // WS is not initialized or the ready state of WS is unknown
  NONE,
}

export interface TxEventMap {
  close: (e: CloseEvent) => void;
  error: (e: ErrorEvent) => void;
  message: (e: MessageEvent) => void;
  open: (e: Event) => void;
}
