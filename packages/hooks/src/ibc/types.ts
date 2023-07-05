export interface Channel {
  portId: string;
  channelId: string;
  counterpartyChainId: string;
}

export interface IIBCChannelConfig {
  channels: Channel[];
  setChannels(channels: Channel[]): void;

  error: Error | undefined;
}
