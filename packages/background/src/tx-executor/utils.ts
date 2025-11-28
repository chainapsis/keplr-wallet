import { BaseAccount, EthermintChainIdHelper } from "@keplr-wallet/cosmos";
import { Any } from "@keplr-wallet/proto-types/google/protobuf/any";
import {
  ChainInfo,
  Msg,
  AminoSignResponse,
  StdSignDoc,
  Coin,
  StdFee,
  EVMInfo,
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
import { UnsignedTransaction } from "@ethersproject/transactions";
import { Dec } from "@keplr-wallet/unit";

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

export async function fillUnsignedEVMTx(
  origin: string,
  evmInfo: EVMInfo,
  signer: string,
  tx: UnsignedTransaction
): Promise<UnsignedTransaction> {
  const getTransactionCountRequest = {
    jsonrpc: "2.0",
    method: "eth_getTransactionCount",
    params: [signer, "pending"],
    id: 1,
  };

  const getBlockRequest = {
    jsonrpc: "2.0",
    method: "eth_getBlockByNumber",
    params: ["latest", false],
    id: 2,
  };

  const getFeeHistoryRequest = {
    jsonrpc: "2.0",
    method: "eth_feeHistory",
    params: [20, "latest", [50]],
    id: 3,
  };

  const estimateGasRequest = {
    jsonrpc: "2.0",
    method: "eth_estimateGas",
    params: [
      {
        from: signer,
        to: tx.to,
        value: tx.value,
        data: tx.data,
      },
    ],
    id: 4,
  };

  const getMaxPriorityFeePerGasRequest = {
    jsonrpc: "2.0",
    method: "eth_maxPriorityFeePerGas",
    params: [],
    id: 5,
  };

  // rpc request in batch (as 2.0 jsonrpc supports batch requests)
  const batchRequest = [
    getTransactionCountRequest,
    getBlockRequest,
    getFeeHistoryRequest,
    estimateGasRequest,
    getMaxPriorityFeePerGasRequest,
  ];

  const { data: rpcResponses } = await simpleFetch<
    Array<{
      jsonrpc: "2.0";
      id: number;
      result?: unknown;
      error?: { code: number; message: string; data?: unknown };
    }>
  >(evmInfo.rpc, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "request-source": origin,
    },
    body: JSON.stringify(batchRequest),
  });

  if (
    !Array.isArray(rpcResponses) ||
    rpcResponses.length !== batchRequest.length
  ) {
    throw new Error("Invalid batch response format");
  }

  const getResult = <T = any>(id: number): T => {
    const res = rpcResponses.find((r) => r.id === id);
    if (!res) {
      throw new Error(`No response for id=${id}`);
    }
    if (res.error) {
      throw new Error(
        `RPC error (id=${id}): ${res.error.code} ${res.error.message}`
      );
    }
    return res.result as T;
  };

  // find responses by id
  const nonceHex = getResult<string>(1);
  const latestBlock = getResult<{ baseFeePerGas?: string }>(2);
  const feeHistory = getResult<{
    baseFeePerGas?: string[];
    gasUsedRatio: number[];
    oldestBlock: string;
    reward?: string[][];
  }>(3);
  const gasLimitHex = getResult<string>(4);
  const networkMaxPriorityFeePerGasHex = getResult<string>(5);

  let maxPriorityFeePerGasDec: Dec | undefined;
  if (feeHistory.reward && feeHistory.reward.length > 0) {
    // get 50th percentile rewards (index 0 since we requested [50] percentile)
    const percentileIndex = 0;
    const rewards = feeHistory.reward
      .map((block) => block[percentileIndex])
      .filter((v) => v != null)
      .map((v) => BigInt(v));

    if (rewards.length > 0) {
      const sum = rewards.reduce((acc, x) => acc + x, BigInt(0));
      const mean = sum / BigInt(rewards.length);

      const sortedRewards = [...rewards].sort((a, b) =>
        a < b ? -1 : a > b ? 1 : 0
      );
      const median = sortedRewards[Math.floor(sortedRewards.length / 2)];

      // use 1 Gwei deviation threshold to decide between mean and median
      const deviationThreshold = BigInt(1 * 10 ** 9); // 1 Gwei
      const deviation = mean > median ? mean - median : median - mean;
      const pick =
        deviation > deviationThreshold ? (mean > median ? mean : median) : mean;

      maxPriorityFeePerGasDec = new Dec(pick);
    }
  }

  if (networkMaxPriorityFeePerGasHex) {
    const networkMaxPriorityFeePerGasDec = new Dec(
      BigInt(networkMaxPriorityFeePerGasHex)
    );

    if (
      !maxPriorityFeePerGasDec ||
      (maxPriorityFeePerGasDec &&
        networkMaxPriorityFeePerGasDec.gt(maxPriorityFeePerGasDec))
    ) {
      maxPriorityFeePerGasDec = networkMaxPriorityFeePerGasDec;
    }
  }

  if (!maxPriorityFeePerGasDec) {
    throw new Error(
      "Failed to calculate maxPriorityFeePerGas to fill unsigned transaction"
    );
  }

  if (!latestBlock.baseFeePerGas) {
    throw new Error("Failed to get baseFeePerGas to fill unsigned transaction");
  }

  const multiplier = new Dec(1.25);

  // Calculate maxFeePerGas = baseFeePerGas + maxPriorityFeePerGas
  const baseFeePerGasDec = new Dec(BigInt(latestBlock.baseFeePerGas));
  const maxFeePerGasDec = baseFeePerGasDec
    .add(maxPriorityFeePerGasDec)
    .mul(multiplier);
  const maxFeePerGasHex = `0x${maxFeePerGasDec
    .truncate()
    .toBigNumber()
    .toString(16)}`;

  maxPriorityFeePerGasDec = maxPriorityFeePerGasDec.mul(multiplier);
  const maxPriorityFeePerGasHex = `0x${maxPriorityFeePerGasDec
    .truncate()
    .toBigNumber()
    .toString(16)}`;

  const newUnsignedTx: UnsignedTransaction = {
    ...tx,
    nonce: parseInt(nonceHex, 16),
    maxFeePerGas: maxFeePerGasHex,
    maxPriorityFeePerGas: maxPriorityFeePerGasHex,
    gasLimit: gasLimitHex,
  };

  return newUnsignedTx;
}
