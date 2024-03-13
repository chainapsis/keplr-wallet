import React from "react";
import { observer } from "mobx-react-lite";
import { FormattedMessage } from "react-intl";
import { useStore } from "../../../../../stores";
import { CoinPretty, Dec } from "@keplr-wallet/unit";
import { erc20ContractInterface } from "@keplr-wallet/stores-eth";
import { BigNumber } from "@ethersproject/bignumber";
import { IEthTxRenderer } from "../types";

export const EthSendTokenTx: IEthTxRenderer = {
  process(chainId, unsignedTx) {
    if (unsignedTx.data) {
      try {
        const dataDecodedValues = erc20ContractInterface.decodeFunctionData(
          "transfer",
          unsignedTx.data
        );
        const erc20ContractAddress = unsignedTx.to;
        const recipient = dataDecodedValues[0];
        const amount = dataDecodedValues[1];

        if (
          !erc20ContractAddress ||
          typeof erc20ContractAddress !== "string" ||
          !recipient ||
          typeof recipient !== "string" ||
          !amount ||
          amount instanceof BigNumber === false
        ) {
          return undefined;
        }

        return {
          content: (
            <EthSendTokenTxPretty
              chainId={chainId}
              recipient={recipient}
              amount={amount.toHexString()}
              erc20ContractAddress={erc20ContractAddress}
            />
          ),
        };
      } catch (e) {
        // Fallback to other renderers if unsingedTx.data can't be decoded with ERC20 transfer method.
        return undefined;
      }
    } else {
      const recipient = unsignedTx.to;
      const amount = unsignedTx.value;

      if (
        !recipient ||
        typeof recipient !== "string" ||
        !amount ||
        typeof amount !== "string"
      ) {
        return undefined;
      }

      return {
        content: (
          <EthSendTokenTxPretty
            chainId={chainId}
            recipient={recipient}
            amount={amount}
          />
        ),
      };
    }
  },
};

export const EthSendTokenTxPretty: React.FunctionComponent<{
  chainId: string;
  recipient: string;
  amount: string;
  erc20ContractAddress?: string;
}> = observer(({ chainId, recipient, amount, erc20ContractAddress }) => {
  const { chainStore, accountStore } = useStore();
  const chainInfo = chainStore.getChain(chainId);
  const sender = accountStore.getAccount(chainId).ethereumHexAddress;

  const currency = erc20ContractAddress
    ? chainInfo.forceFindCurrency(`erc20:${erc20ContractAddress}`)
    : chainInfo.currencies[0];
  const amountCoinPretty = new CoinPretty(currency, new Dec(Number(amount)));

  return (
    <React.Fragment>
      <FormattedMessage
        id="page.sign.ethereum.tx.send.paragraph"
        values={{
          fromAddress: sender.slice(0, 7) + "..." + sender.slice(-5),
          toAddress: recipient.slice(0, 7) + "..." + recipient.slice(-5),
          amount: amountCoinPretty.trim(true).toString(),
          b: (...chunks: any) => <b>{chunks}</b>,
        }}
      />
    </React.Fragment>
  );
});
