import { InteractionWaitingData } from "../types";

export interface InteractionForegroundHandler {
  onInteractionDataReceived: (data: InteractionWaitingData) => void;
  onEventDataReceived: (
    data: Omit<
      InteractionWaitingData,
      "id" | "uri" | "isInternal" | "tabId" | "windowId"
    >
  ) => void;
}
