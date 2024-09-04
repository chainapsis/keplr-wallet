export interface InteractionWaitingData<T = unknown> {
  id: string;
  type: string;
  isInternal: boolean;
  data: T;
  tabId: number | undefined;
  windowId: number | undefined;
  uri: string;
}
