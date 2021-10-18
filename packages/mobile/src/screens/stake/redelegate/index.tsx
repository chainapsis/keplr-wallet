import React, { FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useStore } from "../../../stores";
import { useStyle } from "../../../styles";
import { BondStatus } from "@keplr-wallet/stores/build/query/cosmos/staking/types";
import { useRedelegateTxConfig } from "@keplr-wallet/hooks";
import { PageWithScrollView } from "../../../components/page";
import { Card, CardBody, CardDivider } from "../../../components/card";
import { Text, View } from "react-native";
import { ValidatorThumbnail } from "../../../components/thumbnail";
import {
  AmountInput,
  FeeButtons,
  MemoInput,
  SelectorButtonWithoutModal,
} from "../../../components/input";
import { Button } from "../../../components/button";
import { useSmartNavigation } from "../../../navigation";

export const RedelegateScreen: FunctionComponent = observer(() => {
  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          validatorAddress: string;
        }
      >,
      string
    >
  >();

  const validatorAddress = route.params.validatorAddress;

  const smartNavigation = useSmartNavigation();

  const { chainStore, accountStore, queriesStore, analyticsStore } = useStore();

  const style = useStyle();

  const account = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);

  const srcValidator =
    queries.cosmos.queryValidators
      .getQueryStatus(BondStatus.Bonded)
      .getValidator(validatorAddress) ||
    queries.cosmos.queryValidators
      .getQueryStatus(BondStatus.Unbonding)
      .getValidator(validatorAddress) ||
    queries.cosmos.queryValidators
      .getQueryStatus(BondStatus.Unbonded)
      .getValidator(validatorAddress);

  const srcValidatorThumbnail = srcValidator
    ? queries.cosmos.queryValidators
        .getQueryStatus(BondStatus.Bonded)
        .getValidatorThumbnail(validatorAddress) ||
      queries.cosmos.queryValidators
        .getQueryStatus(BondStatus.Unbonding)
        .getValidatorThumbnail(validatorAddress) ||
      queries.cosmos.queryValidators
        .getQueryStatus(BondStatus.Unbonded)
        .getValidatorThumbnail(validatorAddress)
    : undefined;

  const staked = queries.cosmos.queryDelegations
    .getQueryBech32Address(account.bech32Address)
    .getDelegationTo(validatorAddress);

  const sendConfigs = useRedelegateTxConfig(
    chainStore,
    chainStore.current.chainId,
    account.msgOpts["undelegate"].gas,
    account.bech32Address,
    queries.queryBalances,
    queries.cosmos.queryDelegations,
    validatorAddress
  );

  const [dstValidatorAddress, setDstValidatorAddress] = useState("");

  const dstValidator =
    queries.cosmos.queryValidators
      .getQueryStatus(BondStatus.Bonded)
      .getValidator(dstValidatorAddress) ||
    queries.cosmos.queryValidators
      .getQueryStatus(BondStatus.Unbonding)
      .getValidator(dstValidatorAddress) ||
    queries.cosmos.queryValidators
      .getQueryStatus(BondStatus.Unbonded)
      .getValidator(dstValidatorAddress);

  useEffect(() => {
    sendConfigs.recipientConfig.setRawRecipient(dstValidatorAddress);
  }, [dstValidatorAddress, sendConfigs.recipientConfig]);

  const sendConfigError =
    sendConfigs.recipientConfig.getError() ??
    sendConfigs.amountConfig.getError() ??
    sendConfigs.memoConfig.getError() ??
    sendConfigs.gasConfig.getError() ??
    sendConfigs.feeConfig.getError();
  const txStateIsValid = sendConfigError == null;

  return (
    <PageWithScrollView
      style={style.flatten(["padding-x-page"])}
      contentContainerStyle={style.get("flex-grow-1")}
    >
      <View style={style.flatten(["height-page-pad"])} />
      <Card style={style.flatten(["margin-bottom-12", "border-radius-8"])}>
        <CardBody>
          <View style={style.flatten(["flex-row", "items-center"])}>
            <ValidatorThumbnail
              style={style.flatten(["margin-right-12"])}
              size={36}
              url={srcValidatorThumbnail}
            />
            <Text style={style.flatten(["h6", "color-text-black-high"])}>
              {srcValidator ? srcValidator.description.moniker : "..."}
            </Text>
          </View>
          <CardDivider
            style={style.flatten([
              "margin-x-0",
              "margin-top-8",
              "margin-bottom-15",
            ])}
          />
          <View style={style.flatten(["flex-row", "items-center"])}>
            <Text
              style={style.flatten(["subtitle2", "color-text-black-medium"])}
            >
              Staked
            </Text>
            <View style={style.get("flex-1")} />
            <Text style={style.flatten(["body2", "color-text-black-medium"])}>
              {staked.trim(true).shrink(true).maxDecimals(6).toString()}
            </Text>
          </View>
        </CardBody>
      </Card>
      {/*
        // The recipient validator is selected by the route params, so no need to show the address input.
        <AddressInput
          label="Recipient"
          recipientConfig={sendConfigs.recipientConfig}
        />
      */}
      {/*
      Undelegate tx only can be sent with just stake currency. So, it is not needed to show the currency selector because the stake currency is one.
      <CurrencySelector
        label="Token"
        placeHolder="Select Token"
        amountConfig={sendConfigs.amountConfig}
      />
      */}
      <SelectorButtonWithoutModal
        label="Redelegate to"
        placeHolder="Select Validator"
        selected={
          dstValidator
            ? {
                key: dstValidatorAddress,
                label: dstValidator.description.moniker || dstValidatorAddress,
              }
            : undefined
        }
        onPress={() => {
          smartNavigation.pushSmart("Validator.List", {
            validatorSelector: (validatorAddress: string) => {
              setDstValidatorAddress(validatorAddress);
            },
          });
        }}
      />
      <AmountInput label="Amount" amountConfig={sendConfigs.amountConfig} />
      <MemoInput label="Memo (Optional)" memoConfig={sendConfigs.memoConfig} />
      <FeeButtons
        label="Fee"
        gasLabel="gas"
        feeConfig={sendConfigs.feeConfig}
        gasConfig={sendConfigs.gasConfig}
      />
      <View style={style.flatten(["flex-1"])} />
      <Button
        text="Switch Validator"
        size="large"
        disabled={!account.isReadyToSendMsgs || !txStateIsValid}
        loading={account.isSendingMsg === "redelegate"}
        onPress={async () => {
          if (account.isReadyToSendMsgs && txStateIsValid) {
            try {
              await account.cosmos.sendBeginRedelegateMsg(
                sendConfigs.amountConfig.amount,
                sendConfigs.srcValidatorAddress,
                sendConfigs.dstValidatorAddress,
                sendConfigs.memoConfig.memo,
                sendConfigs.feeConfig.toStdFee(),
                {
                  preferNoSetMemo: true,
                  preferNoSetFee: true,
                },
                {
                  onBroadcasted: (txHash) => {
                    smartNavigation.pushSmart("TxPendingResult", {
                      txHash: Buffer.from(txHash).toString("hex"),
                    });
                  },
                  onFulfill: (tx) => {
                    const isSuccess = tx.code == null || tx.code === 0;
                    analyticsStore.logEvent("Redelgate finished", {
                      chainId: chainStore.current.chainId,
                      chainName: chainStore.current.chainName,
                      validatorName: srcValidator?.description.moniker,
                      toValidatorName: dstValidator?.description.moniker,
                      feeType: sendConfigs.feeConfig.feeType,
                      isSuccess,
                    });
                  },
                }
              );
            } catch (e) {
              if (e?.message === "Request rejected") {
                return;
              }
              console.log(e);
              smartNavigation.navigateSmart("Home", {});
            }
          }
        }}
      />
      <View style={style.flatten(["height-page-pad"])} />
    </PageWithScrollView>
  );
});
