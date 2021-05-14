import React, { FunctionComponent, useEffect, useMemo, useState } from "react";
import {
  EmptyAmountError,
  IAmountConfig,
  InsufficientAmountError,
  InvalidNumberAmountError,
  NagativeAmountError,
  ZeroAmountError,
  IFeeConfig,
} from "@keplr-wallet/hooks";

import { CoinPretty, DecUtils, Int } from "@keplr-wallet/unit";
import { observer } from "mobx-react-lite";
import { Text } from "react-native-elements";
import Icon from "react-native-vector-icons/Feather";
import RNPickerSelect from "react-native-picker-select";
import { View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useStore } from "../../stores";
import {
  bgcGray,
  bgcWhite,
  caption1,
  fcGrey1,
  flexDirectionRow,
  justifyContentBetween,
  sf,
  subtitle2,
  underline,
} from "../../styles";
import { Input } from "../input";

export interface CoinInputProps {
  amountConfig: IAmountConfig;
  feeConfig: IFeeConfig;
  disableToken?: boolean;
}

export const CoinInput: FunctionComponent<CoinInputProps> = observer(
  ({ amountConfig, feeConfig, disableToken }) => {
    const { queriesStore } = useStore();
    const queryBalances = queriesStore
      .get(amountConfig.chainId)
      .getQueryBalances()
      .getQueryBech32Address(amountConfig.sender);

    const queryBalance = queryBalances.balances.find(
      (bal) =>
        amountConfig.sendCurrency.coinMinimalDenom ===
        bal.currency.coinMinimalDenom
    );
    const balance = queryBalance
      ? queryBalance.balance
      : new CoinPretty(amountConfig.sendCurrency, new Int(0));

    const [isAllBalanceMode, setIsAllBalanceMode] = useState(false);
    const toggleAllBalanceMode = () => setIsAllBalanceMode((value) => !value);

    const fee = feeConfig.fee;
    useEffect(() => {
      if (isAllBalanceMode) {
        // Get the actual sendable balance with considering the fee.
        const sendableBalance =
          balance.currency.coinMinimalDenom === fee?.currency.coinMinimalDenom
            ? new CoinPretty(
                balance.currency,
                balance
                  .toDec()
                  .sub(fee.toDec())
                  .mul(DecUtils.getPrecisionDec(balance.currency.coinDecimals))
                  .truncate()
              )
            : balance;

        amountConfig.setAmount(
          sendableBalance.trim(true).locale(false).hideDenom(true).toString()
        );
      }
    }, [balance, fee, isAllBalanceMode, amountConfig]);

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
        {!disableToken ? (
          <RNPickerSelect
            disabled={isAllBalanceMode}
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
              disabled={isAllBalanceMode}
              inputContainerStyle={isAllBalanceMode ? [bgcGray] : [bgcWhite]}
              value={amountConfig.sendCurrency.coinDenom}
              rightIcon={<Icon name="chevron-down" />}
            />
          </RNPickerSelect>
        ) : null}
        <View style={sf([flexDirectionRow, justifyContentBetween])}>
          <Text style={subtitle2}>Amount</Text>
          <TouchableOpacity onPress={toggleAllBalanceMode}>
            <Text style={sf([fcGrey1, caption1, underline])}>
              {`Balance: ${balance.trim(true).maxDecimals(6).toString()}`}
            </Text>
          </TouchableOpacity>
        </View>
        <Input
          value={amountConfig.amount}
          onChangeText={(value) => {
            amountConfig.setAmount(value);
          }}
          keyboardType="numeric"
          disabled={isAllBalanceMode}
          inputContainerStyle={isAllBalanceMode ? [bgcGray] : [bgcWhite]}
          errorMessage={errorText}
        />
      </React.Fragment>
    );
  }
);
