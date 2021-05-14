import React, { FunctionComponent } from "react";
import { SafeAreaPage } from "../../components/page";
import { UnbondingView } from "./unbonding";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { Text, Image, Card } from "react-native-elements";
import { Staking } from "@keplr-wallet/stores";
import { CoinPretty, DecUtils, Dec } from "@keplr-wallet/unit";
import { View } from "react-native";
import {
  flexDirectionRow,
  flex1,
  sf,
  justifyContentBetween,
  h6,
  fcHigh,
  fcLow,
  caption2,
  h7,
  body3,
  subtitle2,
  body2,
  ml4,
} from "../../styles";
import { FlexButton, FlexWhiteButton } from "../../components/buttons";
import { useNavigation } from "@react-navigation/native";

export const ValidatorDetailsView: FunctionComponent<{
  validator: Validator;
  thumbnail: string;
  power: CoinPretty | undefined;
}> = observer(({ validator, thumbnail, power }) => {
  const navigation = useNavigation();

  return (
    <Card>
      <View style={flexDirectionRow}>
        <Image
          style={{
            width: 32,
            height: 32,
            borderRadius: 100,
            marginRight: 10,
          }}
          source={
            thumbnail
              ? {
                  uri: thumbnail,
                }
              : require("../../assets/svg/icons8-person.png")
          }
        />
        <View>
          <Text style={sf([h6, fcHigh])}>{validator.description.moniker}</Text>
          <Text style={sf([caption2, fcLow])}>
            Commission -{" "}
            {DecUtils.trim(
              new Dec(validator.commission.commission_rates.rate)
                .mul(DecUtils.getPrecisionDec(2))
                .toString(1)
            )}
            %
          </Text>
        </View>
      </View>
      <View style={flexDirectionRow}>
        <View style={flex1}>
          <Text style={sf([h7, fcHigh])}>Commision</Text>
          <Text style={body3}>
            {`${DecUtils.trim(
              new Dec(validator.commission.commission_rates.rate)
                .mul(DecUtils.getPrecisionDec(2))
                .toString(1)
            )}%`}
          </Text>
        </View>
        <View style={flex1}>
          <Text style={sf([h7, fcHigh])}>Voting Power</Text>
          <Text style={body3}>{power?.maxDecimals(0).toString()}</Text>
        </View>
      </View>
      <Text style={sf([h7, fcHigh])}>Description</Text>
      <Text style={body3}>{validator.description.details}</Text>
      <FlexButton
        title="Delegate"
        onPress={() => {
          navigation.navigate("Delegate", {
            validatorAddress: validator.operator_address,
          });
        }}
      />
    </Card>
  );
});

export const ValidatorStakedView: FunctionComponent<{
  validator: Validator;
}> = observer(({ validator }) => {
  const navigation = useNavigation();

  const { accountStore, queriesStore, chainStore } = useStore();

  const queries = queriesStore.get(chainStore.current.chainId);

  const accountInfo = accountStore.getAccount(chainStore.current.chainId);

  const delegations = queries
    .getQueryDelegations()
    .getQueryBech32Address(accountInfo.bech32Address);

  const delegationTo = delegations.getDelegationTo(validator.operator_address);

  const rewards = queries
    .getQueryRewards()
    .getQueryBech32Address(accountInfo.bech32Address);

  return (
    <Card>
      <View style={sf([flexDirectionRow, justifyContentBetween])}>
        <Text style={subtitle2}>Staked</Text>
        <Text style={body2}>{delegationTo.trim(true).toString()}</Text>
      </View>
      <View style={sf([flexDirectionRow, justifyContentBetween])}>
        <Text style={subtitle2}>Reward</Text>
        <Text style={body2}>
          {rewards
            .getStakableRewardOf(validator.operator_address)
            .maxDecimals(6)
            .trim(true)
            .toString()}
        </Text>
      </View>
      <View style={flexDirectionRow}>
        <FlexWhiteButton
          title="Undelegate"
          onPress={() => {
            navigation.navigate("Undelegate", {
              validatorAddress: validator.operator_address,
            });
          }}
        />
        <FlexButton
          containerStyle={[ml4]}
          title="Redelegate"
          onPress={() => {
            navigation.navigate("Redelegate Validator", {
              fromValidatorAddress: validator.operator_address,
            });
          }}
        />
      </View>
    </Card>
  );
});

type Validator = Staking.Validator;

type ValidatorDetailsScreenProps = {
  route: {
    params: {
      validator: Validator;
      thumbnail: string;
      power: CoinPretty | undefined;
    };
  };
};

export const ValidatorDetailsScreen: FunctionComponent<ValidatorDetailsScreenProps> = observer(
  ({ route }) => {
    const { validator, thumbnail, power } = route.params;

    const { accountStore, queriesStore, chainStore } = useStore();

    const queries = queriesStore.get(chainStore.current.chainId);

    const unbondings = queries
      .getQueryUnbondingDelegations()
      .getQueryBech32Address(
        accountStore.getAccount(chainStore.current.chainId).bech32Address
      ).unbondings;

    const unbonding = unbondings.filter(
      (val) => val.validator_address === validator.operator_address
    );

    return (
      <SafeAreaPage>
        <ValidatorDetailsView
          validator={validator}
          thumbnail={thumbnail}
          power={power}
        />
        <ValidatorStakedView validator={validator} />
        {unbonding.length > 0 ? <UnbondingView unbondings={unbonding} /> : null}
      </SafeAreaPage>
    );
  }
);
