import React from "react";
import { observer } from "mobx-react-lite";
import { FormattedMessage } from "react-intl";
import { UnsignedTransaction } from "@ethersproject/transactions";
import { useStore } from "../../../../stores";
import { CoinPretty, Dec } from "@keplr-wallet/unit";
import { erc20ContractInterface } from "@keplr-wallet/stores-eth";

export const EthSendTxPretty: React.FunctionComponent<{
  chainId: string;
  unsignedTx: UnsignedTransaction;
}> = observer(({ chainId, unsignedTx }) => {
  const { chainStore, accountStore } = useStore();
  const chainInfo = chainStore.getChain(chainId);
  const fromAddress = accountStore.getAccount(chainId).ethereumHexAddress;
  const dataDecodedValues = unsignedTx.data
    ? erc20ContractInterface.decodeFunctionData("transfer", unsignedTx.data)
    : undefined;

  const toAddress = dataDecodedValues ? dataDecodedValues[0] : unsignedTx.to;
  const currency = dataDecodedValues
    ? chainInfo.currencies[1]
    : chainInfo.currencies[0];
  const amount = new CoinPretty(
    currency,
    new Dec(Number(dataDecodedValues ? dataDecodedValues[1] : unsignedTx.value))
  );

  return (
    <React.Fragment>
      <FormattedMessage
        id="page.sign.ethereum.tx.send.paragraph"
        values={{
          fromAddress: fromAddress.slice(0, 7) + "..." + fromAddress.slice(-5),
          toAddress: toAddress.slice(0, 7) + "..." + toAddress.slice(-5),
          amount: amount.trim(true).toString(),
          b: (...chunks: any) => <b>{chunks}</b>,
        }}
      />
    </React.Fragment>
  );
});
