import React, { FunctionComponent, useEffect, useState } from "react";
import { SignInteractionStore } from "@keplr-wallet/stores";
import { Box } from "../../../../components/box";
import { Column, Columns } from "../../../../components/column";
import { XAxis } from "../../../../components/axis";
import { H5, Subtitle3 } from "../../../../components/typography";
import { ColorPalette } from "../../../../styles";
import { ViewDataButton } from "../../components/view-data-button";
import { MessageItem } from "../../components/message-item";
import { Stack } from "../../../../components/stack";
import { MemoInput } from "../../../../components/input/memo-input";
import { FeeControl } from "../../../../components/input/fee-control";
import { observer } from "mobx-react-lite";
import {
  useFeeConfig,
  useMemoConfig,
  useSenderConfig,
  useSignDocAmountConfig,
  useSignDocHelper,
  useTxConfigsValidate,
  useZeroAllowedGasConfig,
} from "@keplr-wallet/hooks";
import { useStore } from "../../../../stores";
import { unescapeHTML } from "@keplr-wallet/common";
import { CoinPretty, Int } from "@keplr-wallet/unit";
import { BackButton } from "../../../../layouts/header/components";
import { HeaderLayout } from "../../../../layouts/header";
import { useInteractionInfo } from "../../../../hooks";
import { defaultRegistry } from "../../components/messages/registry";
import { useUnmount } from "../../../../hooks/use-unmount";
import { handleCosmosPreSign } from "../../utils/handle-cosmos-sign";
import { KeplrError } from "@keplr-wallet/router";
import { ErrModuleLedgerSign } from "../../utils/ledger-types";
import { LedgerGuideBox } from "../../components/ledger-guide-box";
import { Gutter } from "../../../../components/gutter";
import { GuideBox } from "../../../../components/guide-box";

/**
 * 서명을 처리할때 웹페이지에서 연속적으로 서명을 요청했을 수 있고
 * 그러면 서명할 데이터에 대해서 FIFO 순으로 순차적으로 UI에서 표시하고 처리해준다.
 * 하지만 문제는 tx관련된 hook들은 구현의 간단함을 위해서 한 컴포넌트 라이프사이클에서
 * 하나의 tx에 대해서만 처리하고 이후 다른 tx가 필요하다고 다시 초기화하거나 할 수 없도록 되어있다.
 * 이 문제 때문에 각 서명 데이터에 대해서 처리되고 나면 그 컴포넌트는 unmount되고
 * 같은 컴포넌트가 새롭게 mount되어야 한다.
 * 그렇기 때문에 처리 로직이 완전히 이 컴포넌트로 분리되어있고
 * 이 컴포넌트를 호출하는 쪽에서 "key" prop을 통해서 위의 요구사항을 꼭 만족시켜야한다.
 * 또한 prop으로 받는 "interactionData"는 절대로 불변해야한다.
 */
export const CosmosTxView: FunctionComponent<{
  interactionData: NonNullable<SignInteractionStore["waitingData"]>;
}> = observer(({ interactionData }) => {
  const { chainStore, queriesStore, signInteractionStore } = useStore();

  const [isViewData, setIsViewData] = useState(false);

  const chainId = interactionData.data.chainId;
  const signer = interactionData.data.signer;

  const senderConfig = useSenderConfig(chainStore, chainId, signer);
  // There are services that sometimes use invalid tx to sign arbitrary data on the sign page.
  // In this case, there is no obligation to deal with it, but 0 gas is favorably allowed.
  const gasConfig = useZeroAllowedGasConfig(chainStore, chainId, 0);
  const amountConfig = useSignDocAmountConfig(
    chainStore,
    chainId,
    senderConfig
  );
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
    const data = interactionData;
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
      data.data.signOptions.preferNoSetFee ||
      // 자동으로 fee를 다뤄줄 수 있는건 fee가 하나인 경우이다.
      // fee가 여러개인 경우는 일반적인 경우가 아니기 때문에
      // 케플러에서 처리해줄 수 없다. 그러므로 옵션을 무시하고 fee 설정을 각 웹사이트에 맡긴다.
      data.data.signDocWrapper.fees.length >= 2
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
    // We can't check the fee balance if the granter is not the signer.
    if (
      data.data.signDocWrapper.granter &&
      data.data.signDocWrapper.granter !== data.data.signer
    ) {
      feeConfig.setDisableBalanceCheck(true);
    }
  }, [
    amountConfig,
    chainStore,
    feeConfig,
    gasConfig,
    interactionData,
    memoConfig,
    signDocHelper,
  ]);

  const msgs = signDocHelper.signDocWrapper
    ? signDocHelper.signDocWrapper.mode === "amino"
      ? signDocHelper.signDocWrapper.aminoSignDoc.msgs
      : signDocHelper.signDocWrapper.protoSignDoc.txMsgs
    : [];

  const txConfigsValidate = useTxConfigsValidate({
    senderConfig,
    gasConfig,
    amountConfig,
    feeConfig,
    memoConfig,
  });

  const preferNoSetFee = (() => {
    // 자동으로 fee를 다뤄줄 수 있는건 fee가 하나인 경우이다.
    // fee가 여러개인 경우는 일반적인 경우가 아니기 때문에
    // 케플러에서 처리해줄 수 없다. 그러므로 옵션을 무시하고 fee 설정을 각 웹사이트에 맡긴다.
    if (interactionData.data.signDocWrapper.fees.length >= 2) {
      return true;
    }

    return interactionData.data.signOptions.preferNoSetFee;
  })();

  const preferNoSetMemo = interactionData.data.signOptions.preferNoSetMemo;

  const interactionInfo = useInteractionInfo();

  const [unmountPromise] = useState(() => {
    let resolver: () => void;
    const promise = new Promise<void>((resolve) => {
      resolver = resolve;
    });

    return {
      promise,
      resolver: resolver!,
    };
  });

  useUnmount(() => {
    unmountPromise.resolver();
  });

  const isLedgerAndDirect =
    interactionData.data.keyType === "ledger" &&
    interactionData.data.mode === "direct";

  const [isLedgerInteracting, setIsLedgerInteracting] = useState(false);
  const [ledgerInteractingError, setLedgerInteractingError] = useState<
    Error | undefined
  >(undefined);

  const buttonDisabled =
    txConfigsValidate.interactionBlocked ||
    !signDocHelper.signDocWrapper ||
    isLedgerAndDirect;

  const approve = async () => {
    if (signDocHelper.signDocWrapper) {
      if (interactionData.data.keyType === "ledger") {
        setIsLedgerInteracting(true);
        setLedgerInteractingError(undefined);
      }

      try {
        const signature = await handleCosmosPreSign(
          interactionData,
          signDocHelper.signDocWrapper
        );

        await signInteractionStore.approveWithProceedNext(
          interactionData.id,
          signDocHelper.signDocWrapper,
          signature,
          async (proceedNext) => {
            if (!proceedNext) {
              if (
                interactionInfo.interaction &&
                !interactionInfo.interactionInternal
              ) {
                window.close();
              }
            }

            if (
              interactionInfo.interaction &&
              interactionInfo.interactionInternal
            ) {
              // XXX: 약간 난해한 부분인데
              //      내부의 tx의 경우에는 tx 이후의 routing을 요청한 쪽에서 처리한다.
              //      하지만 tx를 처리할때 tx broadcast 등의 과정이 있고
              //      서명 페이지에서는 이러한 과정이 끝났는지 아닌지를 파악하기 힘들다.
              //      만약에 밑과같은 처리를 하지 않으면 interaction data가 먼저 지워지면서
              //      화면이 깜빡거리는 문제가 발생한다.
              //      이 문제를 해결하기 위해서 내부의 tx는 보내는 쪽에서 routing을 잘 처리한다고 가정하고
              //      페이지를 벗어나고 나서야 data를 지우도록한다.
              await unmountPromise.promise;
            }
          },
          {
            // XXX: 단지 special button의 애니메이션을 보여주기 위해서 delay를 넣음...ㅋ;
            preDelay: 200,
          }
        );
      } catch (e) {
        console.log(e);

        if (e instanceof KeplrError) {
          if (e.module === ErrModuleLedgerSign) {
            setLedgerInteractingError(e);
          } else {
            setLedgerInteractingError(undefined);
          }
        } else {
          setLedgerInteractingError(undefined);
        }
      } finally {
        setIsLedgerInteracting(false);
      }
    }
  };

  return (
    <HeaderLayout
      title="Confirm Transaction"
      fixedHeight={true}
      left={
        <BackButton
          hidden={
            interactionInfo.interaction && !interactionInfo.interactionInternal
          }
        />
      }
      // 유저가 enter를 눌러서 우발적으로(?) approve를 누르지 않도록 onSubmit을 의도적으로 사용하지 않았음.
      bottomButton={{
        isSpecial: true,
        text: "Approve",
        size: "large",
        disabled: buttonDisabled,
        isLoading:
          signInteractionStore.isObsoleteInteraction(interactionData.id) ||
          isLedgerInteracting,
        onClick: approve,
      }}
    >
      <Box
        height="100%"
        padding="0.75rem"
        paddingBottom="0"
        style={{
          overflow: "auto",
        }}
      >
        <Box
          marginBottom="0.5rem"
          style={{
            opacity: isLedgerAndDirect ? 0.5 : undefined,
          }}
        >
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
          className="show-scrollbar"
          borderRadius="0.375rem"
          backgroundColor={ColorPalette["gray-600"]}
          style={{
            flex: !isViewData ? "0 1 auto" : 1,
            overflow: "auto",
            opacity: isLedgerAndDirect ? 0.5 : undefined,
          }}
        >
          <Box>
            {isViewData ? (
              <Box
                as={"pre"}
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
              <Box
                style={{
                  width: "fit-content",
                  minWidth: "100%",
                }}
              >
                {msgs.map((msg, i) => {
                  const r = defaultRegistry.render(chainId, msg);

                  return (
                    <MessageItem
                      key={i}
                      icon={r.icon}
                      title={r.title}
                      content={r.content}
                    />
                  );
                })}
              </Box>
            )}
          </Box>
        </Box>

        {!isViewData ? <div style={{ flex: 1 }} /> : null}
        <Box height="0" minHeight="1rem" />

        <Box
          style={{
            opacity: isLedgerAndDirect ? 0.5 : undefined,
          }}
        >
          <Stack gutter="0.75rem">
            {preferNoSetMemo ? (
              <ReadonlyMemo memo={memoConfig.memo} />
            ) : (
              <MemoInput memoConfig={memoConfig} />
            )}

            <FeeControl
              feeConfig={feeConfig}
              senderConfig={senderConfig}
              gasConfig={gasConfig}
              disableAutomaticFeeSet={preferNoSetFee}
            />
          </Stack>
        </Box>

        {isLedgerAndDirect ? (
          <React.Fragment>
            <Gutter size="0.75rem" />
            <GuideBox
              color="warning"
              title="Incompatible Signing Requested"
              paragraph="Error: SIGN_MODE_DIRECT can’t be signed on Ledger. Contact the web app provider to fix this issue."
            />
          </React.Fragment>
        ) : null}

        <LedgerGuideBox
          data={{
            keyInsensitive: interactionData.data.keyInsensitive,
            isEthereum:
              "eip712" in interactionData.data &&
              interactionData.data.eip712 != null,
          }}
          isLedgerInteracting={isLedgerInteracting}
          ledgerInteractingError={ledgerInteractingError}
        />
      </Box>
    </HeaderLayout>
  );
});

const ReadonlyMemo: FunctionComponent<{
  memo: string;
}> = ({ memo }) => {
  return (
    <Box
      backgroundColor={ColorPalette["gray-600"]}
      padding="1rem"
      borderRadius="0.375rem"
    >
      <XAxis alignY="center">
        <Subtitle3 color={ColorPalette["gray-200"]}>Memo</Subtitle3>
        <Gutter size="1.5rem" direction="horizontal" />
        <Subtitle3
          color={memo ? ColorPalette["gray-50"] : ColorPalette["gray-300"]}
          style={{
            flex: 1,

            textAlign: "right",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {memo || "(Empty)"}
        </Subtitle3>
      </XAxis>
    </Box>
  );
};
