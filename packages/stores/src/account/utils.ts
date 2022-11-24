import { AminoSignResponse } from "@cosmjs/launchpad";
import { EthermintChainIdHelper } from "@keplr-wallet/cosmos";
import { ProtoMsgsOrWithAminoMsgs } from "./types";

export function txEventsWithPreOnFulfill(
  onTxEvents:
    | ((tx: any) => void)
    | {
        onBroadcasted?: (txHash: Uint8Array) => void;
        onFulfill?: (tx: any) => void;
      }
    | undefined,
  preOnTxEvents:
    | ((tx: any) => void)
    | {
        onBroadcasted?: (txHash: Uint8Array) => void;
        onFulfill?: (tx: any) => void;
      }
    | undefined
):
  | {
      onBroadcasted?: (txHash: Uint8Array) => void;
      onFulfill?: (tx: any) => void;
    }
  | undefined {
  const onBroadcasted = onTxEvents
    ? typeof onTxEvents === "function"
      ? undefined
      : onTxEvents.onBroadcasted
    : undefined;
  const onFulfill = onTxEvents
    ? typeof onTxEvents === "function"
      ? onTxEvents
      : onTxEvents.onFulfill
    : undefined;

  const onPreBroadcasted = preOnTxEvents
    ? typeof preOnTxEvents === "function"
      ? undefined
      : preOnTxEvents.onBroadcasted
    : undefined;
  const onPreFulfill = preOnTxEvents
    ? typeof preOnTxEvents === "function"
      ? preOnTxEvents
      : preOnTxEvents.onFulfill
    : undefined;

  if (!onBroadcasted && !onFulfill && !onPreBroadcasted && !onPreFulfill) {
    return undefined;
  }

  return {
    onBroadcasted:
      onBroadcasted || onPreBroadcasted
        ? (txHash: Uint8Array) => {
            if (onPreBroadcasted) {
              onPreBroadcasted(txHash);
            }

            if (onBroadcasted) {
              onBroadcasted(txHash);
            }
          }
        : undefined,
    onFulfill:
      onFulfill || onPreFulfill
        ? (tx: any) => {
            if (onPreFulfill) {
              onPreFulfill(tx);
            }

            if (onFulfill) {
              onFulfill(tx);
            }
          }
        : undefined,
  };
}

export const getEip712TypedDataBasedOnChainId = (
  chainId: string,
  msgs: ProtoMsgsOrWithAminoMsgs
) => {
  const chainIsInjective = chainId.startsWith("injective");
  const { ethChainId } = EthermintChainIdHelper.parse(chainId);

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
        { name: "feePayer", type: "string" },
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
      chainId: ethChainId.toString(),
      verifyingContract: "cosmos",
      salt: "0",
    },
    primaryType: "Tx",
  };

  /**
   * Injective doesn't need feePayer to be included but requires
   * timeout_height in the types
   */
  if (chainIsInjective) {
    types.types.Tx = [
      ...types.types.Tx,
      { name: "timeout_height", type: "string" },
    ];
    types.domain.name = "Injective Web3";
    types.domain.chainId = "0x" + ethChainId.toString(16);
    types.types.Fee = [
      { name: "amount", type: "Coin[]" },
      { name: "gas", type: "string" },
    ];

    return types;
  }

  // Return default types for Evmos
  return types;
};

export const getEip712SignDocBasedOnChainId = (
  signDoc: any,
  params: { chainId: string; bech32Address: string; timeoutHeight?: string }
) => {
  const { chainId, bech32Address, timeoutHeight } = params;
  const chainIsInjective = chainId.startsWith("injective");

  // XXX: "feePayer" should be "payer". But, it maybe from ethermint team's mistake.
  //      That means this part is not standard.
  const altSignDoc = {
    ...signDoc,
    fee: {
      ...signDoc.fee,
      feePayer: bech32Address,
    },
  };

  /**
   * Injective doesn't need feePayer to be included but requires
   * timeout_height in the sign doc
   */
  if (chainIsInjective && timeoutHeight) {
    delete altSignDoc.fee.feePayer;

    return {
      ...altSignDoc,
      timeout_height: timeoutHeight.toString(),
    };
  }

  return altSignDoc;
};

export const getEip712Web3ExtensionPartialBasedOnChainId = (params: {
  chainId: string;
  bech32Address: string;
  signature: string /* in base64 */;
}) => {
  const { chainId, bech32Address, signature } = params;
  const chainIsInjective = chainId.startsWith("injective");

  const partial = {
    typedDataChainId: EthermintChainIdHelper.parse(
      chainId
    ).ethChainId.toString(),
    feePayer: bech32Address,
    feePayerSig: Buffer.from(signature, "base64"),
  } as {
    typedDataChainId: string;
    feePayer?: string;
    feePayerSig?: Uint8Array;
  };

  /**
   * Injective doesn't need feePayer to be included
   * in the Web3Extension
   */
  if (chainIsInjective) {
    delete partial.feePayer;
    delete partial.feePayerSig;

    return partial;
  }

  return partial;
};

export const getEip712FeePayerPartialBasedOnChainId = (params: {
  chainId: string;
  eip712Signing: boolean;
  signResponse: AminoSignResponse;
}): {
  amount: {
    denom: string;
    amount: string;
  }[];
  gasLimit: string;
  feePayer?: string;
} => {
  const { chainId, eip712Signing, signResponse } = params;
  const chainIsInjective = chainId.startsWith("injective");
  const [amount] = signResponse.signed.fee.amount;

  const partial = {
    amount: [{ amount: amount.amount, denom: amount.denom }],
    gasLimit: signResponse.signed.fee.gas,
  } as {
    amount: {
      denom: string;
      amount: string;
    }[];
    gasLimit: string;
    feePayer?: string;
  };

  if (!eip712Signing) {
    return partial;
  }

  // Fee delegation feature not yet supported. But, for eip712 ethermint signing, we must set fee payer.
  partial.feePayer = (signResponse.signed as any).fee["feePayer"];

  /**
   * Injective doesn't need feePayer to be included
   * in the Fee
   */
  if (chainIsInjective) {
    delete partial.feePayer;

    return partial;
  }

  return partial;
};

export const getEip712SignaturesBasedOnChainId = (params: {
  chainId: string;
  eip712Signing: boolean;
  signResponse: AminoSignResponse;
}) => {
  const { chainId, eip712Signing, signResponse } = params;
  const chainIsInjective = chainId.startsWith("injective");

  if (!eip712Signing) {
    return [Buffer.from(signResponse.signature.signature, "base64")];
  }

  /**
   * Injective needs the signature in the signatures list
   */
  if (chainIsInjective) {
    return [Buffer.from(signResponse.signature.signature, "base64")];
  }

  return [new Uint8Array(0)];
};
