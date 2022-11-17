import React, { FunctionComponent, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { PageWithScrollView } from "../../../components/page";
import { useStyle } from "../../../styles";
import { RouteProp, useRoute } from "@react-navigation/native";
import { View } from "react-native";
import { useStore } from "../../../stores";
import { useDelegateTxConfig, useGasSimulator } from "@keplr-wallet/hooks";
import { AmountInput, FeeButtons, MemoInput } from "../../../components/input";
import { Button } from "../../../components/button";
import { useSmartNavigation } from "../../../navigation";
import { Staking } from "@keplr-wallet/stores";
import { AsyncKVStore } from "../../../common";

export const DelegateScreen: FunctionComponent = observer(() => {
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

  const { chainStore, accountStore, queriesStore, analyticsStore } = useStore();

  const style = useStyle();
  const smartNavigation = useSmartNavigation();

  const account = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);

  const sendConfigs = useDelegateTxConfig(
    chainStore,
    queriesStore,
    accountStore,
    chainStore.current.chainId,
    account.bech32Address
  );

  useEffect(() => {
    sendConfigs.recipientConfig.setRawRecipient(validatorAddress);
  }, [sendConfigs.recipientConfig, validatorAddress]);

  const sendConfigError =
    sendConfigs.recipientConfig.error ??
    sendConfigs.amountConfig.error ??
    sendConfigs.memoConfig.error ??
    sendConfigs.gasConfig.error ??
    sendConfigs.feeConfig.error;
  const txStateIsValid = sendConfigError == null;

  const bondedValidators = queries.cosmos.queryValidators.getQueryStatus(
    Staking.BondStatus.Bonded
  );

  const validator = bondedValidators.getValidator(validatorAddress);

  const gasSimulator = useGasSimulator(
    new AsyncKVStore("gas-simulator.screen.stake.delegate/delegate"),
    chainStore,
    chainStore.current.chainId,
    sendConfigs.gasConfig,
    sendConfigs.feeConfig,
    "native",
    () => {
      return account.cosmos.makeDelegateTx(
        sendConfigs.amountConfig.amount,
        validatorAddress
      );
    }
  );

  return (
    <PageWithScrollView
      backgroundMode="tertiary"
      style={style.flatten(["padding-x-page"])}
      contentContainerStyle={style.get("flex-grow-1")}
    >
      <View style={style.flatten(["height-page-pad"])} />
      {/*
        // The recipient validator is selected by the route params, so no need to show the address input.
        <AddressInput
          label="Recipient"
          recipientConfig={sendConfigs.recipientConfig}
        />
      */}
      {/*
      Delegate tx only can be sent with just stake currency. So, it is not needed to show the currency selector because the stake currency is one.
      <CurrencySelector
        label="Token"
        placeHolder="Select Token"
        amountConfig={sendConfigs.amountConfig}
      />
      */}
      <AmountInput label="Amount" amountConfig={sendConfigs.amountConfig} />
      <MemoInput label="Memo (Optional)" memoConfig={sendConfigs.memoConfig} />
      <FeeButtons
        label="Fee"
        gasLabel="gas"
        feeConfig={sendConfigs.feeConfig}
        gasConfig={sendConfigs.gasConfig}
        gasSimulator={gasSimulator}
      />
      <View style={style.flatten(["flex-1"])} />
      <Button
        text="Stake"
        size="large"
        disabled={!account.isReadyToSendMsgs || !txStateIsValid}
        loading={account.isSendingMsg === "delegate"}
        onPress={async () => {
          if (account.isReadyToSendMsgs && txStateIsValid) {
            try {
              const stdFee = sendConfigs.feeConfig.toStdFee();

              const tx = account.cosmos.makeDelegateTx(
                sendConfigs.amountConfig.amount,
                sendConfigs.recipientConfig.recipient
              );

              await tx.send(
                stdFee,
                sendConfigs.memoConfig.memo,
                {
                  preferNoSetMemo: true,
                  preferNoSetFee: true,
                },
                {
                  onBroadcasted: (txHash) => {
                    analyticsStore.logEvent("Delegate tx broadcasted", {
                      chainId: chainStore.current.chainId,
                      chainName: chainStore.current.chainName,
                      validatorName: validator?.description.moniker,
                      feeType: sendConfigs.feeConfig.feeType,
                    });
                    smartNavigation.pushSmart("TxPendingResult", {
                      txHash: Buffer.from(txHash).toString("hex"),
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
