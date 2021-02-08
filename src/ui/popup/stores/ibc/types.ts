export interface Channel {
  portId: string;
  channelId: string;
  counterpartyChainId: string;
}

export interface ChannelWithChainId extends Channel {
  chainId: string;
}
