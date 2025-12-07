import { SwapProvider } from "@keplr-wallet/types";
export { SwapProvider };

export enum SwapChainType {
  COSMOS = "cosmos",
  EVM = "evm",
}

export interface SwappableRequest {
  tokens: {
    chain_id: string;
    denom: string;
  }[];
}

export interface SwappableResponse {
  tokens: {
    chain_id: string;
    denom: string;
  }[];
}

export interface TargetAssetsRequest {
  chain_id: string;
  denom: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface TargetAssetsResponse {
  tokens: {
    token_id: string;
    type: SwapChainType;
    chain_id: string;
    denom: string;
    symbol: string;
    name: string;
    decimals: number;
    image_url?: string | null;
    coingecko_id?: string | null;
    vendor: string[];
  }[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface RelatedAssetsRequest {
  chain_id: string;
  denom: string;
}

export interface RelatedAssetsResponse {
  tokens: {
    token_id: string;
    type: SwapChainType;
    chain_id: string;
    denom: string;
    symbol: string;
    name: string;
    decimals: number;
    image_url?: string | null;
    coingecko_id?: string | null;
    vendor: string[];
  }[];
}

export interface ValidateTargetAssetsRequest {
  chain_id: string;
  denom: string;
  tokens: {
    chain_id: string;
    denom: string;
  }[];
}

export interface ValidateTargetAssetsResponse {
  tokens: {
    chain_id: string;
    denom: string;
  }[];
}

export interface RouteRequestV2 {
  from_chain: string; // source chain id
  from_token: string; // source token denom
  amount: string; // amount to swap
  to_chain: string; // destination chain id
  to_token: string; // destination token denom
  from_address: string; // from chain user address
  to_address: string; // to chain user address
  slippage: number; // minimum 0, maximum 100
  providers?: SwapProvider[];
}

export interface SwapFeeToken {
  type: SwapChainType;
  chain_id: string;
  denom: string;
  symbol: string;
  name: string;
  decimals: number;
  coingecko_id?: string | null;
  image_url?: string | null;
}

export interface SwapFee {
  usd_amount: string;
  amount: string;
  fee_token: SwapFeeToken;
}

export enum RouteStepType {
  SWAP = "swap",
  BRIDGE = "bridge",
  IBC_TRANSFER = "ibc-transfer",
}

export interface RouteStep {
  type: RouteStepType;
  from_chain: string;
  to_chain: string;
  from_token: string;
  to_token: string;
  from_amount: string;
  to_amount: string;
}

interface RouteResponseV2Base {
  amount_out: string;
  price_impact_percent: number;
  estimated_time: number;
  fees: SwapFee[];
  steps: RouteStep[];
  required_chain_ids: string[];
}

export type RouteResponseV2 =
  | (RouteResponseV2Base & {
      provider: SwapProvider.SKIP;
      skip_operations: SkipOperation[];
    })
  | (RouteResponseV2Base & {
      provider: SwapProvider.SQUID;
    });

export interface TxRequestBase {
  from_chain: string;
  from_token: string;
  to_chain: string;
  to_token: string;
  amount: string;
  chain_ids_to_addresses: Record<string, string>;
  slippage: number;
}

export type TxRequest =
  | (TxRequestBase & {
      provider: SwapProvider.SKIP;
      amount_out: string;
      required_chain_ids: string[];
      skip_operations: SkipOperation[];
    })
  | (TxRequestBase & {
      provider: SwapProvider.SQUID;
    });

export interface CosmosTxData {
  chain_id: string;
  signer_address: string;
  msgs: (
    | {
        type: "cosmos-sdk/MsgTransfer";
        value: {
          source_port: string;
          source_channel: string;
          token: {
            denom: string;
            amount: string;
          };
          sender: string;
          receiver: string;
          timeout_timestamp: string;
          memo?: string;
        };
      }
    | {
        type: "wasm/MsgExecuteContract";
        value: {
          sender: string;
          contract: string;
          msg: object;
          funds: {
            denom: string;
            amount: string;
          }[];
        };
      }
    | {
        type: "cctp/DepositForBurn";
        value: {
          from: string;
          amount: string;
          destination_domain: number;
          mint_recipient: string;
          burn_token: string;
        };
      }
    | {
        type: "cctp/DepositForBurnWithCaller";
        value: {
          from: string;
          amount: string;
          destination_domain: number;
          mint_recipient: string;
          burn_token: string;
          destination_caller: string;
        };
      }
    | {
        type: "cosmos-sdk/MsgSend";
        value: {
          from_address: string;
          to_address: string;
          amount: Array<{
            denom: string;
            amount: string;
          }>;
        };
      }
  )[];
}

export interface EVMTxData {
  chain_id: string;
  to: string;
  data: string;
  value: string;
  gas_limit?: string;
  gas_price?: string;
  max_fee_per_gas?: string;
  max_priority_fee_per_gas?: string;
  approvals?: {
    token_contract: string;
    spender: string;
    amount: string;
  }[];
}

export type SwapTransaction =
  | {
      chain_type: SwapChainType.COSMOS;
      tx_data: CosmosTxData;
    }
  | {
      chain_type: SwapChainType.EVM;
      tx_data: EVMTxData;
    };

export interface TxResponse {
  provider: SwapProvider;
  amount_out: string;
  transactions: SwapTransaction[];
}

export interface ChainsResponseV2 {
  chains: {
    chain_id: string;
    pfm_enabled: boolean;
    supports_memo?: boolean;
    chain_type: string;
  }[];
}

export type NoneIBCBridgeInfoV2 = {
  destinationChainId: string;
  denom: string;
};

export type IBCChannelV2 = {
  destinationChainId: string;
  originDenom: string;
  originChainId: string;

  channels: {
    portId: string;
    channelId: string;
    counterpartyChainId: string;
  }[];

  denom: string;
};

/**
 * Operation types for Skip
 */

export enum BridgeType {
  IBC = "IBC",
  AXELAR = "AXELAR",
  CCTP = "CCTP",
  HYPERLANE = "HYPERLANE",
  OPINIT = "OPINIT",
  GO_FAST = "GO_FAST",
  STARGATE = "STARGATE",
  LAYER_ZERO = "LAYER_ZERO",
  EUREKA = "EUREKA",
}

export interface SkipFeeAsset {
  denom: string;
  chain_id: string;
  origin_denom: string;
  origin_chain_id: string;
  trace: string;
  is_cw20: boolean;
  is_evm: boolean;
  is_svm: boolean;
  symbol?: string | null;
  name?: string | null;
  logo_uri?: string | null;
  decimals?: number | null;
  token_contract?: string | null;
  description?: string | null;
  coingecko_id?: string | null;
  recommended_symbol?: string | null;
}

export interface SmartRelayFeeQuote {
  fee_amount?: string;
  relayer_address?: string;
  expiration?: string;
  fee_denom?: string;
  fee_payment_address?: string | null;
}

export interface SwapVenue {
  chain_id?: string;
  name?: string;
  logo_uri?: string | null;
}

export interface SwapOperation {
  denom_in?: string;
  denom_out?: string;
  pool?: string;
  interface?: string | null;
}

export interface SwapExactCoinIn {
  swap_venue?: SwapVenue;
  swap_operations?: SwapOperation[];
  swap_amount_in?: string | null;
  price_impact_percent?: string | null;
  estimated_amount_out?: string | null;
}

export interface SwapExactCoinOut {
  swap_venue?: SwapVenue;
  swap_operations?: SwapOperation[];
  swap_amount_out?: string;
  price_impact_percent?: string | null;
}

export interface SwapRoute {
  swap_amount_in?: string;
  denom_in?: string;
  swap_operations?: SwapOperation[];
}

export interface SmartSwapExactCoinIn {
  swap_venue?: SwapVenue;
  swap_routes?: SwapRoute[];
  estimated_amount_out?: string | null;
}

export interface Swap {
  swap_in?: SwapExactCoinIn;
  swap_out?: SwapExactCoinOut;
  smart_swap_in?: SmartSwapExactCoinIn;
  estimated_affiliate_fee?: string;
  from_chain_id?: string;
  chain_id?: string;
  denom_in?: string;
  denom_out?: string;
  swap_venues?: SwapVenue[];
}

export interface Transfer {
  port?: string;
  channel?: string;
  from_chain_id?: string;
  to_chain_id?: string;
  pfm_enabled?: boolean;
  supports_memo?: boolean;
  denom_in?: string;
  denom_out?: string;
  fee_amount?: string | null;
  usd_fee_amount?: string | null;
  fee_asset?: SkipFeeAsset | null;
  bridge_id?: BridgeType;
  smart_relay?: boolean;
  to_chain_entry_contract_address?: string | null;
  to_chain_callback_contract_address?: string | null;
  dest_denom?: string;
}

export interface AxelarTransfer {
  from_chain_id?: string;
  to_chain_id?: string;
  asset?: string;
  should_unwrap?: boolean;
  denom_in?: string;
  denom_out?: string;
  fee_amount?: string;
  usd_fee_amount?: string;
  fee_asset?: SkipFeeAsset;
  is_testnet?: boolean;
  ibc_transfer_to_axelar?: Transfer;
  bridge_id?: BridgeType;
  smart_relay?: boolean;
  from_chain?: string;
  to_chain?: string;
}

export interface BankSend {
  chain_id?: string;
  denom?: string;
}

export interface CCTPTransfer {
  from_chain_id?: string;
  to_chain_id?: string;
  burn_token?: string;
  denom_in?: string;
  denom_out?: string;
  bridge_id?: BridgeType;
  smart_relay?: boolean;
  smart_relay_fee_quote?: SmartRelayFeeQuote | null;
}

export interface HyperlaneTransfer {
  from_chain_id?: string;
  to_chain_id?: string;
  denom_in?: string;
  denom_out?: string;
  hyperlane_contract_address?: string;
  fee_amount?: string;
  usd_fee_amount?: string;
  fee_asset?: SkipFeeAsset;
  bridge_id?: BridgeType;
  smart_relay?: boolean;
}

export interface EvmSwap {
  input_token?: string;
  amount_in?: string;
  swap_calldata?: string;
  amount_out?: string;
  from_chain_id?: string;
  denom_in?: string;
  denom_out?: string;
  swap_venues?: SwapVenue[];
}

export interface OPInitTransfer {
  from_chain_id?: string;
  to_chain_id?: string;
  denom_in?: string;
  denom_out?: string;
  op_init_bridge_id?: any;
  bridge_id?: BridgeType;
  smart_relay?: boolean;
}

export interface GoFastFee {
  fee_asset: SkipFeeAsset;
  bps_fee?: string;
  bps_fee_amount?: string;
  bps_fee_usd?: string;
  source_chain_fee_amount?: string;
  source_chain_fee_usd?: string;
  destination_chain_fee_amount?: string;
  destination_chain_fee_usd?: string;
}

export interface GoFastTransfer {
  from_chain_id?: string;
  to_chain_id?: string;
  fee?: GoFastFee;
  bridge_id?: BridgeType;
  denom_in?: string;
  denom_out?: string;
  source_domain?: string;
  destination_domain?: string;
}

export interface StargateTransfer {
  from_chain_id?: string;
  to_chain_id?: string;
  denom_in?: string;
  denom_out?: string;
  pool_address?: string;
  destination_endpoint_id?: number;
  oft_fee_asset?: SkipFeeAsset;
  oft_fee_amount?: string;
  oft_fee_amount_usd?: string;
  messaging_fee_asset?: SkipFeeAsset;
  messaging_fee_amount?: string;
  messaging_fee_amount_usd?: string;
  bridge_id?: BridgeType;
}

export interface LayerZeroTransfer {
  from_chain_id: string;
  to_chain_id: string;
  denom_in: string;
  denom_out: string;
  source_oft_contract_address: string;
  destination_endpoint_id: number;
  messaging_fee_asset: SkipFeeAsset;
  messaging_fee_amount: string;
  messaging_fee_amount_usd: string;
  bridge_id: BridgeType;
}

export interface EurekaTransfer {
  destination_port?: string;
  source_client?: string;
  from_chain_id?: string;
  to_chain_id?: string;
  pfm_enabled?: boolean;
  supports_memo?: boolean;
  denom_in?: string;
  denom_out?: string;
  entry_contract_address?: string;
  callback_adapter_contract_address?: string | null;
  bridge_id?: BridgeType;
  smart_relay?: boolean;
  smart_relay_fee_quote?: SmartRelayFeeQuote | null;
  to_chain_callback_contract_address?: string | null;
  to_chain_entry_contract_address?: string | null;
}

export type SkipOperation = (
  | { transfer: Transfer }
  | { swap: Swap }
  | { axelar_transfer: AxelarTransfer }
  | { bank_send: BankSend }
  | { cctp_transfer: CCTPTransfer }
  | { hyperlane_transfer: HyperlaneTransfer }
  | { evm_swap: EvmSwap }
  | { op_init_transfer: OPInitTransfer }
  | { go_fast_transfer: GoFastTransfer }
  | { stargate_transfer: StargateTransfer }
  | { layer_zero_transfer: LayerZeroTransfer }
  | { eureka_transfer: EurekaTransfer }
) & {
  tx_index: number;
  amount_in: string;
  amount_out: string;
};
