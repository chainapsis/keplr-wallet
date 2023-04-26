import React, { FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { Stack } from "../../../components/stack";
import { BackButton } from "../../../layouts/header/components";
import { HeaderLayout } from "../../../layouts/header";
import { ColorPalette } from "../../../styles";
import { Box } from "../../../components/box";
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
import { ViewDataButton } from "../components/view-data-button";

export const SignCosmosTxPage: FunctionComponent = observer(() => {
  const { chainStore, signInteractionStore, queriesStore } = useStore();

  const [isViewData, setIsViewData] = useState(false);

  const chainId = (() => {
    if (signInteractionStore.waitingData?.data) {
      return signInteractionStore.waitingData.data.chainId;
    }
    return chainStore.chainInfos[0].chainId;
  })();
  const signer = (() => {
    if (signInteractionStore.waitingData?.data) {
      return signInteractionStore.waitingData.data.signer;
    }
    return "";
  })();

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

  const interactionInfo = useInteractionInfo(() => {
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
      fixedHeight={true}
      left={<BackButton />}
      bottomButton={{
        text: "Approve",
        color: "primary",
        size: "large",
        disabled:
          signInteractionStore.waitingData == null ||
          txConfigsValidate.interactionBlocked,
        isLoading: signInteractionStore.isObsoleteInteraction(
          signInteractionStore.waitingData?.id
        ),
        onClick: async () => {
          if (signInteractionStore.waitingData) {
            await signInteractionStore.approveWithProceedNext(
              signInteractionStore.waitingData.id,
              signInteractionStore.waitingData.data.signDocWrapper,
              (proceedNext) => {
                if (!proceedNext) {
                  if (
                    interactionInfo.interaction &&
                    !interactionInfo.interactionInternal
                  ) {
                    window.close();
                  }
                }
              }
            );
          }
        },
      }}
    >
      <Box
        height="100%"
        padding="0.75rem"
        paddingBottom="0"
        style={{
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
            <ViewDataButton
              isViewData={isViewData}
              setIsViewData={setIsViewData}
            />
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
            {isViewData ? (
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
            disableAutomaticFeeSet={
              signInteractionStore.waitingData?.data.signOptions.preferNoSetFee
            }
          />
        </Stack>
      </Box>
    </HeaderLayout>
  );
});
