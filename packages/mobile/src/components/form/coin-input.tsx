import React, { FunctionComponent, useMemo } from "react";
import {
  EmptyAmountError,
  IAmountConfig,
  InsufficientAmountError,
  InvalidNumberAmountError,
  NagativeAmountError,
  ZeroAmountError,
} from "@keplr-wallet/hooks";
import { observer } from "mobx-react-lite";
import { Input } from "react-native-elements";
import Icon from "react-native-vector-icons/Feather";
import RNPickerSelect from "react-native-picker-select";

export interface CoinInputProps {
  amountConfig: IAmountConfig;
}

export const CoinInput: FunctionComponent<CoinInputProps> = observer(
  ({ amountConfig }) => {
    const error = amountConfig.getError();
    const errorText: string | undefined = useMemo(() => {
      if (error) {
        switch (error.constructor) {
          case EmptyAmountError:
            // No need to show the error to user.
            return;
          case InvalidNumberAmountError:
            return "Invalid number";
          case ZeroAmountError:
            return "Zero amount";
          case NagativeAmountError:
            return "Negative amount";
          case InsufficientAmountError:
            return "Insufficient funds";
          default:
            return "Unknown error";
        }
      }
    }, [error]);

    return (
      <React.Fragment>
        <RNPickerSelect
          onValueChange={(value) => {
            const currency = amountConfig.sendableCurrencies.find(
              (cur) => cur.coinMinimalDenom === value
            );
            amountConfig.setSendCurrency(currency);
          }}
          value={amountConfig.sendCurrency.coinMinimalDenom}
          items={amountConfig.sendableCurrencies.map((currency) => {
            return {
              label: currency.coinDenom,
              value: currency.coinMinimalDenom,
              key: currency.coinMinimalDenom,
            };
          })}
        >
          <Input
            label="Token"
            value={amountConfig.sendCurrency.coinDenom}
            rightIcon={<Icon name="chevron-down" />}
          />
        </RNPickerSelect>
        <Input
          label="Amount"
          value={amountConfig.amount}
          onChangeText={(value) => {
            amountConfig.setAmount(value);
          }}
          keyboardType="numeric"
          errorMessage={errorText}
        />
      </React.Fragment>
    );
  }
);
