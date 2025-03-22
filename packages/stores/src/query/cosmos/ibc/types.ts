export type ChannelResponse = {
  channel: {
    state:
      | "STATE_UNINITIALIZED_UNSPECIFIED"
      | "STATE_INIT"
      | "STATE_TRYOPEN"
      | "STATE_OPEN"
      | "STATE_CLOSED";
    ordering: "ORDER_NONE_UNSPECIFIED" | "ORDER_UNORDERED" | "ORDER_ORDERED";
    counterparty: {
      port_id: string;
      channel_id: string;
    };
    connection_hops: string[];
    version: string;
  };
  proof: string;
  proof_path: string;
  proof_height: {
    epoch_number: string;
    epoch_height: string;
  };
};

export type ClientStateResponse = {
  identified_client_state: {
    // "07-tendermint-1" if tendermint.
    client_id: string;
    client_state: {
      // "/ibc.lightclients.tendermint.v1.ClientState" if tendermint.
      "@type": string;
      // chain_id: "test1";
    } & {
      [key: string]: unknown;
    };
  };
};

export type ClientStateV2Response = {
  client_state: {
    "@type": string;
    data: string;
    latest_height: {
      revision_number: string;
      revision_height: string;
    };
  };
};

export type DenomTraceResponse = {
  denom_trace: {
    path: string;
    base_denom: string;
  };
};

export type DenomTraceV2Response = {
  denom: {
    base: string;
    trace: {
      port_id: string;
      channel_id: string;
    }[];
  };
};
