import React, { FunctionComponent } from "react";
import { Card, CardBody, CardHeader } from "../../../components/staging/card";
import { View, ViewStyle } from "react-native";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { useStyle } from "../../../styles";
import { TokenItem } from "../../tokens";
import { Button } from "../../../components/staging/button";
import { useSmartNavigation } from "../../../navigation";

export const TokensCard: FunctionComponent<{
  containerStyle?: ViewStyle;
}> = observer(({ containerStyle }) => {
  const { chainStore, queriesStore, accountStore } = useStore();

  const style = useStyle();

  const smartNavigation = useSmartNavigation();

  const queryBalances = queriesStore
    .get(chainStore.current.chainId)
    .queryBalances.getQueryBech32Address(
      accountStore.getAccount(chainStore.current.chainId).bech32Address
    );

  const tokens = queryBalances.positiveNativeUnstakables
    .concat(queryBalances.nonNativeBalances)
    .slice(0, 2);

  return (
    <View style={containerStyle}>
      <Card style={style.flatten(["padding-bottom-14"])}>
        <CardHeader
          containerStyle={style.flatten(["padding-bottom-6"])}
          title="Token"
        />
        <CardBody style={style.flatten(["padding-0"])}>
          {tokens.map((token) => {
            return (
              <TokenItem
                key={token.currency.coinMinimalDenom}
                chainInfo={chainStore.current}
                balance={token.balance}
              />
            );
          })}
        </CardBody>
      </Card>
      <Button
        mode="text"
        text="View All Tokens"
        textStyle={style.flatten(["color-text-black-low", "text-underline"])}
        onPress={() => {
          smartNavigation.navigateSmart("Tokens", {});
        }}
      />
    </View>
  );
});
