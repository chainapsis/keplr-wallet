import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "./stores";

const IBCChannel = "channel-141";
const CounterpartyIBCChannel = "channel-0";

export const App: FunctionComponent = observer(() => {
  const { chainStore, accountStore, queriesStore } = useStore();

  return (
    <div>
      <p>
        Name: {accountStore.getAccount(chainStore.chainInfos[0].chainId).name}
      </p>
      {chainStore.chainInfos.map((chainInfo) => {
        const account = accountStore.getAccount(chainInfo.chainId);
        const queries = queriesStore.get(chainInfo.chainId);

        return (
          <div key={chainInfo.chainId}>
            <h4>{account.bech32Address}</h4>
            <p>
              {queries.queryBalances
                .getQueryBech32Address(account.bech32Address)
                .stakable.balance.trim(true)
                .toString()}
            </p>
          </div>
        );
      })}
      <button
        onClick={() => {
          const chainInfo = chainStore.chainInfos[0];
          const account = accountStore.getAccount(chainInfo.chainId);
          const counterpartyAccount = accountStore.getAccount(
            chainStore.chainInfos[1].chainId
          );

          account.cosmos.sendIBCTransferMsg(
            {
              portId: "transfer",
              channelId: IBCChannel,
              counterpartyChainId: chainStore.chainInfos[1].chainId,
            },
            "1",
            chainInfo.stakeCurrency,
            counterpartyAccount.bech32Address
          );
        }}
      >
        Test IBC
      </button>
      <button
        onClick={() => {
          const chainInfo = chainStore.chainInfos[1];
          const account = accountStore.getAccount(chainInfo.chainId);
          const counterpartyAccount = accountStore.getAccount(
            chainStore.chainInfos[0].chainId
          );

          account.cosmos.sendIBCTransferMsg(
            {
              portId: "transfer",
              channelId: CounterpartyIBCChannel,
              counterpartyChainId: chainStore.chainInfos[0].chainId,
            },
            "1",
            chainInfo.stakeCurrency,
            counterpartyAccount.bech32Address
          );
        }}
      >
        Test IBC 2
      </button>
    </div>
  );
});
