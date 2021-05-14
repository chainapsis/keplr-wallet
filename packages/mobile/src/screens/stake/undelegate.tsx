import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { SafeAreaPage } from "../../components/page";
import { MemoInput, FeeButtons, StakedCoinInput } from "../../components/form";
import { useSendTxConfig } from "@keplr-wallet/hooks";
import { FlexButton } from "../../components/buttons";
import { useNavigation } from "@react-navigation/native";

type UndelegateScreenProps = {
  route: {
    params: {
      validatorAddress: string;
    };
  };
};

export const UndelegateScreen: FunctionComponent<UndelegateScreenProps> = observer(
  ({ route }) => {
    const { validatorAddress } = route.params;

    const navigation = useNavigation();

    const { chainStore, accountStore, queriesStore, priceStore } = useStore();

    const accountInfo = accountStore.getAccount(chainStore.current.chainId);

    const queries = queriesStore.get(chainStore.current.chainId);

    // It will be applied
    // const undelegateConfigs = useBasicTxConfig(
    //   chainStore,
    //   chainStore.current.chainId,
    //   accountInfo.msgOpts.undelegate,
    //   accountInfo.bech32Address,
    //   queries.getQueryBalances()
    // );

    const undelegateConfigs = useSendTxConfig(
      chainStore,
      chainStore.current.chainId,
      accountInfo.msgOpts.send,
      accountInfo.bech32Address,
      queries.getQueryBalances()
    );

    const undelegateConfigError =
      undelegateConfigs.amountConfig.getError() ??
      undelegateConfigs.memoConfig.getError() ??
      undelegateConfigs.gasConfig.getError() ??
      undelegateConfigs.feeConfig.getError();
    const undelegateConfigIsError = undelegateConfigError == null;

    return (
      <SafeAreaPage>
        <StakedCoinInput
          amountConfig={undelegateConfigs.amountConfig}
          feeConfig={undelegateConfigs.feeConfig}
          validatorAddress={validatorAddress}
        />
        <MemoInput memoConfig={undelegateConfigs.memoConfig} />
        <FeeButtons
          feeConfig={undelegateConfigs.feeConfig}
          priceStore={priceStore}
        />
        <FlexButton
          title="Undelegate"
          disabled={!undelegateConfigIsError || !accountInfo.isReadyToSendMsgs}
          loading={accountInfo.isSendingMsg === "send"}
          onPress={async () => {
            if (accountInfo.isReadyToSendMsgs) {
              await accountInfo.sendUndelegateMsg(
                undelegateConfigs.amountConfig.amount,
                validatorAddress,
                undelegateConfigs.memoConfig.memo,
                // It will be applied
                // undelegateConfigs.feeConfig.toStdFee(),
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
