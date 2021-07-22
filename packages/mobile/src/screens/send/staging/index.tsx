import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { useSendTxConfig } from "@keplr-wallet/hooks";
import { useStore } from "../../../stores";
import { EthereumEndpoint } from "../../../config";
import { PageWithScrollView } from "../../../components/staging/page";
import { View } from "react-native";
import {
  AddressInput,
  AmountInput,
  MemoInput,
  CurrencySelector,
  FeeButtons,
} from "../../../components/staging/input";
import { useStyle } from "../../../styles";
import { Button } from "../../../components/staging/button";

export const SendScreen: FunctionComponent = observer(() => {
  const { chainStore, accountStore, queriesStore } = useStore();

  const style = useStyle();

  const account = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);

  const sendConfigs = useSendTxConfig(
    chainStore,
    chainStore.current.chainId,
    account.msgOpts["send"],
    account.bech32Address,
    queries.queryBalances,
    EthereumEndpoint
  );

  const sendConfigError =
    sendConfigs.recipientConfig.getError() ??
    sendConfigs.amountConfig.getError() ??
    sendConfigs.memoConfig.getError() ??
    sendConfigs.gasConfig.getError() ??
    sendConfigs.feeConfig.getError();
  const txStateIsValid = sendConfigError == null;

  return (
    <PageWithScrollView contentContainerStyle={style.get("flex-grow-1")}>
      <AddressInput
        label="Recipient"
        recipientConfig={sendConfigs.recipientConfig}
      />
      <CurrencySelector
        label="Token"
        placeHolder="Select Token"
        amountConfig={sendConfigs.amountConfig}
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
        text="Send"
        size="large"
        disabled={!account.isReadyToSendMsgs || !txStateIsValid}
        loading={account.isSendingMsg === "send"}
        onPress={async () => {
          if (account.isReadyToSendMsgs && txStateIsValid) {
            // TODO: Notify the result.
            try {
              await account.sendToken(
                sendConfigs.amountConfig.amount,
                sendConfigs.amountConfig.sendCurrency,
                sendConfigs.recipientConfig.recipient,
                sendConfigs.memoConfig.memo
              );
            } catch (e) {
              console.log(e);
            }
          }
        }}
      />
    </PageWithScrollView>
  );
});
