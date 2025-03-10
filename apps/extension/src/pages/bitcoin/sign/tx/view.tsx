import React, { FunctionComponent, useState } from "react";
import { SignBitcoinTxInteractionStore } from "@keplr-wallet/stores-core";
import { handleExternalInteractionWithNoProceedNext } from "../../../../utils";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";
import { useInteractionInfo } from "../../../../hooks";
import { useUnmount } from "../../../../hooks/use-unmount";
import { BackButton } from "../../../../layouts/header/components";
import { HeaderLayout } from "../../../../layouts/header";
import { useIntl } from "react-intl";
import {
  useFeeConfig,
  useNoopAmountConfig,
  useNoopTxSizeConfig,
  useSenderConfig,
  useZeroAllowedFeeRateConfig,
  //   useTxConfigsValidate,
} from "@keplr-wallet/hooks-bitcoin";
import { Box } from "../../../../components/box";
import { ColorPalette } from "../../../../styles";
import { useTheme } from "styled-components";
import { H5 } from "../../../../components/typography";
import { Column, Columns } from "../../../../components/column";
import { XAxis } from "../../../../components/axis";
import { ViewDataButton } from "../../../sign/components/view-data-button";
import { useNavigate } from "react-router";
import { ApproveIcon, CancelIcon } from "../../../../components/button";
import { FeeSummary } from "../../components/input/fee-summary";

export const SignBitcoinTxView: FunctionComponent<{
  interactionData: NonNullable<SignBitcoinTxInteractionStore["waitingData"]>;
}> = observer(({ interactionData }) => {
  const {
    signBitcoinTxInteractionStore,
    // bitcoinAccountStore,
    bitcoinQueriesStore,
  } = useStore();

  const theme = useTheme();
  const { chainStore } = useStore();

  const intl = useIntl();
  const interactionInfo = useInteractionInfo({
    onUnmount: async () => {
      await signBitcoinTxInteractionStore.rejectWithProceedNext(
        interactionData.id,
        () => {}
      );
    },
  });

  const navigate = useNavigate();

  const chainId = interactionData.data.chainId;

  const modularChainInfo = chainStore.getModularChain(chainId);
  if (!("bitcoin" in modularChainInfo)) {
    throw new Error(`${modularChainInfo.chainId} is not bitcoin chain`);
  }
  //   const bitcoin = modularChainInfo.bitcoin;

  const senderConfig = useSenderConfig(
    chainStore,
    chainId,
    interactionData.data.address
  );

  // dummy configs for tx size and fee rate
  // 비트코인 트랜잭션은 utxo 기반이라 서명 페이지에서 fee rate 또는 tx size를 조정하여
  // 수수료를 재계산하려면 utxo 조합을 새로 생성해야 하는 굉장한 번거로움이 있다.
  // 따라서 psbt를 파싱하여 전체 입력의 합에서 출력의 합을 빼서 수수료만 따로 계산한다.
  const zeroAllowedFeeRateConfig = useZeroAllowedFeeRateConfig(
    chainStore,
    bitcoinQueriesStore,
    chainId,
    0
  );
  const noopTxSizeConfig = useNoopTxSizeConfig(chainStore, chainId);

  const amountConfig = useNoopAmountConfig(chainStore, chainId, senderConfig);

  const feeConfig = useFeeConfig(
    chainStore,
    bitcoinQueriesStore,
    chainId,
    senderConfig,
    amountConfig,
    noopTxSizeConfig,
    zeroAllowedFeeRateConfig
  );

  // TODO: psbt parsing해서 amount, fee 추출해서 넣어줘야함.

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

  const [isViewData, setIsViewData] = useState(false);

  useUnmount(() => {
    unmountPromise.resolver();
  });

  //   const txConfigsValidate = useTxConfigsValidate({
  //     amountConfig,
  //     senderConfig,
  //     feeRateConfig,
  //     feeConfig,
  //   });

  //   const buttonDisabled = txConfigsValidate.interactionBlocked;
  const isLoading = signBitcoinTxInteractionStore.isObsoleteInteractionApproved(
    interactionData.id
  );

  const approve = async () => {
    try {
      const feeCurrency = chainStore
        .getModularChainInfoImpl(chainId)
        .getCurrencies("bitcoin")[0];
      if (!feeCurrency) {
        throw new Error("Can't find fee currency");
      }

      let psbtHex = "";
      let psbtsHexes: string[] = [];
      if ("psbtHex" in interactionData.data) {
        psbtHex = interactionData.data.psbtHex;
      } else if ("psbtsHexes" in interactionData.data) {
        psbtsHexes = interactionData.data.psbtsHexes;
      } else {
        throw new Error("Invalid interaction data");
      }

      await signBitcoinTxInteractionStore.approveWithProceedNext(
        interactionData.id,
        psbtHex,
        "",
        psbtsHexes,
        [],
        async (proceedNext) => {
          if (!proceedNext) {
            if (
              interactionInfo.interaction &&
              !interactionInfo.interactionInternal
            ) {
              handleExternalInteractionWithNoProceedNext();
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
    }
  };

  return (
    <HeaderLayout
      title={intl.formatMessage({ id: "page.sign.cosmos.tx.title" })}
      fixedHeight={true}
      left={
        <BackButton
          hidden={
            interactionInfo.interaction && !interactionInfo.interactionInternal
          }
        />
      }
      // 유저가 enter를 눌러서 우발적으로(?) approve를 누르지 않도록 onSubmit을 의도적으로 사용하지 않았음.
      bottomButtons={[
        {
          textOverrideIcon: (
            <CancelIcon
              color={
                theme.mode === "light"
                  ? ColorPalette["blue-400"]
                  : ColorPalette["gray-200"]
              }
            />
          ),
          size: "large",
          color: "secondary",
          style: {
            width: "3.25rem",
          },
          onClick: async () => {
            await signBitcoinTxInteractionStore.rejectWithProceedNext(
              interactionData.id,
              (proceedNext) => {
                if (!proceedNext) {
                  if (
                    interactionInfo.interaction &&
                    !interactionInfo.interactionInternal
                  ) {
                    handleExternalInteractionWithNoProceedNext();
                  } else if (
                    interactionInfo.interaction &&
                    interactionInfo.interactionInternal
                  ) {
                    window.history.length > 1 ? navigate(-1) : navigate("/");
                  } else {
                    navigate("/", { replace: true });
                  }
                }
              }
            );
          },
        },
        {
          isSpecial: true,
          text: intl.formatMessage({ id: "button.approve" }),
          size: "large",
          left: !isLoading && <ApproveIcon />,
          //   disabled: buttonDisabled,
          isLoading,
          onClick: approve,
        },
      ]}
    >
      <Box
        height="100%"
        padding="0.75rem 0.75rem 0"
        style={{
          overflow: "auto",
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
                Signing...
              </H5>
              {/* <H5
                style={{
                  color:
                    theme.mode === "light"
                      ? ColorPalette["gray-500"]
                      : ColorPalette["gray-50"],
                }}
              >
                {interactionData.data.transactions.length > 1 && (
                  <FormattedMessage id="page.sign.starknet.tx.calls" />
                )}
              </H5> */}
            </XAxis>
            <Column weight={1} />
            <ViewDataButton
              isViewData={isViewData}
              setIsViewData={setIsViewData}
            />
          </Columns>
        </Box>

        <div style={{ marginTop: "0.75rem", flex: 1 }} />

        <FeeSummary feeConfig={feeConfig} />
      </Box>
    </HeaderLayout>
  );
});

// const noop = (..._args: any[]) => {
//   // noop
// };
