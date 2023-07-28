import { IIBCChannelConfig, Channel } from "./types";
import { action, computed, makeObservable, observable } from "mobx";
import { ChannelNotSetError } from "./errors";
import { useState } from "react";
import { UIProperties } from "../tx";

export class IBCChannelConfig implements IIBCChannelConfig {
  @observable.ref
  protected _channels: Channel[] = [];

  @observable
  protected _disabled = false;

  constructor(disabled: boolean) {
    this._disabled = disabled;

    makeObservable(this);
  }

  // Computed is required for persisting the ref of result of this getter even if disabled.
  @computed
  get channels(): Channel[] {
    if (this._disabled) {
      return [];
    }

    return this._channels;
  }

  @computed
  get uiProperties(): UIProperties {
    if (this._disabled) {
      return {};
    }

    if (this._channels.length === 0) {
      return {
        error: new ChannelNotSetError("Channel not set"),
      };
    }
    return {};
  }

  @action
  setChannels(channels: Channel[]): void {
    this._channels = [...channels];
  }

  @action
  setDisabled(disabled: boolean) {
    this._disabled = disabled;
  }
}

export const useIBCChannelConfig = (disabled: boolean = false) => {
  const [config] = useState(() => {
    return new IBCChannelConfig(disabled);
  });
  config.setDisabled(disabled);

  return config;
};
