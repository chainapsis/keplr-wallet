import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router";
import { SignBitcoinMessageInteractionStore } from "@keplr-wallet/stores-core";
import React, { FunctionComponent, useState } from "react";
import { useStore } from "../../../../stores";
import { useTheme } from "styled-components";
import { useIntl } from "react-intl";
import { useInteractionInfo } from "../../../../hooks";
import { useUnmount } from "../../../../hooks/use-unmount";
import { handleExternalInteractionWithNoProceedNext } from "../../../../utils";
import { KeplrError } from "@keplr-wallet/router";
import { ErrModuleLedgerSign } from "../../../sign/utils/ledger-types";
import { CancelIcon } from "../../../../components/button/cancel-icon";
import { BackButton } from "../../../../layouts/header/components";
import { HeaderLayout } from "../../../../layouts/header";
import { ColorPalette } from "../../../../styles";
import { ApproveIcon } from "../../../../components/button";
import { Gutter } from "../../../../components/gutter";
import { LedgerGuideBox } from "../../../sign/components/ledger-guide-box";
import { ArbitraryMsgDataView } from "../../../sign/components/arbitrary-message/arbitrary-message-data-view";
import { ArbitraryMsgSignHeader } from "../../../sign/components/arbitrary-message/arbitrary-message-header";
import { ArbitraryMsgRequestOrigin } from "../../../sign/components/arbitrary-message/arbitrary-message-origin";
import { ArbitraryMsgWalletDetails } from "../../../sign/components/arbitrary-message/arbitrary-message-wallet-details";
import { Box } from "../../../../components/box";
import { connectAndSignMessageWithLedger } from "../../../sign/utils/handle-bitcoin-sign";

export const SignBitcoinMessageView: FunctionComponent<{
  interactionData: NonNullable<
    SignBitcoinMessageInteractionStore["waitingData"]
  >;
}> = observer(({ interactionData }) => {
  const { signBitcoinMessageInteractionStore, uiConfigStore } = useStore();

  const theme = useTheme();
  const navigate = useNavigate();

  const { chainStore } = useStore();

  const intl = useIntl();
  const interactionInfo = useInteractionInfo({
    onUnmount: async () => {
      await signBitcoinMessageInteractionStore.rejectWithProceedNext(
        interactionData.id,
        () => {}
      );
    },
  });

  const chainId = interactionData.data.chainId;

  const modularChainInfo = chainStore.getModularChain(chainId);
  if (!("bitcoin" in modularChainInfo)) {
    throw new Error(`${modularChainInfo.chainId} is not bitcoin chain`);
  }

  const isTestnet = modularChainInfo.bitcoin.bip44.coinType === 1;

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

  const [isLedgerInteracting, setIsLedgerInteracting] = useState(false);
  const [ledgerInteractingError, setLedgerInteractingError] = useState<
    Error | undefined
  >(undefined);

  useUnmount(() => {
    unmountPromise.resolver();
  });

  const approve = async () => {
    try {
      let signature: string | undefined = undefined;
      if (interactionData.data.keyType === "ledger") {
        setIsLedgerInteracting(true);
        setLedgerInteractingError(undefined);

        signature = await connectAndSignMessageWithLedger(
          interactionData,
          modularChainInfo,
          {
            useWebHID: uiConfigStore.useWebHIDLedger,
          }
        );
      }

      await signBitcoinMessageInteractionStore.approveWithProceedNext(
        interactionData.id,
        interactionData.data.message,
        signature,
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
  };

  const signerInfo = {
    name:
      typeof interactionData.data.keyInsensitive["keyRingName"] === "string"
        ? interactionData.data.keyInsensitive["keyRingName"]
        : "",
    address: interactionData.data.address || "",
  };

  return (
    <HeaderLayout
      title={""}
      fixedHeight={true}
      headerContainerStyle={{
        height: "0",
      }}
      contentContainerStyle={{
        paddingTop: "2rem",
      }}
      left={
        <BackButton
          hidden={
            interactionInfo.interaction && !interactionInfo.interactionInternal
          }
        />
      }
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
          isLoading: isLedgerInteracting,
          onClick: async () => {
            await signBitcoinMessageInteractionStore.rejectWithProceedNext(
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
        // 유저가 enter를 눌러서 우발적으로(?) approve를 누르지 않도록 onSubmit을 의도적으로 사용하지 않았음.
        {
          isSpecial: true,
          text: intl.formatMessage({ id: "button.approve" }),
          size: "large",
          left: <ApproveIcon />,
          onClick: approve,
        },
      ]}
    >
      <Box
        height="100%"
        paddingX="0.75rem"
        //NOTE - In light mode, the simplebar has shadow, but if there is no bottom margin,
        // it feels like it gets cut off, so I arbitrarily added about 2px.
        paddingBottom="0.125rem"
        style={{
          overflow: "auto",
        }}
      >
        <ArbitraryMsgSignHeader />
        <Gutter size="0.75rem" />
        <ArbitraryMsgRequestOrigin origin={interactionData.data.origin} />
        <Gutter size="0.75rem" />
        <ArbitraryMsgWalletDetails
          walletName={signerInfo.name}
          chainInfo={modularChainInfo}
          addressInfo={{
            type: "bitcoin",
            address: signerInfo.address,
          }}
        />
        <Gutter size="0.75rem" />
        <ArbitraryMsgDataView message={interactionData.data.message} />

        <LedgerGuideBox
          data={{
            keyInsensitive: interactionData.data.keyInsensitive,
            isBitcoin: !isTestnet,
            isBitcoinTest: isTestnet,
          }}
          isLedgerInteracting={isLedgerInteracting}
          ledgerInteractingError={ledgerInteractingError}
          isInternal={interactionData.isInternal}
        />
      </Box>
    </HeaderLayout>
  );
});
