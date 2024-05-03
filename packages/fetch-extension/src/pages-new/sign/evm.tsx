/* eslint-disable react/display-name */

import { erc20MetadataInterface } from "@keplr-wallet/stores";
import { Currency } from "@keplr-wallet/types";
import { IntlShape } from "react-intl";
import React from "react";
import {
  renderMsgEvmExecuteContract,
  renderMsgSend,
  renderUnknownMessage,
} from "./messages";
import { UnsignedTransaction } from "@ethersproject/transactions";
import { BigNumber } from "@ethersproject/bignumber";
import { DenomHelper } from "@keplr-wallet/common";

export function renderEvmTxn(
  txnParams: UnsignedTransaction,
  nativeCurrency: Currency,
  currencies: Currency[],
  intl: IntlShape
): {
  icon: string | undefined;
  title: string;
  content: React.ReactElement;
} {
  try {
    if (
      txnParams.value &&
      BigNumber.from(txnParams.value).gt(0) &&
      !txnParams.data
    ) {
      return renderMsgSend(
        currencies,
        intl,
        [
          {
            amount: BigNumber.from(txnParams.value).toString(),
            denom: nativeCurrency.coinMinimalDenom,
          },
        ],
        txnParams.to ?? "",
        true
      );
    }

    if (txnParams.data) {
      const sendCurrency = currencies.find((c) => {
        const coin = new DenomHelper(c.coinMinimalDenom);
        return coin.type === "erc20" && coin.contractAddress === txnParams.to;
      });

      if (sendCurrency) {
        const erc20TransferParams = erc20MetadataInterface.parseTransaction({
          data: txnParams.data.toString(),
          value: txnParams.value,
        });

        if (erc20TransferParams.name === "transfer") {
          return renderMsgSend(
            currencies,
            intl,
            [
              {
                amount: erc20TransferParams.args["_value"].toString(),
                denom: sendCurrency.coinMinimalDenom,
              },
            ],
            erc20TransferParams.args["_to"],
            true
          );
        }
      }

      return renderMsgEvmExecuteContract(
        intl,
        txnParams.value && BigNumber.from(txnParams.value).gt(0)
          ? {
              amount: BigNumber.from(txnParams.value).toString(),
              denom: nativeCurrency.coinMinimalDenom,
            }
          : undefined,
        txnParams
      );
    }
  } catch (e) {
    console.log(e);
  }

  return renderUnknownMessage(txnParams);
}
