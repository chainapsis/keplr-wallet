import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { SafeAreaPage } from "../../components/page";
import { CoinInput, MemoInput, FeeButtons } from "../../components/form";
import { useSendTxConfig } from "@keplr-wallet/hooks";
import { FlexButton } from "../../components/buttons";
import { useNavigation } from "@react-navigation/native";

type DelegateScreenProps = {
  route: {
    params: {
      validatorAddress: string;
    };
  };
};

export const DelegateScreen: FunctionComponent<DelegateScreenProps> = observer(
  ({ route }) => {
    const { validatorAddress } = route.params;

    const navigation = useNavigation();

    const { chainStore, accountStore, queriesStore, priceStore } = useStore();

    const accountInfo = accountStore.getAccount(chainStore.current.chainId);

    const queries = queriesStore.get(chainStore.current.chainId);

    // It will be applied
    // const delegateConfigs = useBasicTxConfig(
    //   chainStore,
    //   chainStore.current.chainId,
    //   accountInfo.msgOpts.delegate,
    //   accountInfo.bech32Address,
    //   queries.getQueryBalances()
    // );

    const delegateConfigs = useSendTxConfig(
      chainStore,
      chainStore.current.chainId,
      accountInfo.msgOpts.send,
      accountInfo.bech32Address,
      queries.getQueryBalances()
    );

    const delegateConfigError =
      delegateConfigs.amountConfig.getError() ??
      delegateConfigs.memoConfig.getError() ??
      delegateConfigs.gasConfig.getError() ??
      delegateConfigs.feeConfig.getError();
    const delegateConfigIsError = delegateConfigError == null;

    return (
      <SafeAreaPage>
        <CoinInput
          amountConfig={delegateConfigs.amountConfig}
          feeConfig={delegateConfigs.feeConfig}
          disableToken={true}
        />
        <MemoInput memoConfig={delegateConfigs.memoConfig} />
        <FeeButtons
          feeConfig={delegateConfigs.feeConfig}
          priceStore={priceStore}
        />
        <FlexButton
          title="Delegate"
          disabled={!delegateConfigIsError || !accountInfo.isReadyToSendMsgs}
          loading={accountInfo.isSendingMsg === "send"}
          onPress={async () => {
            if (accountInfo.isReadyToSendMsgs) {
              await accountInfo.sendDelegateMsg(
                delegateConfigs.amountConfig.amount,
                validatorAddress,
                delegateConfigs.memoConfig.memo,
                // It will be applied
                // delegateConfigs.feeConfig.toStdFee(),
                () => {
                  navigation.navigate("Home");
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
