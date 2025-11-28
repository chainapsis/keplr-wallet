import { BaseAccount, EthermintChainIdHelper } from "@keplr-wallet/cosmos";
import { Any } from "@keplr-wallet/proto-types/google/protobuf/any";
import {
  ChainInfo,
  Msg,
  AminoSignResponse,
  StdSignDoc,
  Coin,
  StdFee,
  FeeCurrency,
} from "@keplr-wallet/types";
import { Buffer } from "buffer/";
import { escapeHTML, sortObjectByKey } from "@keplr-wallet/common";
import { Mutable } from "utility-types";
import {
  AuthInfo,
  Fee,
  SignerInfo,
  TxBody,
  TxRaw,
} from "@keplr-wallet/proto-types/cosmos/tx/v1beta1/tx";
import { ExtensionOptionsWeb3Tx } from "@keplr-wallet/proto-types/ethermint/types/v1/web3";
import { PubKey } from "@keplr-wallet/proto-types/cosmos/crypto/secp256k1/keys";
import { SignMode } from "@keplr-wallet/proto-types/cosmos/tx/signing/v1beta1/signing";
import { simpleFetch } from "@keplr-wallet/simple-fetch";
import { Dec } from "@keplr-wallet/unit";
import { ExecutionFeeType } from "../types";

// NOTE: duplicated with packages/stores/src/account/utils.ts
export const getEip712TypedDataBasedOnChainInfo = (
  chainInfo: ChainInfo,
  msgs: {
    aminoMsgs?: Msg[];
    protoMsgs: Any[];
    rlpTypes?: Record<string, Array<{ name: string; type: string }>>;
  }
): {
  types: Record<string, { name: string; type: string }[] | undefined>;
  domain: Record<string, any>;
  primaryType: string;
} => {
  const chainId = chainInfo.chainId;
  const chainIsInjective = chainId.startsWith("injective");
  const signPlainJSON =
    chainInfo.features &&
    chainInfo.features.includes("evm-ledger-sign-plain-json");

  const types = {
    types: {
      EIP712Domain: [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
        { name: "chainId", type: "uint256" },
        // XXX: Maybe, non-standard format?
        { name: "verifyingContract", type: "string" },
        // XXX: Maybe, non-standard format?
        { name: "salt", type: "string" },
      ],
      Tx: [
        { name: "account_number", type: "string" },
        { name: "chain_id", type: "string" },
        { name: "fee", type: "Fee" },
        { name: "memo", type: "string" },
        { name: "msgs", type: "Msg[]" },
        { name: "sequence", type: "string" },
      ],
      Fee: [
        ...(signPlainJSON ? [] : [{ name: "feePayer", type: "string" }]),
        { name: "amount", type: "Coin[]" },
        { name: "gas", type: "string" },
      ],
      Coin: [
        { name: "denom", type: "string" },
        { name: "amount", type: "string" },
      ],
      Msg: [
        { name: "type", type: "string" },
        { name: "value", type: "MsgValue" },
      ],
      ...msgs.rlpTypes,
    },
    domain: {
      name: "Cosmos Web3",
      version: "1.0.0",
      // signPlainJSON일때 밑의 값은 사실 사용되지 않으므로 대강 처리
      chainId: signPlainJSON
        ? 9999
        : EthermintChainIdHelper.parse(chainId).ethChainId.toString(),
      verifyingContract: "cosmos",
      salt: "0",
    },
    primaryType: "Tx",
  };

  // Injective doesn't need feePayer to be included but requires
  // timeout_height in the types
  if (chainIsInjective) {
    types.types.Tx = [
      ...types.types.Tx,
      { name: "timeout_height", type: "string" },
    ];
    types.domain.name = "Injective Web3";
    types.domain.chainId =
      "0x" + EthermintChainIdHelper.parse(chainId).ethChainId.toString(16);
    types.types.Fee = [
      { name: "amount", type: "Coin[]" },
      { name: "gas", type: "string" },
    ];

    return types;
  }

  // Return default types for Evmos
  return types;
};

/**
 * Build a signed transaction from an AminoSignResponse
 */
export function buildSignedTxFromAminoSignResponse(params: {
  protoMsgs: Any[];
  signResponse: AminoSignResponse;
  chainInfo: ChainInfo;
  eip712Signing: boolean;
  useEthereumSign: boolean;
}): {
  tx: Uint8Array;
  signDoc: StdSignDoc;
} {
  const { protoMsgs, signResponse, chainInfo, eip712Signing, useEthereumSign } =
    params;

  const chainIsInjective = chainInfo.chainId.startsWith("injective");
  const chainIsStratos = chainInfo.chainId.startsWith("stratos");
  const ethSignPlainJson: boolean =
    chainInfo.features?.includes("evm-ledger-sign-plain-json") === true;

  return {
    tx: TxRaw.encode({
      bodyBytes: TxBody.encode(
        TxBody.fromPartial({
          messages: protoMsgs,
          timeoutHeight: signResponse.signed.timeout_height,
          memo: signResponse.signed.memo,
          extensionOptions:
            eip712Signing && !ethSignPlainJson
              ? [
                  {
                    typeUrl: (() => {
                      if (
                        chainInfo.features?.includes(
                          "/cosmos.evm.types.v1.ExtensionOptionsWeb3Tx"
                        )
                      ) {
                        return "/cosmos.evm.types.v1.ExtensionOptionsWeb3Tx";
                      }

                      if (chainIsInjective) {
                        return "/injective.types.v1beta1.ExtensionOptionsWeb3Tx";
                      }

                      return "/ethermint.types.v1.ExtensionOptionsWeb3Tx";
                    })(),
                    value: ExtensionOptionsWeb3Tx.encode(
                      ExtensionOptionsWeb3Tx.fromPartial({
                        typedDataChainId: EthermintChainIdHelper.parse(
                          chainInfo.chainId
                        ).ethChainId.toString(),
                        feePayer: !chainIsInjective
                          ? signResponse.signed.fee.feePayer
                          : undefined,
                        feePayerSig: !chainIsInjective
                          ? Buffer.from(
                              signResponse.signature.signature,
                              "base64"
                            )
                          : undefined,
                      })
                    ).finish(),
                  },
                ]
              : undefined,
        })
      ).finish(),
      authInfoBytes: AuthInfo.encode({
        signerInfos: [
          {
            publicKey: {
              typeUrl: (() => {
                if (!useEthereumSign) {
                  return "/cosmos.crypto.secp256k1.PubKey";
                }

                if (chainIsInjective) {
                  return "/injective.crypto.v1beta1.ethsecp256k1.PubKey";
                }

                if (chainIsStratos) {
                  return "/stratos.crypto.v1.ethsecp256k1.PubKey";
                }

                if (chainInfo.features?.includes("eth-secp256k1-cosmos")) {
                  return "/cosmos.evm.crypto.v1.ethsecp256k1.PubKey";
                }

                if (chainInfo.features?.includes("eth-secp256k1-initia")) {
                  return "/initia.crypto.v1beta1.ethsecp256k1.PubKey";
                }

                return "/ethermint.crypto.v1.ethsecp256k1.PubKey";
              })(),
              value: PubKey.encode({
                key: Buffer.from(
                  signResponse.signature.pub_key.value,
                  "base64"
                ),
              }).finish(),
            },
            modeInfo: {
              single: {
                mode:
                  eip712Signing && ethSignPlainJson
                    ? SignMode.SIGN_MODE_EIP_191
                    : SignMode.SIGN_MODE_LEGACY_AMINO_JSON,
              },
              multi: undefined,
            },
            sequence: signResponse.signed.sequence,
          },
        ],
        fee: Fee.fromPartial({
          amount: signResponse.signed.fee.amount as Coin[],
          gasLimit: signResponse.signed.fee.gas,
          payer:
            eip712Signing && !chainIsInjective && !ethSignPlainJson
              ? // Fee delegation feature not yet supported. But, for eip712 ethermint signing, we must set fee payer.
                signResponse.signed.fee.feePayer
              : undefined,
        }),
      }).finish(),
      signatures:
        // Injective needs the signature in the signatures list even if eip712
        !eip712Signing || chainIsInjective || ethSignPlainJson
          ? [Buffer.from(signResponse.signature.signature, "base64")]
          : [new Uint8Array(0)],
    }).finish(),
    signDoc: signResponse.signed,
  };
}

/**
 * Prepare sign document for Cosmos transaction signing
 */
export function prepareSignDocForAminoSigning(params: {
  chainInfo: ChainInfo;
  accountNumber: string;
  sequence: string;
  aminoMsgs: Msg[];
  fee: StdFee;
  memo: string;
  eip712Signing: boolean;
  signer: string;
}): StdSignDoc {
  const {
    chainInfo,
    accountNumber,
    sequence,
    aminoMsgs,
    memo,
    eip712Signing,
    signer,
    fee,
  } = params;

  const chainIsInjective = chainInfo.chainId.startsWith("injective");
  const ethSignPlainJson: boolean =
    chainInfo.features?.includes("evm-ledger-sign-plain-json") === true;

  const signDocRaw: StdSignDoc = {
    chain_id: chainInfo.chainId,
    account_number: accountNumber,
    sequence,
    fee,
    msgs: aminoMsgs,
    memo: escapeHTML(memo ?? ""),
  };

  if (eip712Signing) {
    if (chainIsInjective) {
      // Due to injective's problem, it should exist if injective with ledger.
      // There is currently no effective way to handle this in keplr. Just set a very large number.
      (signDocRaw as Mutable<StdSignDoc>).timeout_height =
        Number.MAX_SAFE_INTEGER.toString();
    } else {
      // If not injective (evmos), they require fee payer.
      // XXX: "feePayer" should be "payer". But, it maybe from ethermint team's mistake.
      //      That means this part is not standard.
      (signDocRaw as Mutable<StdSignDoc>).fee = {
        ...signDocRaw.fee,
        ...(() => {
          if (ethSignPlainJson) {
            return {};
          }
          return {
            feePayer: signer,
          };
        })(),
      };
    }
  }

  return sortObjectByKey(signDocRaw);
}

export async function simulateCosmosTx(
  signer: string,
  chainInfo: ChainInfo,
  msgs: Any[],
  fee: Omit<StdFee, "gas">,
  memo: string = ""
): Promise<{
  gasUsed: number;
}> {
  const account = await BaseAccount.fetchFromRest(chainInfo.rest, signer, true);

  const unsignedTx = TxRaw.encode({
    bodyBytes: TxBody.encode(
      TxBody.fromPartial({
        messages: msgs,
        memo: memo,
      })
    ).finish(),
    authInfoBytes: AuthInfo.encode({
      signerInfos: [
        SignerInfo.fromPartial({
          // Pub key is ignored.
          // It is fine to ignore the pub key when simulating tx.
          // However, the estimated gas would be slightly smaller because tx size doesn't include pub key.
          modeInfo: {
            single: {
              mode: SignMode.SIGN_MODE_LEGACY_AMINO_JSON,
            },
            multi: undefined,
          },
          sequence: account.getSequence().toString(),
        }),
      ],
      fee: Fee.fromPartial({
        amount: fee.amount.map((amount) => {
          return { amount: amount.amount, denom: amount.denom };
        }),
      }),
    }).finish(),
    // Because of the validation of tx itself, the signature must exist.
    // However, since they do not actually verify the signature, it is okay to use any value.
    signatures: [new Uint8Array(64)],
  }).finish();

  const result = await simpleFetch<{
    gas_info: {
      gas_used: string;
    };
  }>(chainInfo.rest, "/cosmos/tx/v1beta1/simulate", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      tx_bytes: Buffer.from(unsignedTx).toString("base64"),
    }),
  });

  const gasUsed = parseInt(result.data.gas_info.gas_used);
  if (Number.isNaN(gasUsed)) {
    throw new Error(`Invalid integer gas: ${result.data.gas_info.gas_used}`);
  }

  return {
    gasUsed: gasUsed,
  };
}

export async function fetchCosmosSpendableBalances(
  baseURL: string,
  bech32Address: string,
  limit = 1000
): Promise<{ balances: Coin[] }> {
  const { data } = await simpleFetch<{ balances: Coin[] }>(
    baseURL,
    `/cosmos/bank/v1beta1/spendable_balances/${bech32Address}?pagination.limit=${limit}`
  );
  return data;
}

// Default gas price steps
const DefaultGasPriceStep = {
  low: 0.01,
  average: 0.025,
  high: 0.04,
};

// Default multiplication factors for fee market
const DefaultMultiplication = {
  low: 1.1,
  average: 1.2,
  high: 1.3,
};

export async function getCosmosGasPrice(
  chainInfo: ChainInfo,
  feeType: ExecutionFeeType = "average",
  feeCurrency?: FeeCurrency
): Promise<{
  gasPrice: Dec;
  source:
    | "osmosis-base-fee"
    | "osmosis-txfees"
    | "feemarket"
    | "initia-dynamic"
    | "eip1559"
    | "default";
}> {
  // Use first currency from chainInfo if feeCurrency is not provided
  const currency = feeCurrency || chainInfo.feeCurrencies[0];
  if (!currency) {
    throw new Error("No fee currency is provided and not found for chain");
  }

  // 1. Try Osmosis base fee (for Osmosis with base-fee-beta feature)
  if (chainInfo.features?.includes("osmosis-base-fee-beta")) {
    try {
      const osmosisResult = await getOsmosisBaseFeeCurrency(
        chainInfo,
        currency,
        feeType
      );
      if (!osmosisResult) {
        throw new Error("Failed to fetch Osmosis base fee currency");
      }

      if (chainInfo.features?.includes("osmosis-txfees")) {
        const osmosisTxFeesResult = await getOsmosisTxFeesGasPrice(
          chainInfo,
          currency,
          feeType
        );
        if (osmosisTxFeesResult) {
          return {
            gasPrice: osmosisTxFeesResult,
            source: "osmosis-txfees",
          };
        }
      }

      // if osmosis-txfees is not enabled, use the base fee currency
      return {
        gasPrice: new Dec(osmosisResult.gasPriceStep![feeType]),
        source: "osmosis-base-fee",
      };
    } catch (error) {
      console.error("Failed to fetch Osmosis base fee:", error);
    }
  }

  // 2. Try Initia Dynamic Fee
  if (chainInfo.features?.includes("initia-dynamicfee")) {
    try {
      const initiaResult = await getInitiaDynamicFeeGasPrice(
        chainInfo,
        feeType
      );
      if (initiaResult) {
        return { gasPrice: initiaResult, source: "initia-dynamic" };
      }
    } catch (error) {
      console.error("Failed to fetch Initia dynamic fee:", error);
    }
  }

  // 3. Try Fee Market (for chains with feemarket feature)
  if (chainInfo.features?.includes("feemarket")) {
    try {
      const feeMarketResult = await getFeeMarketGasPrice(
        chainInfo,
        currency,
        feeType
      );
      if (feeMarketResult) {
        return { gasPrice: feeMarketResult, source: "feemarket" };
      }
    } catch (error) {
      console.error("Failed to fetch fee market gas price:", error);
    }
  }

  // 5. Try EIP-1559 (for EVM chains)
  if (chainInfo.evm) {
    try {
      const eip1559Result = await getEIP1559GasPrice(chainInfo, feeType);
      if (eip1559Result) {
        return { gasPrice: eip1559Result, source: "eip1559" };
      }
    } catch (error) {
      console.error("Failed to fetch EIP-1559 gas price:", error);
    }
  }

  // 6. Fallback to default gas price step
  const gasPrice = getDefaultGasPrice(currency, feeType);
  return { gasPrice, source: "default" };
}

async function getOsmosisBaseFeeCurrency(
  chainInfo: ChainInfo,
  feeCurrency: FeeCurrency,
  feeType: ExecutionFeeType
): Promise<FeeCurrency | null> {
  // Fetch base fee from Osmosis
  const baseDenom = "uosmo";

  if (feeCurrency.coinMinimalDenom !== baseDenom) {
    return null;
  }

  // Fetch multiplication factors from remote config
  const remoteConfig = await simpleFetch<{
    low?: number;
    average?: number;
    high?: number;
  }>(
    "https://gjsttg7mkgtqhjpt3mv5aeuszi0zblbb.lambda-url.us-west-2.on.aws/osmosis/osmosis-base-fee-beta.json"
  ).catch(() => ({ data: {} as Record<ExecutionFeeType, number> }));

  const { data: baseFeeResponse } = await simpleFetch<{ base_fee: string }>(
    chainInfo.rest,
    "/osmosis/txfees/v1beta1/cur_eip_base_fee"
  );

  const multiplier =
    remoteConfig.data[feeType] || DefaultMultiplication[feeType];
  return {
    ...feeCurrency,
    gasPriceStep: {
      low: parseFloat(baseFeeResponse.base_fee) * multiplier,
      average: parseFloat(baseFeeResponse.base_fee) * multiplier,
      high: parseFloat(baseFeeResponse.base_fee) * multiplier,
    },
  };
}

async function getOsmosisTxFeesGasPrice(
  chainInfo: ChainInfo,
  feeCurrency: FeeCurrency,
  feeType: ExecutionFeeType
): Promise<Dec | null> {
  // Check if it's a fee token
  const { data: feeTokensResponse } = await simpleFetch<{
    fee_tokens: Array<{ denom: string; poolID: string }>;
  }>(chainInfo.rest, "/osmosis/txfees/v1beta1/fee_tokens");

  const isFeeToken = feeTokensResponse.fee_tokens.some(
    (token) => token.denom === feeCurrency.coinMinimalDenom
  );

  if (!isFeeToken) {
    return null;
  }

  // Get spot price
  const { data: spotPriceResponse } = await simpleFetch<{ spot_price: string }>(
    chainInfo.rest,
    `/osmosis/txfees/v1beta1/spot_price_by_denom?denom=${feeCurrency.coinMinimalDenom}`
  );

  const spotPrice = new Dec(spotPriceResponse.spot_price);
  if (spotPrice.lte(new Dec(0))) {
    return null;
  }

  const baseGasPrice = getDefaultGasPrice(feeCurrency, feeType);
  // Add 1% slippage protection
  return baseGasPrice.quo(spotPrice).mul(new Dec(1.01));
}

async function getFeeMarketGasPrice(
  chainInfo: ChainInfo,
  feeCurrency: FeeCurrency,
  feeType: ExecutionFeeType
): Promise<Dec | null> {
  try {
    const gasPricesResponse = await simpleFetch<{
      prices: Array<{ denom: string; amount: string }>;
    }>(chainInfo.rest, "/feemarket/v1/gas_prices");

    const gasPrice = gasPricesResponse.data.prices.find(
      (price) => price.denom === feeCurrency.coinMinimalDenom
    );

    if (!gasPrice) {
      return null;
    }

    // Fetch multiplication config
    const multiplicationConfig = await simpleFetch<{
      [chainId: string]: {
        low: number;
        average: number;
        high: number;
      };
    }>(
      "https://gjsttg7mkgtqhjpt3mv5aeuszi0zblbb.lambda-url.us-west-2.on.aws",
      "/feemarket/info.json"
    ).catch(() => ({
      data: {} as Record<
        string,
        { low: number; average: number; high: number }
      >,
    }));

    let multiplication = DefaultMultiplication;

    // Apply default multiplication
    const defaultConfig = multiplicationConfig.data["__default__"];
    if (defaultConfig) {
      multiplication = {
        low: defaultConfig.low || multiplication.low,
        average: defaultConfig.average || multiplication.average,
        high: defaultConfig.high || multiplication.high,
      };
    }

    // Apply chain-specific multiplication
    const chainConfig = multiplicationConfig.data[chainInfo.chainId];
    if (chainConfig) {
      multiplication = {
        low: chainConfig.low || multiplication.low,
        average: chainConfig.average || multiplication.average,
        high: chainConfig.high || multiplication.high,
      };
    }

    const baseGasPrice = new Dec(gasPrice.amount);
    return baseGasPrice.mul(new Dec(multiplication[feeType]));
  } catch (error) {
    return null;
  }
}

async function getInitiaDynamicFeeGasPrice(
  chainInfo: ChainInfo,
  feeType: ExecutionFeeType
): Promise<Dec | null> {
  try {
    const dynamicFeeResponse = await simpleFetch<{
      params: {
        base_gas_price: string;
      };
    }>(chainInfo.rest, "/initia/dynamicfee/v1/params");

    if (!dynamicFeeResponse.data.params.base_gas_price) {
      return null;
    }

    const baseGasPrice = new Dec(dynamicFeeResponse.data.params.base_gas_price);

    // Fetch multiplication config
    const multiplicationConfig = await simpleFetch<{
      [str: string]: {
        low: number;
        average: number;
        high: number;
      };
    }>(
      "https://gjsttg7mkgtqhjpt3mv5aeuszi0zblbb.lambda-url.us-west-2.on.aws",
      "/feemarket/info.json"
    ).catch(() => ({
      data: {} as Record<
        string,
        { low: number; average: number; high: number }
      >,
    }));

    let multiplication = DefaultMultiplication;

    // Apply default multiplication
    const defaultConfig = multiplicationConfig.data["__default__"];
    if (defaultConfig) {
      multiplication = {
        low: defaultConfig.low || multiplication.low,
        average: defaultConfig.average || multiplication.average,
        high: defaultConfig.high || multiplication.high,
      };
    }

    // Apply chain-specific multiplication
    const chainConfig = multiplicationConfig.data[chainInfo.chainId];
    if (chainConfig) {
      multiplication = {
        low: chainConfig.low || multiplication.low,
        average: chainConfig.average || multiplication.average,
        high: chainConfig.high || multiplication.high,
      };
    }

    return baseGasPrice.mul(new Dec(multiplication[feeType]));
  } catch (error) {
    return null;
  }
}

// TODO: enhance the logic if required...
async function getEIP1559GasPrice(
  chainInfo: ChainInfo,
  feeType: ExecutionFeeType
): Promise<Dec | null> {
  try {
    // Get latest block for base fee
    const blockResponse = await simpleFetch<{
      result: {
        baseFeePerGas: string;
      };
    }>(chainInfo.rpc, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_getBlockByNumber",
        params: ["latest", false],
        id: 1,
      }),
    });

    const baseFeePerGasHex = blockResponse.data.result.baseFeePerGas;
    if (!baseFeePerGasHex) {
      return null;
    }

    const baseFeePerGas = new Dec(parseInt(baseFeePerGasHex, 16));

    // Calculate priority fee (simplified version)
    const priorityFeeMultipliers: Record<ExecutionFeeType, number> = {
      low: 1.1,
      average: 1.25,
      high: 1.5,
    };

    const maxPriorityFeePerGas = baseFeePerGas.mul(
      new Dec(priorityFeeMultipliers[feeType] - 1)
    );

    return baseFeePerGas.add(maxPriorityFeePerGas);
  } catch (error) {
    return null;
  }
}

export function getDefaultGasPrice(
  feeCurrency: FeeCurrency,
  feeType: ExecutionFeeType
): Dec {
  const gasPriceStep = feeCurrency.gasPriceStep || DefaultGasPriceStep;
  return new Dec(gasPriceStep[feeType]);
}

export function calculateCosmosStdFee(
  feeCurrency: FeeCurrency,
  gasUsed: number,
  gasPrice: Dec,
  features: string[] | undefined
): StdFee {
  const gasAdjustment = features?.includes("feemarket") ? 1.6 : 1.4;

  const adjustedGas = Math.floor(gasUsed * gasAdjustment);

  const feeAmount = gasPrice.mul(new Dec(adjustedGas)).roundUp();

  return {
    amount: [
      {
        denom: feeCurrency.coinMinimalDenom,
        amount: feeAmount.toString(),
      },
    ],
    gas: adjustedGas.toString(),
  };
}
