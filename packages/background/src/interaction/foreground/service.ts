import { InteractionForegroundHandler } from "./types";
import { InteractionWaitingData } from "../types";

export class InteractionForegroundService {
  constructor(
    protected handler: InteractionForegroundHandler,
    public readonly pingHandler?: (
      windowId: number | undefined,
      ignoreWindowIdAndForcePing: boolean
    ) => Promise<boolean>
  ) {}

  pushData(data: InteractionWaitingData): void {
    this.handler.onInteractionDataReceived(data);
  }

  pushEvent(
    data: Omit<
      InteractionWaitingData,
      "id" | "uri" | "isInternal" | "tabId" | "windowId"
    >
  ): void {
    this.handler.onEventDataReceived(data);
  }
}
