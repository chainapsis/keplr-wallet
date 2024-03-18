import React, { FunctionComponent, useMemo } from "react";
import { Box } from "../../../../components/box";
import { ColorPalette } from "../../../../styles";
import { XAxis, YAxis } from "../../../../components/axis";
import { Body3, Subtitle3 } from "../../../../components/typography";
import { Gutter } from "../../../../components/gutter";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";
import { CoinPretty, Dec, PricePretty } from "@keplr-wallet/unit";

export const MsgItemBase: FunctionComponent<{
  logo: React.ReactElement;
  chainId: string;
  title: string;
  paragraph?: string;
  amount: CoinPretty;
  prices: Record<string, Record<string, number | undefined> | undefined>;
  targetDenom: string;
}> = observer(
  ({ logo, chainId, title, paragraph, amount, prices, targetDenom }) => {
    const { chainStore, priceStore } = useStore();

    const chainInfo = chainStore.getChain(chainId);

    // mobx와 useMemo의 조합 문제로... 값 몇개를 밖으로 뺀다.
    const foundCurrency = chainInfo.findCurrency(targetDenom);
    const defaultVsCurrency = priceStore.defaultVsCurrency;
    const sendAmountPricePretty = useMemo(() => {
      if (foundCurrency && foundCurrency.coinGeckoId) {
        const price = prices[foundCurrency.coinGeckoId];
        if (price != null && price[defaultVsCurrency] != null) {
          const dec = amount.toDec();
          const priceDec = new Dec(price[defaultVsCurrency]!.toString());
          const fiatCurrency = priceStore.getFiatCurrency(defaultVsCurrency);
          if (fiatCurrency) {
            return new PricePretty(fiatCurrency, dec.mul(priceDec));
          }
        }
      }
      return;
    }, [defaultVsCurrency, foundCurrency, priceStore, prices, amount]);

    return (
      <Box
        backgroundColor={ColorPalette["gray-600"]}
        borderRadius="0.375rem"
        paddingX="1rem"
        paddingY="0.875rem"
        minHeight="4rem"
        alignY="center"
      >
        <XAxis>
          <Box marginRight="0.75rem">
            <XAxis alignY="center">{logo}</XAxis>
          </Box>
          <div
            style={{
              flex: 1,
              minWidth: "0.75rem",
            }}
          >
            <XAxis alignY="center">
              <YAxis>
                <Subtitle3 color={ColorPalette["gray-10"]}>{title}</Subtitle3>
                {paragraph ? (
                  <React.Fragment>
                    <Gutter size="0.25rem" />
                    <Body3 color={ColorPalette["gray-300"]}>{paragraph}</Body3>
                  </React.Fragment>
                ) : null}
              </YAxis>

              <div
                style={{
                  flex: 1,
                }}
              />
              <YAxis alignX="right">
                <Subtitle3
                  color={ColorPalette["white"]}
                  style={{
                    whiteSpace: "nowrap",
                  }}
                >
                  {amount
                    .maxDecimals(2)
                    .shrink(true)
                    .hideIBCMetadata(true)
                    .inequalitySymbol(true)
                    .toString()}
                </Subtitle3>
                {sendAmountPricePretty ? (
                  <React.Fragment>
                    <Gutter size="0.25rem" />
                    <Body3
                      color={ColorPalette["gray-300"]}
                      style={{
                        whiteSpace: "nowrap",
                      }}
                    >
                      {sendAmountPricePretty.toString()}
                    </Body3>
                  </React.Fragment>
                ) : null}
              </YAxis>
            </XAxis>
          </div>
        </XAxis>
      </Box>
    );
  }
);
