import React, { FunctionComponent, useMemo } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { SafeAreaFixedPage, SafeAreaPage } from "../../components/page";
import { MemoInput, FeeButtons, StakedCoinInput } from "../../components/form";
import { useSendTxConfig } from "@keplr-wallet/hooks";
import { FlexButton } from "../../components/buttons";
import { useNavigation, StackActions } from "@react-navigation/native";
import { Text } from "react-native-elements";
import { View, FlatList } from "react-native";
import { RectButton } from "react-native-gesture-handler";
import { Staking } from "@keplr-wallet/stores";
import { sf, cardStyle, bgcWhite, shadow, subtitle2 } from "../../styles";
import { Image } from "react-native-elements";
const BondStatus = Staking.BondStatus;

type RedelegateValidatorScreenProps = {
  route: {
    params: {
      fromValidatorAddress: string;
    };
  };
};

type ValidatorProps = {
  validator: Staking.Validator;
  thumbnail: string;
};

export const RedelegateValidatorScreen: FunctionComponent<RedelegateValidatorScreenProps> = observer(
  ({ route }) => {
    const { fromValidatorAddress } = route.params;

    const { queriesStore, chainStore } = useStore();
    const queries = queriesStore.get(chainStore.current.chainId);

    const blacklistValidators: {
      [validatorAddress: string]: true | undefined;
    } = {};

    const bondedValidators = queries
      .getQueryValidators()
      .getQueryStatus(BondStatus.Bonded);

    const redelegatable = useMemo(() => {
      if (!fromValidatorAddress) {
        return [];
      }

      return bondedValidators.validatorsSortedByVotingPower
        .filter((val) => !blacklistValidators[val.operator_address])
        .filter((val) => {
          return val.operator_address !== fromValidatorAddress;
        });
    }, [
      blacklistValidators,
      bondedValidators.validatorsSortedByVotingPower,
      fromValidatorAddress,
    ]);

    const flatListValidatorData = useMemo(() => {
      return redelegatable.map((validator) => {
        const thumbnail = bondedValidators.getValidatorThumbnail(
          validator.operator_address
        );

        return { validator, thumbnail };
      });
    }, [bondedValidators, redelegatable]);

    const Validator: FunctionComponent<ValidatorProps> = observer(
      ({ validator, thumbnail }) => {
        const navigation = useNavigation();

        return (
          <RectButton
            onPress={() => {
              navigation.navigate("Redelegate", {
                fromValidatorAddress,
                toValidatorAddress: validator.operator_address,
              });
            }}
            rippleColor="#AAAAAA"
          >
            <View
              accessible
              style={{
                borderTopWidth: 0.5,
                borderTopColor: "#CDCDCD",
                paddingVertical: 12,
                paddingHorizontal: 16,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Image
                style={{
                  width: 20,
                  height: 20,
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
              <Text numberOfLines={1} style={subtitle2}>
                {validator.description.moniker}
              </Text>
            </View>
          </RectButton>
        );
      }
    );

    const renderValidator: FunctionComponent<{
      item: {
        validator: Staking.Validator;
        thumbnail: string;
      };
    }> = ({ item }) => (
      <Validator validator={item.validator} thumbnail={item.thumbnail} />
    );

    return (
      <SafeAreaFixedPage>
        <View style={sf([cardStyle, bgcWhite, shadow])}>
          <FlatList
            data={flatListValidatorData}
            renderItem={renderValidator}
            windowSize={5}
          />
        </View>
      </SafeAreaFixedPage>
    );
  }
);

type RedelegateScreenProps = {
  route: {
    params: {
      fromValidatorAddress: string;
      toValidatorAddress: string;
    };
  };
};

export const RedelegateScreen: FunctionComponent<RedelegateScreenProps> = observer(
  ({ route }) => {
    const { fromValidatorAddress, toValidatorAddress } = route.params;

    const navigation = useNavigation();

    const { chainStore, accountStore, queriesStore, priceStore } = useStore();

    const accountInfo = accountStore.getAccount(chainStore.current.chainId);

    const queries = queriesStore.get(chainStore.current.chainId);

    // It will be applied
    // const redelegateConfigs = useBasicTxConfig(
    //   chainStore,
    //   chainStore.current.chainId,
    //   accountInfo.msgOpts.redelegate,
    //   accountInfo.bech32Address,
    //   queries.getQueryBalances()
    // );

    const redelegateConfigs = useSendTxConfig(
      chainStore,
      chainStore.current.chainId,
      accountInfo.msgOpts.send,
      accountInfo.bech32Address,
      queries.getQueryBalances()
    );

    const redelegateConfigError =
      redelegateConfigs.amountConfig.getError() ??
      redelegateConfigs.memoConfig.getError() ??
      redelegateConfigs.gasConfig.getError() ??
      redelegateConfigs.feeConfig.getError();
    const redelegateConfigIsError = redelegateConfigError == null;

    return (
      <SafeAreaPage>
        <StakedCoinInput
          amountConfig={redelegateConfigs.amountConfig}
          feeConfig={redelegateConfigs.feeConfig}
          validatorAddress={fromValidatorAddress}
        />
        <MemoInput memoConfig={redelegateConfigs.memoConfig} />
        <FeeButtons
          feeConfig={redelegateConfigs.feeConfig}
          priceStore={priceStore}
        />
        <FlexButton
          title="Redelegate"
          disabled={!redelegateConfigIsError || !accountInfo.isReadyToSendMsgs}
          loading={accountInfo.isSendingMsg === "send"}
          onPress={async () => {
            if (accountInfo.isReadyToSendMsgs) {
              await accountInfo.sendBeginRedelegateMsg(
                redelegateConfigs.amountConfig.amount,
                fromValidatorAddress,
                toValidatorAddress,
                redelegateConfigs.memoConfig.memo,
                // It will be applied
                // redelegateConfigs.feeConfig.toStdFee(),
                () => {
                  navigation.dispatch(StackActions.pop(2));
                }
              );
              try {
              } catch (e) {}
            }
          }}
        />
      </SafeAreaPage>
    );
  }
);
