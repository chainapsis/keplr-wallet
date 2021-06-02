import React, { FunctionComponent, useMemo, useState } from "react";

import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { Hash } from "@keplr-wallet/crypto";
import { ObservableQueryBalanceInner } from "@keplr-wallet/stores/build/query/balances";
import { DenomHelper } from "@keplr-wallet/common";
import { Dec } from "@keplr-wallet/unit";
import {
  alignItemsCenter,
  br3,
  fcHigh,
  fcLow,
  fcWhite,
  flex1,
  flexDirectionRow,
  h5,
  justifyContentBetween,
  justifyContentCenter,
  mr2,
  sf,
  subtitle2,
  mt3,
} from "../../styles";
import { View } from "react-native";
import { Text } from "react-native-elements";
import { Card } from "../../components/layout";

const TokenView: FunctionComponent<{
  balance: ObservableQueryBalanceInner;
  onClick: () => void;
}> = observer(({ onClick, balance }) => {
  const [backgroundColors] = useState([
    "#5e72e4",
    "#11cdef",
    "#2dce89",
    "#fb6340",
  ]);

  const name = balance.currency.coinDenom.toUpperCase();
  const minimalDenom = balance.currency.coinMinimalDenom;
  const amount = balance.balance.trim(true).shrink(true);

  const backgroundColor = useMemo(() => {
    const hash = Hash.sha256(Buffer.from(minimalDenom));
    if (hash.length > 0) {
      return backgroundColors[hash[0] % backgroundColors.length];
    } else {
      return backgroundColors[0];
    }
  }, [backgroundColors, minimalDenom]);

  return (
    <View
      style={sf([flexDirectionRow, alignItemsCenter, justifyContentBetween])}
    >
      <View
        style={sf([
          {
            width: 44,
            height: 44,
            backgroundColor,
          },
          justifyContentCenter,
          alignItemsCenter,
          br3,
          mr2,
        ])}
      >
        <Text style={sf([fcWhite, h5])}>{name.length > 0 ? name[0] : "?"}</Text>
      </View>
      <View style={sf([flex1])}>
        <Text style={sf([h5, fcHigh])}>{name}</Text>
        <Text style={sf([subtitle2, fcLow])}>
          {amount.maxDecimals(6).toString()}
        </Text>
      </View>
    </View>
  );
});

export const TokensView: FunctionComponent = observer(() => {
  const { chainStore, accountStore, queriesStore } = useStore();

  const accountInfo = accountStore.getAccount(chainStore.current.chainId);

  const tokens = queriesStore
    .get(chainStore.current.chainId)
    .queryBalances.getQueryBech32Address(accountInfo.bech32Address)
    .unstakables.filter((bal) => {
      // Temporary implementation for trimming the 0 balanced native tokens.
      // TODO: Remove this part.
      if (new DenomHelper(bal.currency.coinMinimalDenom).type === "native") {
        return bal.balance.toDec().gt(new Dec("0"));
      }
      return true;
    });

  const hasTokens = tokens.length > 0;

  return hasTokens ? (
    <View style={mt3}>
      <Text style={h5}>Tokens</Text>
      <Card>
        {tokens.map((token, i) => {
          return (
            <TokenView key={i.toString()} balance={token} onClick={() => {}} />
          );
        })}
      </Card>
    </View>
  ) : null;
});
