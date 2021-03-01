import { InteractionForegroundHandler } from "./types";
import { InteractionWaitingData } from "../types";

export class InteractionForegroundService {
  constructor(protected handler: InteractionForegroundHandler) {}

  pushData(data: InteractionWaitingData): void {
    this.handler.onInteractionDataReceived(data);
  }

  pushEvent(data: Omit<InteractionWaitingData, "id">): void {
    this.handler.onEventDataReceived(data);
  }
}
