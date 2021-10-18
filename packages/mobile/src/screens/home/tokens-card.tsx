import React, { FunctionComponent } from "react";
import { Card, CardBody, CardHeader } from "../../components/card";
import { Text, View, ViewStyle } from "react-native";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { useStyle } from "../../styles";
import { TokenItem } from "../tokens";
import { useSmartNavigation } from "../../navigation";
import { RectButton } from "../../components/rect-button";

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
      <RectButton
        style={style.flatten(["items-center", "padding-y-11"])}
        onPress={() => {
          smartNavigation.navigateSmart("Tokens", {});
        }}
      >
        <Text
          style={style.flatten([
            "text-button3",
            "color-text-black-low",
            "normal-case",
            "text-underline",
          ])}
        >
          View all tokens
        </Text>
      </RectButton>
    </View>
  );
});
