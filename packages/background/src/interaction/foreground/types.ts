import { InteractionWaitingData } from "../types";

export interface InteractionForegroundHandler {
  onInteractionDataReceived: (
    uri: string,
    data: InteractionWaitingData
  ) => void;
  onEventDataReceived: (
    data: Omit<InteractionWaitingData, "id" | "isInternal">
  ) => void;
}
