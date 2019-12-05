import { TxBuilderConfig } from "@everett-protocol/cosmosjs/core/txBuilder";
import { TxBuilderConfigPrimitive } from "./types";
import { Coin } from "@everett-protocol/cosmosjs/common/coin";
import bigInteger from "big-integer";

export function feeToString(fee: Coin | Coin[]) {
  let feeStr = "";
  if (!Array.isArray(fee)) {
    feeStr = fee.toString();
  } else {
    const coinStrs: string[] = [];
    for (const coin of fee) {
      coinStrs.push(coin.toString());
    }
    feeStr = coinStrs.join(",");
  }
  return feeStr;
}

export function feeFromString(feeStr: string): Coin | Coin[] {
  let fee: Coin[] | Coin = [];
  const coinStrs = feeStr.split(",");
  if (coinStrs.length === 1) {
    fee = Coin.parse(coinStrs[0]);
  }
  if (Array.isArray(fee)) {
    for (const coinStr of coinStrs) {
      fee.push(Coin.parse(coinStr));
    }
  }
  return fee;
}

export function txBuilderConfigToPrimitive(
  config: TxBuilderConfig
): TxBuilderConfigPrimitive {
  return {
    accountNumber: config.accountNumber?.toString(),
    sequence: config.sequence?.toString(),
    gas: config.gas?.toString(),
    gasAdjustment: config.gasAdjustment,
    memo: config.memo,
    fee: feeToString(config.fee),
    gasPrice: config.gasPrice
  };
}

export function txBuilderConfigFromPrimitive(
  primitive: TxBuilderConfigPrimitive
): TxBuilderConfig {
  let accountNumber: bigInteger.BigNumber | undefined;
  if (primitive.accountNumber) {
    accountNumber = bigInteger(primitive.accountNumber);
  }

  let sequence: bigInteger.BigNumber | undefined;
  if (primitive.sequence) {
    sequence = bigInteger(primitive.sequence);
  }

  const gas: bigInteger.BigNumber = bigInteger(primitive.gas);

  return {
    accountNumber,
    sequence,
    gas,
    gasAdjustment: primitive.gasAdjustment,
    memo: primitive.memo,
    fee: feeFromString(primitive.fee),
    gasPrice: primitive.gasPrice
  };
}
