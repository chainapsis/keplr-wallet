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
          accountStore
            .getAccount(chainStore.chainInfos[0].chainId)
            .getKeplr()
            .then((keplr) => {
              keplr?.experimentalSuggestChain({
                rpc: "https://rpc.testnet.osmosis.zone",
                rest: "https://lcd.testnet.osmosis.zone",
                chainId: "osmo-test-5",
                chainName: "Osmosis Testnet",
                chainSymbolImageUrl:
                  "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/osmosis/chain.png",
                bip44: {
                  coinType: 118,
                },
                bech32Config: {
                  bech32PrefixAccAddr: "osmo",
                  bech32PrefixAccPub: "osmopub",
                  bech32PrefixValAddr: "osmovaloper",
                  bech32PrefixValPub: "osmovaloperpub",
                  bech32PrefixConsAddr: "osmovalcons",
                  bech32PrefixConsPub: "osmovalconspub",
                },
                stakeCurrency: {
                  coinDenom: "OSMO",
                  coinMinimalDenom: "uosmo",
                  coinDecimals: 6,
                  coinImageUrl:
                    "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/osmosis/uosmo.png",
                },
                currencies: [
                  {
                    coinDenom: "OSMO",
                    coinMinimalDenom: "uosmo",
                    coinDecimals: 6,
                    coinImageUrl:
                      "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/osmosis/uosmo.png",
                  },
                  {
                    coinDenom: "ION",
                    coinMinimalDenom: "uion",
                    coinDecimals: 6,
                    coinImageUrl:
                      "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/osmosis/uion.png",
                  },
                ],
                feeCurrencies: [
                  {
                    coinDenom: "OSMO",
                    coinMinimalDenom: "uosmo",
                    coinDecimals: 6,
                    coinImageUrl:
                      "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/osmosis/uosmo.png",
                    gasPriceStep: {
                      low: 0.0025,
                      average: 0.025,
                      high: 0.04,
                    },
                  },
                ],
                features: [],
              });
            });
        }}
      >
        Suggest Chain
      </button>

      <button
        onClick={() => {
          accountStore
            .getAccount(chainStore.chainInfos[0].chainId)
            .getKeplr()
            .then((keplr) => {
              keplr?.suggestToken(
                "juno-1",
                "juno10vgf2u03ufcf25tspgn05l7j3tfg0j63ljgpffy98t697m5r5hmqaw95ux"
              );
            });
        }}
      >
        Suggest Token
      </button>
    </div>
  );
});
