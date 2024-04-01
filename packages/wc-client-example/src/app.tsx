import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "./stores";
import { EthSignType } from "@keplr-wallet/types";

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
                .stakable?.balance.trim(true)
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
            chainInfo.currencies[0],
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
            chainInfo.currencies[0],
            counterpartyAccount.bech32Address
          );
        }}
      >
        Test IBC 2
      </button>

      <button
        onClick={() => {
          const chainInfo = chainStore.chainInfos[0];
          const account = accountStore.getAccount(chainInfo.chainId);

          const data =
            "NDk2NDAxNmVkMWM4MDI1NjAxZWUzMDA5NjU2MGI3YzI4NTRmMGFjNjdiODA4ZjNm";

          account.getKeplr().then((keplr) => {
            keplr?.signArbitrary(
              chainInfo.chainId,
              account.bech32Address,
              data
            );
          });
        }}
      >
        Sign Abitrary
      </button>
      <button
        onClick={() => {
          const evmosChainInfo = chainStore.getChain("evmos_9001-2");
          const account = accountStore.getAccount(evmosChainInfo.chainId);

          const ethereumTx = {
            type: 2,
            chainId: 9001,
            nonce: 95,
            gasLimit: "0xae3f",
            maxFeePerGas: "0x5efeb1f00",
            maxPriorityFeePerGas: "0x59682f00",
            to: "0xD4949664cD82660AaE99bEdc034a0deA8A0bd517",
            value: "0x0",
            data: "0xa9059cbb0000000000000000000000007f7ec812297f74c80fc8bcaf11ac881dc88eb216000000000000000000000000000000000000000000000000002386f26fc10000",
          };

          account.getKeplr().then((keplr) => {
            keplr
              ?.signEthereum(
                evmosChainInfo.chainId,
                account.ethereumHexAddress,
                JSON.stringify(ethereumTx),
                EthSignType.TRANSACTION
              )
              .then((signature) => {
                console.log("signature", signature);
              });
          });
        }}
      >
        Sign Ethereum
      </button>
    </div>
  );
});
