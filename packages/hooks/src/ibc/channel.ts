import { IIBCChannelConfig, Channel } from "./types";
import { action, computed, makeObservable, observable } from "mobx";
import { ChannelNotSetError } from "./errors";
import { useState } from "react";

export class IBCChannelConfig implements IIBCChannelConfig {
  @observable.ref
  protected _channels: Channel[] = [];

  constructor() {
    makeObservable(this);
  }

  get channels(): Channel[] {
    return this._channels;
  }

  @computed
  get error(): Error | undefined {
    if (this._channels.length === 0) {
      return new ChannelNotSetError("Channel not set");
    }
    return undefined;
  }

  @action
  setChannels(channels: Channel[]): void {
    this._channels = [...channels];
  }
}

export const useIBCChannelConfig = () => {
  const [config] = useState(() => {
    return new IBCChannelConfig();
  });

  return config;
};
