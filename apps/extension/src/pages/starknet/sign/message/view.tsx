import React, { FunctionComponent, useState } from "react";
import { SignStarknetMessageInteractionStore } from "@keplr-wallet/stores-core";
import { handleExternalInteractionWithNoProceedNext } from "../../../../utils";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";
import { useInteractionInfo } from "../../../../hooks";
import { useUnmount } from "../../../../hooks/use-unmount";
import { BackButton } from "../../../../layouts/header/components";
import { HeaderLayout } from "../../../../layouts/header";
import { FormattedMessage, useIntl } from "react-intl";
import { Box } from "../../../../components/box";
import { ColorPalette } from "../../../../styles";
import { useTheme } from "styled-components";
import { Body3, H5 } from "../../../../components/typography";
import { XAxis, YAxis } from "../../../../components/axis";
import { Gutter } from "../../../../components/gutter";
import { Image } from "../../../../components/image";
import SimpleBar from "simplebar-react";
import { connectAndSignMessageWithLedger } from "../../../sign/utils/handle-starknet-sign";
import { ErrModuleLedgerSign } from "../../../sign/utils/ledger-types";
import { KeplrError } from "@keplr-wallet/router";
import { LedgerGuideBox } from "../../../sign/components/ledger-guide-box";

export const SignStarknetMessageView: FunctionComponent<{
  interactionData: NonNullable<
    SignStarknetMessageInteractionStore["waitingData"]
  >;
}> = observer(({ interactionData }) => {
  const { signStarknetMessageInteractionStore, uiConfigStore } = useStore();

  const theme = useTheme();

  const { chainStore } = useStore();

  const intl = useIntl();
  const interactionInfo = useInteractionInfo();

  const chainId = interactionData.data.chainId;

  const modularChainInfo = chainStore.getModularChain(chainId);
  if (!("starknet" in modularChainInfo)) {
    throw new Error(`${modularChainInfo.chainId} is not starknet chain`);
  }

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
    let signature: string[] | undefined = undefined;
    if (interactionData.data.keyType === "ledger") {
      setIsLedgerInteracting(true);
      setLedgerInteractingError(undefined);
      signature = await connectAndSignMessageWithLedger(
        interactionData.data.message,
        interactionData.data.signer,
        {
          useWebHID: uiConfigStore.useWebHIDLedger,
        }
      );
    }

    try {
      await signStarknetMessageInteractionStore.approveWithProceedNext(
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
      bottomButton={{
        isSpecial: true,
        text: intl.formatMessage({ id: "button.approve" }),
        size: "large",
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
          padding="1rem"
          backgroundColor={
            theme.mode === "light"
              ? ColorPalette.white
              : ColorPalette["gray-600"]
          }
          borderRadius="0.375rem"
          style={{
            boxShadow:
              theme.mode === "light"
                ? "0px 1px 4px 0px rgba(43, 39, 55, 0.10)"
                : "none",
          }}
        >
          <XAxis alignY="center">
            <Image
              alt="sign-custom-image"
              src={require("../../../../public/assets/img/sign-adr36.png")}
              style={{ width: "3rem", height: "3rem" }}
            />
            <Gutter size="0.75rem" />
            <YAxis>
              <H5
                color={
                  theme.mode === "light"
                    ? ColorPalette["gray-500"]
                    : ColorPalette["gray-10"]
                }
              >
                <FormattedMessage id="Prove account ownership to" />
              </H5>
              <Gutter size="2px" />
              <Body3
                color={
                  theme.mode === "light"
                    ? ColorPalette["gray-300"]
                    : ColorPalette["gray-200"]
                }
              >
                {interactionData?.data.origin || ""}
              </Body3>
            </YAxis>
          </XAxis>
        </Box>

        <Gutter size="0.75rem" />
        <SimpleBar
          autoHide={false}
          style={{
            display: "flex",
            flexDirection: "column",
            flex: "0 1 auto",
            overflowY: "auto",
            overflowX: "hidden",
            borderRadius: "0.375rem",
            backgroundColor:
              theme.mode === "light"
                ? ColorPalette.white
                : ColorPalette["gray-600"],
            boxShadow:
              theme.mode === "light"
                ? "0px 1px 4px 0px rgba(43, 39, 55, 0.10)"
                : "none",
          }}
        >
          <Box
            as={"pre"}
            padding="1rem"
            // Remove normalized style of pre tag
            margin="0"
            style={{
              width: "fit-content",
              color:
                theme.mode === "light"
                  ? ColorPalette["gray-400"]
                  : ColorPalette["gray-200"],
              whiteSpace: "pre-wrap",
              wordBreak: "break-all",
            }}
          >
            {JSON.stringify(interactionData.data.message, null, 2)}
          </Box>
        </SimpleBar>

        <div style={{ marginTop: "0.75rem", flex: 1 }} />

        <LedgerGuideBox
          data={{
            keyInsensitive: interactionData.data.keyInsensitive,
            isStarknet: true,
          }}
          isLedgerInteracting={isLedgerInteracting}
          ledgerInteractingError={ledgerInteractingError}
          isInternal={interactionData.isInternal}
        />
      </Box>
    </HeaderLayout>
  );
});
