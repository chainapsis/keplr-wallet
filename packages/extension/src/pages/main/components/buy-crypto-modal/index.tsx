import React, { FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import styled, { useTheme } from "styled-components";
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
import { FormattedMessage } from "react-intl";

const Styles = {
  Container: styled.div`
    display: flex;
    flex-direction: column;

    width: 100%;

    padding: 1.25rem 0.75rem 0.75rem 0.75rem;

    background-color: ${(props) =>
      props.theme.mode === "light"
        ? ColorPalette["white"]
        : ColorPalette["gray-600"]};

    gap: 0.75rem;

    overflow-y: auto;
  `,
  ItemContainer: styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;

    padding: 0.75rem 0;

    background-color: ${(props) =>
      props.theme.mode === "light"
        ? ColorPalette["gray-50"]
        : ColorPalette["gray-500"]};

    :hover {
      background-color: ${(props) =>
        props.theme.mode === "light"
          ? ColorPalette["gray-100"]
          : ColorPalette["gray-450"]};
    }

    gap: 0.25rem;

    cursor: pointer;

    border-radius: 0.25rem;
  `,
  ItemName: styled(Subtitle1)`
    color: ${(props) =>
      props.theme.mode === "light"
        ? ColorPalette["gray-400"]
        : ColorPalette["gray-10"]};
  `,
};

export const BuyCryptoModal: FunctionComponent<{
  close: () => void;
}> = observer(({ close }) => {
  const theme = useTheme();
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
                    [(
                      cur.chainInfo.stakeCurrency || cur.chainInfo.currencies[0]
                    ).coinDenom.toLowerCase()]: cur.bech32Address,
                  }),
                  {}
                )
              )
            ),
            ...(buySupportDefaultChainInfo && {
              defaultCurrencyCode: (
                buySupportDefaultChainInfo.stakeCurrency ||
                buySupportDefaultChainInfo.currencies[0]
              ).coinDenom.toLowerCase(),
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
                    [(
                      cur.chainInfo.stakeCurrency || cur.chainInfo.currencies[0]
                    ).coinDenom]: {
                      address: cur.bech32Address,
                    },
                  }),
                  {}
                ),
              })
            ),
            cryptoCurrencyList: buySupportChainAccounts
              .map(
                (chainAccount) =>
                  (
                    chainAccount.chainInfo.stakeCurrency ||
                    chainAccount.chainInfo.currencies[0]
                  ).coinDenom
              )
              .join(","),
            ...(buySupportDefaultChainInfo && {
              defaultCryptoCurrency: (
                buySupportDefaultChainInfo.stakeCurrency ||
                buySupportDefaultChainInfo.currencies[0]
              ).coinDenom,
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
            ...(buySupportDefaultChainInfo && {
              onRevCurrency:
                serviceInfo.buySupportCoinDenomsByChainId[
                  buySupportDefaultChainInfo.chainId
                ]?.[0] ?? "USDC",
              network: buySupportDefaultChainInfo.chainName.toUpperCase(),
            }),
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
      <Subtitle1
        style={{
          color:
            theme.mode === "light"
              ? ColorPalette["gray-700"]
              : ColorPalette["white"],
          textAlign: "center",
        }}
      >
        <FormattedMessage id="page.main.components.buy-crypto-modal.title" />
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
  const { analyticsStore } = useStore();

  return (
    <Styles.ItemContainer
      onClick={async () => {
        analyticsStore.logEvent("click_buy_onrampProvider", {
          onRampProvider: serviceInfo.serviceName,
        });

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
