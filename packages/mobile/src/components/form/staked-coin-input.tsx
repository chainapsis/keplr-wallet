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

import { CoinPretty, DecUtils } from "@keplr-wallet/unit";
import { observer } from "mobx-react-lite";
import { Text } from "react-native-elements";
import { View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useStore } from "../../stores";
import {
  bgcGrey,
  bgcWhite,
  caption1,
  fcLow,
  flexDirectionRow,
  justifyContentBetween,
  sf,
  subtitle2,
  underline,
} from "../../styles";
import { Input } from "./input";

export interface StakedCoinInputProps {
  validatorAddress: string;
  amountConfig: IAmountConfig;
  feeConfig: IFeeConfig;
}

export const StakedCoinInput: FunctionComponent<StakedCoinInputProps> = observer(
  ({ validatorAddress, amountConfig, feeConfig }) => {
    const { accountStore, queriesStore, chainStore } = useStore();

    const queries = queriesStore.get(chainStore.current.chainId);

    const accountInfo = accountStore.getAccount(chainStore.current.chainId);

    const delegations = queries.cosmos.queryDelegations.getQueryBech32Address(
      accountInfo.bech32Address
    );

    const delegationTo = delegations.getDelegationTo(validatorAddress);

    const [isAllBalanceMode, setIsAllBalanceMode] = useState(false);
    const toggleAllBalanceMode = () => setIsAllBalanceMode((value) => !value);

    const fee = feeConfig.fee;
    useEffect(() => {
      if (isAllBalanceMode) {
        // Get the actual sendable balance with considering the fee.
        const unstakableBalance =
          delegationTo.currency.coinMinimalDenom ===
          fee?.currency.coinMinimalDenom
            ? new CoinPretty(
                delegationTo.currency,
                delegationTo
                  .toDec()
                  .sub(fee.toDec())
                  .mul(
                    DecUtils.getPrecisionDec(delegationTo.currency.coinDecimals)
                  )
                  .truncate()
              )
            : delegationTo;

        amountConfig.setAmount(
          unstakableBalance.trim(true).locale(false).hideDenom(true).toString()
        );
      }
    }, [
      amountConfig,
      delegationTo,
      delegationTo.currency.coinMinimalDenom,
      fee,
      isAllBalanceMode,
    ]);

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
        <View style={sf([flexDirectionRow, justifyContentBetween])}>
          <Text style={subtitle2}>Amount</Text>
          <TouchableOpacity onPress={toggleAllBalanceMode}>
            <Text style={sf([fcLow, caption1, underline])}>
              {`Staked: ${delegationTo.trim(true).toString()}`}
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
          inputContainerStyle={isAllBalanceMode ? [bgcGrey] : [bgcWhite]}
          errorMessage={errorText}
        />
      </React.Fragment>
    );
  }
);
