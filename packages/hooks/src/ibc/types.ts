export interface Channel {
  portId: string;
  channelId: string;
  counterpartyChainId: string;
}

export interface IIBCChannelConfig {
  channel: Channel | undefined;
  setChannel(channel: Channel | undefined): void;

  getError(): Error | undefined;
}
