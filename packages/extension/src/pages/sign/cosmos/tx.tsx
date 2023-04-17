import React, { FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import styled from "styled-components";
import { Stack } from "../../../components/stack";
import { BackButton } from "../../../layouts/header/components";
import { HeaderLayout } from "../../../layouts/header";
import { ColorPalette } from "../../../styles";
import { Box } from "../../../components/box";
import { Button } from "../../../components/button";
import { useStore } from "../../../stores";
import { useInteractionInfo } from "../../../hooks";
import { MessageItem } from "../components/message-item";
import {
  useFeeConfig,
  useMemoConfig,
  useSenderConfig,
  useSignDocAmountConfig,
  useSignDocHelper,
  useTxConfigsValidate,
  useZeroAllowedGasConfig,
} from "@keplr-wallet/hooks";
import { unescapeHTML } from "@keplr-wallet/common";
import { MemoInput } from "../../../components/input/memo-input";
import { Column, Columns } from "../../../components/column";
import { XAxis } from "../../../components/axis";
import { H5 } from "../../../components/typography";
import { CoinPretty, Int } from "@keplr-wallet/unit";
import { FeeControl } from "../../../components/input/fee-control";

const Styles = {
  BottomButton: styled.div`
    padding: 0.75rem;
  `,
};

export const SignCosmosTxPage: FunctionComponent = observer(() => {
  const { chainStore, signInteractionStore, queriesStore } = useStore();

  const [isRawData, setIsRawData] = useState(false);

  const chainId = (() => {
    if (signInteractionStore.waitingData?.data) {
      return signInteractionStore.waitingData.data.chainId;
    }
    return chainStore.chainInfos[0].chainId;
  })();
  const [signer, setSigner] = useState("");

  const senderConfig = useSenderConfig(chainStore, chainId, signer);
  // There are services that sometimes use invalid tx to sign arbitrary data on the sign page.
  // In this case, there is no obligation to deal with it, but 0 gas is favorably allowed.
  const gasConfig = useZeroAllowedGasConfig(chainStore, chainId, 0);
  const amountConfig = useSignDocAmountConfig(chainStore, chainId);
  const feeConfig = useFeeConfig(
    chainStore,
    queriesStore,
    chainId,
    senderConfig,
    amountConfig,
    gasConfig
  );
  const memoConfig = useMemoConfig(chainStore, chainId);

  const signDocHelper = useSignDocHelper(feeConfig, memoConfig);
  amountConfig.setSignDocHelper(signDocHelper);

  useEffect(() => {
    if (signInteractionStore.waitingData) {
      const data = signInteractionStore.waitingData;
      if (data.data.chainId !== data.data.signDocWrapper.chainId) {
        // Validate the requested chain id and the chain id in the sign doc are same.
        throw new Error("Chain id unmatched");
      }
      signDocHelper.setSignDocWrapper(data.data.signDocWrapper);
      gasConfig.setValue(data.data.signDocWrapper.gas);
      let memo = data.data.signDocWrapper.memo;
      if (data.data.signDocWrapper.mode === "amino") {
        // For amino-json sign doc, the memo is escaped by default behavior of golang's json marshaller.
        // For normal users, show the escaped characters with unescaped form.
        // Make sure that the actual sign doc's memo should be escaped.
        // In this logic, memo should be escaped from account store or background's request signing function.
        memo = unescapeHTML(memo);
      }
      memoConfig.setValue(memo);
      if (
        data.data.signOptions.preferNoSetFee &&
        data.data.signDocWrapper.fees[0]
      ) {
        feeConfig.setFee(
          data.data.signDocWrapper.fees.map((fee) => {
            const currency = chainStore
              .getChain(data.data.chainId)
              .forceFindCurrency(fee.denom);
            return new CoinPretty(currency, new Int(fee.amount));
          })
        );
      }
      amountConfig.setDisableBalanceCheck(
        !!data.data.signOptions.disableBalanceCheck
      );
      feeConfig.setDisableBalanceCheck(
        !!data.data.signOptions.disableBalanceCheck
      );
      // TODO
      // if (
      //   data.data.signDocWrapper.granter &&
      //   data.data.signDocWrapper.granter !== data.data.signer
      // ) {
      //   feeConfig.setDisableBalanceCheck(true);
      // }
      setSigner(data.data.signer);
    }
  }, [
    amountConfig,
    chainStore,
    gasConfig,
    memoConfig,
    feeConfig,
    signDocHelper,
    signInteractionStore.waitingData,
  ]);

  const msgs = signDocHelper.signDocWrapper
    ? signDocHelper.signDocWrapper.mode === "amino"
      ? signDocHelper.signDocWrapper.aminoSignDoc.msgs
      : signDocHelper.signDocWrapper.protoSignDoc.txMsgs
    : [];

  // If the preferNoSetFee or preferNoSetMemo in sign options is true,
  // don't show the fee buttons/memo input by default
  // But, the sign options would be removed right after the users click the approve/reject button.
  // Thus, without this state, the fee buttons/memo input would be shown after clicking the approve buttion.
  const [isProcessing, setIsProcessing] = useState(false);
  const needSetIsProcessing =
    signInteractionStore.waitingData?.data.signOptions.preferNoSetFee ===
      true ||
    signInteractionStore.waitingData?.data.signOptions.preferNoSetMemo === true;

  const preferNoSetFee =
    signInteractionStore.waitingData?.data.signOptions.preferNoSetFee ===
      true || isProcessing;
  const preferNoSetMemo =
    signInteractionStore.waitingData?.data.signOptions.preferNoSetMemo ===
      true || isProcessing;

  const interactionInfo = useInteractionInfo(() => {
    if (needSetIsProcessing) {
      setIsProcessing(true);
    }

    signInteractionStore.rejectAll();
  });

  const txConfigsValidate = useTxConfigsValidate({
    senderConfig,
    gasConfig,
    amountConfig,
    feeConfig,
    memoConfig,
  });

  return (
    <HeaderLayout
      title="Confirm Transaction"
      left={<BackButton />}
      bottom={
        <Styles.BottomButton>
          <Button
            text="Approve"
            color="primary"
            size="large"
            disabled={txConfigsValidate.interactionBlocked}
            onClick={async () => {
              if (signInteractionStore.waitingData) {
                await signInteractionStore.approveAndWaitEnd(
                  signInteractionStore.waitingData.data.signDocWrapper
                );

                if (
                  interactionInfo.interaction &&
                  !interactionInfo.interactionInternal
                ) {
                  window.close();
                }
              }
            }}
          />
        </Styles.BottomButton>
      }
    >
      <Box
        height="100%"
        padding="0.75rem"
        paddingBottom="0"
        style={{
          display: "flex",
          overflow: "scroll",
        }}
      >
        <Box marginBottom="0.5rem">
          <Columns sum={1} alignY="center">
            <XAxis>
              <H5
                style={{
                  color: ColorPalette["blue-400"],
                  marginRight: "0.25rem",
                }}
              >
                {msgs.length}
              </H5>
              <H5
                style={{
                  color: ColorPalette["gray-50"],
                }}
              >
                Messages
              </H5>
            </XAxis>
            <Column weight={1} />
            <Box
              onClick={() => {
                setIsRawData((v) => !v);
              }}
              cursor="pointer"
            >
              View data
            </Box>
          </Columns>
        </Box>

        <Box
          borderRadius="0.375rem"
          style={{
            flex: 1,
            overflow: "scroll",
          }}
        >
          <Box>
            {isRawData ? (
              <Box
                as={"pre"}
                backgroundColor={ColorPalette["gray-600"]}
                padding="1rem"
                // Remove normalized style of pre tag
                margin="0"
                style={{
                  width: "fit-content",
                }}
              >
                {JSON.stringify(signDocHelper.signDocJson, null, 2)}
              </Box>
            ) : (
              <Box>
                <MessageItem paragraph="From cosmosvalope...tqgfnp42" />
                <MessageItem paragraph="From cosmosvalope...tqgfnp42" />
                <MessageItem paragraph="From cosmosvalope...tqgfnp42" />

                <MessageItem
                  paragraph={`
                  type: osmosis/gamm/swap-exact- amount in
                  value:.   routes;
                  pool_id: ‘2’.          
                  token_out_denom: uiontype: osmosis/gamm/swap-exact- amount in
                  value:.   routes;
                  pool_id: ‘2’.          
                  token_out_denom: uion
                `}
                />
              </Box>
            )}
          </Box>
        </Box>

        <Box height="0" minHeight="1rem" />

        <Stack gutter="0.75rem">
          <MemoInput memoConfig={memoConfig} />
          <FeeControl
            feeConfig={feeConfig}
            senderConfig={senderConfig}
            gasConfig={gasConfig}
            disableAutomaticFeeSet={preferNoSetFee}
          />
        </Stack>
      </Box>
    </HeaderLayout>
  );
});
