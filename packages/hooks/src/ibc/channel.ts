import { IIBCChannelConfig, Channel } from "./types";
import { action, makeObservable, observable } from "mobx";
import { ChannelNotSetError } from "./errors";
import { useState } from "react";

export class IBCChannelConfig implements IIBCChannelConfig {
  @observable.ref
  protected _channel: Channel | undefined = undefined;

  constructor() {
    makeObservable(this);
  }

  get channel(): Channel | undefined {
    return this._channel;
  }

  getError(): Error | undefined {
    if (!this._channel) {
      return new ChannelNotSetError("Channel not set");
    }
    return undefined;
  }

  @action
  setChannel(channel: Channel | undefined): void {
    this._channel = channel;
  }
}

export const useIBCChannelConfig = () => {
  const [config] = useState(() => {
    return new IBCChannelConfig();
  });

  return config;
};
