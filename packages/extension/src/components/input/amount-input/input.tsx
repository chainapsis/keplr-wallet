import React, { FunctionComponent, useState } from "react";
import { observer } from "mobx-react-lite";
import {
  EmptyAmountError,
  IAmountConfig,
  IFeeConfig,
  ISenderConfig,
  ZeroAmountError,
} from "@keplr-wallet/hooks";
import { TextInput } from "../text-input";
import { useStore } from "../../../stores";
import { CoinPretty, Dec, DecUtils } from "@keplr-wallet/unit";

export const AmountInput: FunctionComponent<{
  senderConfig: ISenderConfig;
  amountConfig: IAmountConfig;
  feeConfig: IFeeConfig;
}> = observer(({ amountConfig }) => {
  if (amountConfig.amount.length !== 1) {
    throw new Error(
      `Amount input component only handles single amount: ${amountConfig.amount
        .map((a) => a.toString())
        .join(",")}`
    );
  }

  const { priceStore } = useStore();

  const price = (() => {
    return priceStore.calculatePrice(amountConfig.amount[0]);
  })();
  const [priceValue, setPriceValue] = useState("");
  const [isPriceBased, setIsPriceBased] = useState(false);

  return (
    <TextInput
      label="Amount"
      type="number"
      value={(() => {
        if (isPriceBased) {
          if (amountConfig.fraction != 0) {
            return price?.toDec().toString(price?.options.maxDecimals);
          }
          return priceValue;
        } else {
          return amountConfig.value;
        }
      })()}
      onChange={(e) => {
        e.preventDefault();

        if (isPriceBased) {
          if (price) {
            let value = e.target.value;
            if (value.startsWith(".")) {
              value = "0" + value;
            }
            if (value.trim().length === 0) {
              amountConfig.setValue("0");
              setPriceValue(value);
              return;
            }
            if (/^\d+(\.\d+)*$/.test(value)) {
              let dec: Dec;
              try {
                dec = new Dec(value);
              } catch (e) {
                console.log(e);
                return;
              }
              if (dec.lte(new Dec(0))) {
                setPriceValue(value);
                return;
              }

              const onePrice = priceStore.calculatePrice(
                new CoinPretty(
                  amountConfig.amount[0].currency,
                  DecUtils.getTenExponentN(
                    amountConfig.amount[0].currency.coinDecimals
                  )
                )
              );

              if (!onePrice) {
                // Can't be happen
                return;
              }
              const onePriceDec = onePrice.toDec();
              const expectedAmount = dec.quo(onePriceDec);

              setPriceValue(value);
              amountConfig.setValue(
                expectedAmount.toString(
                  amountConfig.amount[0].currency.coinDecimals
                )
              );
            }
          }
        } else {
          amountConfig.setValue(e.target.value);
        }
      }}
      left={
        isPriceBased
          ? priceStore.getFiatCurrency(priceStore.defaultVsCurrency)?.symbol
          : undefined
      }
      right={<MaxButton amountConfig={amountConfig} />}
      bottom={
        price ? (
          <div
            onClick={(e) => {
              e.preventDefault();

              if (!isPriceBased) {
                if (price.toDec().lte(new Dec(0))) {
                  setPriceValue("");
                } else {
                  setPriceValue(
                    price.toDec().toString(price.options.maxDecimals).toString()
                  );
                }
              }
              setIsPriceBased(!isPriceBased);
            }}
          >
            {(() => {
              if (isPriceBased) {
                return amountConfig.amount[0]
                  .trim(true)
                  .maxDecimals(6)
                  .inequalitySymbol(true)
                  .shrink(true)
                  .toString();
              } else {
                return price.toString();
              }
            })()}
          </div>
        ) : null
      }
      error={(() => {
        const uiProperties = amountConfig.uiProperties;

        const err = uiProperties.error || uiProperties.warning;

        if (err instanceof EmptyAmountError) {
          return;
        }

        if (err instanceof ZeroAmountError) {
          return;
        }

        if (err) {
          return err.message || err.toString();
        }
      })()}
    />
  );
});

const MaxButton: FunctionComponent<{
  amountConfig: IAmountConfig;
}> = observer(({ amountConfig }) => {
  return (
    <div
      onClick={(e) => {
        e.preventDefault();

        if (amountConfig.fraction > 0) {
          amountConfig.setFraction(0);
        } else {
          amountConfig.setFraction(1);
        }
      }}
    >
      {amountConfig.fraction === 0 ? "Max" : "Click"}
    </div>
  );
});
