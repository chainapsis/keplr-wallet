import React, { FunctionComponent, useMemo } from "react";
import { ResMsg } from "../types";
import { Box } from "../../../../components/box";
import { ColorPalette } from "../../../../styles";
import { XAxis, YAxis } from "../../../../components/axis";
import { Body3, Subtitle3 } from "../../../../components/typography";
import { Gutter } from "../../../../components/gutter";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";
import { CoinPretty, Dec, PricePretty } from "@keplr-wallet/unit";

export const MsgRelationSend: FunctionComponent<{
  msg: ResMsg;
  prices?: Record<string, Record<string, number | undefined> | undefined>;
  targetDenom: string;
}> = observer(({ msg, prices, targetDenom }) => {
  const { chainStore, priceStore } = useStore();

  const chainInfo = chainStore.getChain(msg.chainId);

  const sendAmountPretty = useMemo(() => {
    const currency = chainInfo.forceFindCurrency(targetDenom);

    const amounts = (msg.msg as any)["amount"] as {
      denom: string;
      amount: string;
    }[];

    const amt = amounts.find((amt) => amt.denom === targetDenom);
    if (!amt) {
      return new CoinPretty(currency, "0");
    }
    return new CoinPretty(currency, amt.amount);
  }, [chainInfo, msg.msg, targetDenom]);

  // mobx와 useMemo의 조합 문제로... 값 몇개를 밖으로 뺀다.
  const foundCurrency = chainInfo.findCurrency(targetDenom);
  const defaultVsCurrency = priceStore.defaultVsCurrency;
  const sendAmountPricePretty = useMemo(() => {
    if (foundCurrency && foundCurrency.coinGeckoId) {
      const price = prices?.[foundCurrency.coinGeckoId];
      if (price != null && price[defaultVsCurrency] != null) {
        const dec = sendAmountPretty.toDec();
        const priceDec = new Dec(price[defaultVsCurrency]!.toString());
        const fiatCurrency = priceStore.getFiatCurrency(defaultVsCurrency);
        if (fiatCurrency) {
          return new PricePretty(fiatCurrency, dec.mul(priceDec));
        }
      }
    }
    return;
  }, [defaultVsCurrency, foundCurrency, priceStore, prices, sendAmountPretty]);

  const toAddress = (() => {
    try {
      return Bech32Address.shortenAddress((msg.msg as any)["to_address"], 22);
    } catch (e) {
      console.log(e);
      return "Unknown";
    }
  })();

  return (
    <Box
      backgroundColor={ColorPalette["gray-600"]}
      borderRadius="0.375rem"
      paddingX="1rem"
      paddingY="0.875rem"
    >
      <XAxis>
        <div>logo</div>
        <div
          style={{
            flex: 1,
            minWidth: "0.75rem",
          }}
        >
          <XAxis alignY="center">
            <YAxis>
              <Subtitle3 color={ColorPalette["gray-10"]}>Send</Subtitle3>
              <Gutter size="0.25rem" />
              <Body3 color={ColorPalette["gray-300"]}>{toAddress}</Body3>
            </YAxis>

            <div
              style={{
                flex: 1,
              }}
            />
            <YAxis alignX="right">
              <Subtitle3 color={ColorPalette["white"]}>
                {sendAmountPretty
                  .maxDecimals(2)
                  .shrink(true)
                  .hideIBCMetadata(true)
                  .inequalitySymbol(true)
                  .toString()}
              </Subtitle3>
              {sendAmountPricePretty ? (
                <React.Fragment>
                  <Gutter size="0.25rem" />
                  <Body3 color={ColorPalette["gray-300"]}>
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
});
