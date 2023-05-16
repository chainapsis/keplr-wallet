import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "./stores";
import { Buffer } from "buffer";

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
      <button
        onClick={() => {
          const chainInfo = chainStore.chainInfos[2];
          const account = accountStore.getAccount(chainInfo.chainId);

          account
            .getKeplr()
            .then((keplr) =>
              keplr?.enigmaEncrypt(
                chainInfo.chainId,
                "5b64d22c7774b11cbc3aac55168d11f624a51921679b005df7d59487d254c892",
                {}
              )
            )
            .then((encrypted) => {
              const nonce = Buffer.from(encrypted ?? [])
                .slice(0, 32)
                .toString("base64");
              const encoded = Buffer.from(encrypted ?? []).toString("base64");
              console.log(nonce);
              console.log(encoded);
            });
        }}
      >
        Test Encrypt
      </button>
      <button
        onClick={() => {
          const chainInfo = chainStore.chainInfos[2];
          const account = accountStore.getAccount(chainInfo.chainId);

          account
            .getKeplr()
            .then((keplr) => keplr?.getEnigmaPubKey(chainInfo.chainId))
            .then((pubKey) => {
              const encoded = Buffer.from(pubKey ?? []).toString("base64");
              console.log(`getEnigmaPubKey: ${encoded}`);
            });
        }}
      >
        Test getEnigmaPubKey
      </button>
      <button
        onClick={() => {
          const chainInfo = chainStore.chainInfos[2];
          const account = accountStore.getAccount(chainInfo.chainId);

          account
            .getKeplr()
            .then((keplr) =>
              keplr?.getEnigmaTxEncryptionKey(
                chainInfo.chainId,
                Uint8Array.from([])
              )
            )
            .then((result) => {
              const encoded = Buffer.from(result ?? []).toString("base64");
              console.log(`getEnigmaTxEncryptionKey: ${encoded}`);
            });
        }}
      >
        Test getEnigmaTxEncryptionKey
      </button>
      <button
        onClick={() => {
          const chainInfo = chainStore.chainInfos[2];
          const account = accountStore.getAccount(chainInfo.chainId);

          account
            .getKeplr()
            .then((keplr) =>
              keplr?.suggestToken(
                chainInfo.chainId,
                "secret1k6u0cy4feepm6pehnz804zmwakuwdapm69tuc4"
              )
            );
        }}
      >
        Test suggestToken
      </button>
      <button
        onClick={() => {
          const chainInfo = chainStore.chainInfos[2];
          const account = accountStore.getAccount(chainInfo.chainId);

          account
            .getKeplr()
            .then((keplr) =>
              keplr?.suggestToken(
                chainInfo.chainId,
                "secret1k6u0cy4feepm6pehnz804zmwakuwdapm69tuc4",
                "viewingkey"
              )
            )
            .then(() => {
              console.log(`suggestToken w/ viewing key complete`);
            });
        }}
      >
        Test suggestToken w/ viewingkey
      </button>
      <button
        onClick={() => {
          const chainInfo = chainStore.chainInfos[2];
          const account = accountStore.getAccount(chainInfo.chainId);

          account
            .getKeplr()
            .then((keplr) =>
              keplr?.getSecret20ViewingKey(
                chainInfo.chainId,
                "secret1k6u0cy4feepm6pehnz804zmwakuwdapm69tuc4"
              )
            )
            .then((result) => {
              console.log(`getSecret20ViewingKey: ${result}`);
            });
        }}
      >
        Test getSecret20ViewingKey
      </button>
      <button
        onClick={() => {
          const chainInfo = chainStore.chainInfos[2];
          const account = accountStore.getAccount(chainInfo.chainId);

          account
            .getKeplr()
            .then((keplr) =>
              keplr?.getSecret20ViewingKeyOrPermit(
                chainInfo.chainId,
                "secret1k6u0cy4feepm6pehnz804zmwakuwdapm69tuc4"
              )
            )
            .then((result) => {
              console.log(`getSecret20ViewingKey: ${JSON.stringify(result)}`);
            });
        }}
      >
        Test getSecret20ViewingKeyOrPermit
      </button>
    </div>
  );
});
