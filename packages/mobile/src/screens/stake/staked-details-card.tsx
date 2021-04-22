import React, { FunctionComponent } from "react";
import { Staking } from "@keplr-wallet/stores";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { Text, Avatar, Card } from "react-native-elements";
import { View } from "react-native";
import { CoinPretty } from "@keplr-wallet/unit";
import {
  sf,
  fs13,
  flexDirectionRow,
  justifyContentBetween,
} from "../../styles";

export const StakedDetailsCard: FunctionComponent<{
  thumbnail: string;
  validator: Staking.Validator;
  delegatedAmount: CoinPretty;
}> = observer(({ thumbnail, validator, delegatedAmount }) => {
  const { accountStore, queriesStore, chainStore } = useStore();

  const accountInfo = accountStore.getAccount(chainStore.current.chainId);

  const queries = queriesStore.get(chainStore.current.chainId);
  const rewards = queries
    .getQueryRewards()
    .getQueryBech32Address(accountInfo.bech32Address);

  return (
    <Card>
      <View>
        <Avatar
          source={{ uri: thumbnail }}
          size={40}
          rounded
          icon={{ name: "user", type: "font-awesome" }}
        />
        <Text numberOfLines={1} style={fs13}>
          {validator.description.moniker}
        </Text>
      </View>
      <View style={sf([flexDirectionRow, justifyContentBetween])}>
        <Text>Staked</Text>
        <Text>{delegatedAmount.trim(true).toString()}</Text>
      </View>
      <View style={sf([flexDirectionRow, justifyContentBetween])}>
        <Text>Reward</Text>
        <Text>
          {rewards
            .getStakableRewardOf(validator.operator_address)
            .maxDecimals(6)
            .trim(true)
            .toString()}
        </Text>
      </View>
    </Card>
  );
});
