import { InteractionWaitingData } from "../types";

export interface InteractionForegroundHandler {
  onInteractionDataReceived: (data: InteractionWaitingData) => void;
}
