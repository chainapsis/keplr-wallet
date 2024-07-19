import { InteractionForegroundHandler } from "./types";
import { InteractionWaitingData } from "../types";

export class InteractionForegroundService {
  constructor(
    protected handler: InteractionForegroundHandler,
    public readonly pingHandler?: () => boolean
  ) {}

  pushData(data: InteractionWaitingData): void {
    this.handler.onInteractionDataReceived(data);
  }

  pushEvent(
    data: Omit<InteractionWaitingData, "id" | "uri" | "isInternal">
  ): void {
    this.handler.onEventDataReceived(data);
  }
}
