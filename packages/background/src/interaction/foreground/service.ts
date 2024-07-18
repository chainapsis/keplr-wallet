import { InteractionForegroundHandler } from "./types";
import { InteractionWaitingData } from "../types";

export class InteractionForegroundService {
  constructor(protected handler: InteractionForegroundHandler) {}

  pushData(uri: string, data: InteractionWaitingData): void {
    this.handler.onInteractionDataReceived(uri, data);
  }

  pushEvent(data: Omit<InteractionWaitingData, "id" | "isInternal">): void {
    this.handler.onEventDataReceived(data);
  }
}
