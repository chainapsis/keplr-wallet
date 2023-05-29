import React, { FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import styled from "styled-components";
import { ColorPalette } from "../../../../styles";
import { Subtitle1 } from "../../../../components/typography";
import {
  FiatOnRampServiceInfo,
  FiatOnRampServiceInfos,
} from "../../../../config.ui";
import { Box } from "../../../../components/box";
import { useStore } from "../../../../stores";
import { ChainInfo } from "@keplr-wallet/types";
import { simpleFetch } from "@keplr-wallet/simple-fetch";

const Styles = {
  Container: styled.div`
    display: flex;
    flex-direction: column;

    width: 100%;

    padding: 1.25rem 0.75rem 0.75rem 0.75rem;

    background-color: ${ColorPalette["gray-600"]};

    gap: 0.75rem;

    overflow-y: auto;
  `,
  ItemContainer: styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;

    padding: 0.75rem 0;

    background-color: ${ColorPalette["gray-500"]};

    :hover {
      background-color: ${ColorPalette["gray-450"]};
    }

    gap: 0.25rem;

    cursor: pointer;

    border-radius: 0.25rem;
  `,
  ItemName: styled(Subtitle1)`
    color: ${ColorPalette["gray-10"]};
  `,
};

export const BuyCryptoModal: FunctionComponent<{
  close: () => void;
}> = observer(({ close }) => {
  const { accountStore, chainStore } = useStore();
  const [fiatOnRampServiceInfos, setFiatOnRampServiceInfos] = useState(
    FiatOnRampServiceInfos
  );

  useEffect(() => {
    (async () => {
      const response = await simpleFetch<{ list: FiatOnRampServiceInfo[] }>(
        "https://raw.githubusercontent.com/chainapsis/keplr-fiat-on-off-ramp-registry/main/fiat-on-off-ramp-list.json"
      );

      setFiatOnRampServiceInfos(response.data.list);
    })();
  }, []);

  const buySupportServiceInfos = fiatOnRampServiceInfos.map((serviceInfo) => {
    const buySupportChainIds = Object.keys(
      serviceInfo.buySupportCoinDenomsByChainId
    );

    const buySupportDefaultChainInfo = (() => {
      if (
        buySupportChainIds.length > 0 &&
        chainStore.hasChain(buySupportChainIds[0])
      ) {
        return chainStore.getChain(buySupportChainIds[0]);
      }
    })();

    const buySupportChainAccounts = (() => {
      const res: {
        chainInfo: ChainInfo;
        bech32Address: string;
      }[] = [];

      for (const chainId of buySupportChainIds) {
        if (chainStore.hasChain(chainId)) {
          res.push({
            chainInfo: chainStore.getChain(chainId),
            bech32Address: accountStore.getAccount(chainId).bech32Address,
          });
        }
      }

      return res;
    })();

    const buyUrlParams = (() => {
      switch (serviceInfo.serviceId) {
        case "moonpay":
          return {
            apiKey:
              process.env["KEPLR_EXT_MOONPAY_API_KEY"] ?? serviceInfo.apiKey,
            showWalletAddressForm: "true",
            walletAddresses: encodeURIComponent(
              JSON.stringify(
                buySupportChainAccounts.reduce(
                  (acc, cur) => ({
                    ...acc,
                    [cur.chainInfo.stakeCurrency.coinDenom.toLowerCase()]:
                      cur.bech32Address,
                  }),
                  {}
                )
              )
            ),
            ...(buySupportDefaultChainInfo && {
              defaultCurrencyCode:
                buySupportDefaultChainInfo.stakeCurrency.coinDenom.toLowerCase(),
            }),
          };
        case "transak":
          return {
            apiKey:
              process.env["KEPLR_EXT_TRANSAK_API_KEY"] ?? serviceInfo.apiKey,
            hideMenu: "true",
            walletAddressesData: encodeURIComponent(
              JSON.stringify({
                coins: buySupportChainAccounts.reduce(
                  (acc, cur) => ({
                    ...acc,
                    [cur.chainInfo.stakeCurrency.coinDenom]: {
                      address: cur.bech32Address,
                    },
                  }),
                  {}
                ),
              })
            ),
            cryptoCurrencyList: buySupportChainAccounts
              .map(
                (chainAccount) => chainAccount.chainInfo.stakeCurrency.coinDenom
              )
              .join(","),
            ...(buySupportDefaultChainInfo && {
              defaultCryptoCurrency:
                buySupportDefaultChainInfo.stakeCurrency.coinDenom,
            }),
          };
        case "kado":
          return {
            apiKey: process.env["KEPLR_EXT_KADO_API_KEY"] ?? serviceInfo.apiKey,
            product: "BUY",
            networkList: buySupportChainAccounts.map((chainAccount) =>
              chainAccount.chainInfo.chainName.toUpperCase()
            ),
            cryptoList: [
              ...new Set(
                Object.values(serviceInfo.buySupportCoinDenomsByChainId).flat()
              ),
            ],
          };
        default:
          return;
      }
    })();
    const buyUrl = buyUrlParams
      ? `${serviceInfo.buyOrigin}?${Object.entries(buyUrlParams)
          .map((paramKeyValue) => paramKeyValue.join("="))
          .join("&")}`
      : undefined;

    return {
      ...serviceInfo,
      buyUrl,
    };
  });

  return (
    <Styles.Container>
      <Subtitle1 style={{ color: ColorPalette["white"], textAlign: "center" }}>
        Buy Crypto
      </Subtitle1>

      {buySupportServiceInfos.map((serviceInfo) => {
        return (
          <ServiceItem
            key={serviceInfo.serviceId}
            serviceInfo={serviceInfo}
            close={close}
          />
        );
      })}
    </Styles.Container>
  );
});

const ServiceItem: FunctionComponent<{
  serviceInfo: FiatOnRampServiceInfo & { buyUrl?: string };
  close: () => void;
}> = ({ serviceInfo, close }) => {
  return (
    <Styles.ItemContainer
      onClick={async () => {
        await browser.tabs.create({
          url: serviceInfo.buyUrl,
        });

        close();
      }}
    >
      <Box>
        <img
          src={require(`../../../../public/assets/img/fiat-on-ramp/${serviceInfo.serviceId}.svg`)}
          alt={`buy ${serviceInfo.serviceId} button`}
        />
      </Box>

      <Styles.ItemName>{serviceInfo.serviceName}</Styles.ItemName>
    </Styles.ItemContainer>
  );
};
