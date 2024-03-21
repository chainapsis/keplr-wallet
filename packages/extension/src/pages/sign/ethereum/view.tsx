import React, { FunctionComponent, useMemo, useRef, useState } from "react";
import { SignEthereumInteractionStore } from "@keplr-wallet/stores-core";
import { Box } from "../../../components/box";
import { XAxis } from "../../../components/axis";
import { Body2, Body3, H5 } from "../../../components/typography";
import { ColorPalette } from "../../../styles";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { BackButton } from "../../../layouts/header/components";
import { HeaderLayout } from "../../../layouts/header";
import { useInteractionInfo } from "../../../hooks";
import { KeplrError } from "@keplr-wallet/router";
import { ErrModuleLedgerSign } from "../utils/ledger-types";
import { Buffer } from "buffer/";
import { LedgerGuideBox } from "../components/ledger-guide-box";
import { EthSignType } from "@keplr-wallet/types";
import {
  handleEthereumPreSignByKeystone,
  handleEthereumPreSignByLedger,
} from "../utils/handle-eth-sign";
import { FormattedMessage, useIntl } from "react-intl";
import { ErrModuleKeystoneSign, KeystoneUR } from "../utils/keystone";
import { KeystoneSign } from "../components/keystone";
import { useTheme } from "styled-components";
import SimpleBar from "simplebar-react";
import { Column, Columns } from "../../../components/column";
import { ViewDataButton } from "../components/view-data-button";
import { UnsignedTransaction } from "@ethersproject/transactions";
import { defaultRegistry } from "../components/eth-tx/registry";
import { ChainImageFallback } from "../../../components/image";
import { Gutter } from "../../../components/gutter";
import { useUnmount } from "../../../hooks/use-unmount";

/**
 * CosmosTxView의 주석을 꼭 참고하셈
 * 이 View는 아직 실험적이고 임시로 구현한거임
 * evmos에서 ADR-036 view랑 똑같이 구현해놔서 그게 마음에 안들어서 2.0에서 잠시 뺐다가
 * 쓰는 사람들이 약간 있길래 최소한의 UI로 먼저 구현함
 */
export const EthereumSigningView: FunctionComponent<{
  interactionData: NonNullable<SignEthereumInteractionStore["waitingData"]>;
}> = observer(({ interactionData }) => {
  const { chainStore, uiConfigStore, signEthereumInteractionStore } =
    useStore();
  const intl = useIntl();
  const theme = useTheme();

  const interactionInfo = useInteractionInfo(() => {
    signEthereumInteractionStore.rejectAll();
  });

  const chainInfo = chainStore.getChain(interactionData.data.chainId);

  const signingDataText = useMemo(() => {
    switch (interactionData.data.signType) {
      case EthSignType.MESSAGE:
        return Buffer.from(interactionData.data.message).toString("hex");
      case EthSignType.TRANSACTION:
        return JSON.stringify(
          JSON.parse(Buffer.from(interactionData.data.message).toString()),
          null,
          2
        );
      case EthSignType.EIP712:
        return JSON.stringify(
          JSON.parse(Buffer.from(interactionData.data.message).toString()),
          null,
          2
        );
      default:
        return Buffer.from(interactionData.data.message).toString("hex");
    }
  }, [interactionData.data]);
  const isTxSigning = interactionData.data.signType === EthSignType.TRANSACTION;

  const [isViewData, setIsViewData] = useState(false);

  const [isLedgerInteracting, setIsLedgerInteracting] = useState(false);
  const [ledgerInteractingError, setLedgerInteractingError] = useState<
    Error | undefined
  >(undefined);

  const [isKeystoneInteracting, setIsKeystoneInteracting] = useState(false);
  const [keystoneUR, setKeystoneUR] = useState<KeystoneUR>();
  const keystoneScanResolve = useRef<(ur: KeystoneUR) => void>();
  const [keystoneInteractingError, setKeystoneInteractingError] = useState<
    Error | undefined
  >(undefined);

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

  return (
    <HeaderLayout
      title={intl.formatMessage({
        id: isTxSigning
          ? "page.sign.ethereum.tx.title"
          : "page.sign.ethereum.title",
      })}
      fixedHeight={true}
      left={
        <BackButton
          hidden={
            interactionInfo.interaction && !interactionInfo.interactionInternal
          }
        />
      }
      bottomButton={{
        text: intl.formatMessage({ id: "button.approve" }),
        color: "primary",
        size: "large",
        isLoading:
          signEthereumInteractionStore.isObsoleteInteraction(
            interactionData.id
          ) || isLedgerInteracting,
        onClick: async () => {
          try {
            let signature;
            if (interactionData.data.keyType === "ledger") {
              setIsLedgerInteracting(true);
              setLedgerInteractingError(undefined);
              signature = await handleEthereumPreSignByLedger(interactionData, {
                useWebHID: uiConfigStore.useWebHIDLedger,
              });
            } else if (interactionData.data.keyType === "keystone") {
              setIsKeystoneInteracting(true);
              signature = await handleEthereumPreSignByKeystone(
                interactionData,
                {
                  displayQRCode: async (ur: KeystoneUR) => {
                    setKeystoneUR(ur);
                  },
                  scanQRCode: () =>
                    new Promise<KeystoneUR>((resolve) => {
                      keystoneScanResolve.current = resolve;
                    }),
                }
              );
            }

            await signEthereumInteractionStore.approveWithProceedNext(
              interactionData.id,
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
              }
            );
          } catch (e) {
            console.log(e);

            if (e instanceof KeplrError) {
              if (e.module === ErrModuleLedgerSign) {
                setLedgerInteractingError(e);
              } else if (e.module === ErrModuleKeystoneSign) {
                setKeystoneInteractingError(e);
              } else {
                setLedgerInteractingError(undefined);
                setKeystoneInteractingError(undefined);
              }
            } else {
              setLedgerInteractingError(undefined);
              setKeystoneInteractingError(undefined);
            }
          } finally {
            setIsLedgerInteracting(false);
          }
        },
      }}
    >
      <Box
        marginTop="0.75rem"
        marginBottom="1.25rem"
        alignX="center"
        alignY="center"
      >
        <Box
          padding="0.375rem 0.625rem 0.375rem 0.75rem"
          backgroundColor={
            theme.mode === "light"
              ? ColorPalette.white
              : ColorPalette["gray-600"]
          }
          borderRadius="20rem"
        >
          <XAxis alignY="center">
            <Body3
              color={
                theme.mode === "light"
                  ? ColorPalette["gray-500"]
                  : ColorPalette["gray-200"]
              }
            >
              <FormattedMessage
                id="page.sign.ethereum.requested-network"
                values={{
                  network: chainInfo.chainName,
                }}
              />
            </Body3>
            <Gutter direction="horizontal" size="0.5rem" />
            <ChainImageFallback
              size="1.25rem"
              chainInfo={chainInfo}
              alt={chainInfo.chainName}
            />
          </XAxis>
        </Box>
      </Box>
      <Box
        height="100%"
        padding="0.75rem"
        paddingTop="0.5rem"
        paddingBottom="0"
        style={{
          overflow: "auto",
        }}
      >
        <Box marginBottom="0.5rem">
          <Columns sum={1} alignY="center">
            <XAxis>
              <H5
                style={{
                  color:
                    theme.mode === "light"
                      ? ColorPalette["gray-500"]
                      : ColorPalette["gray-50"],
                }}
              >
                <FormattedMessage id="page.sign.ethereum.tx.summary" />
              </H5>
            </XAxis>
            <Column weight={1} />
            <ViewDataButton
              isViewData={isViewData}
              setIsViewData={setIsViewData}
            />
          </Columns>
        </Box>
        {isTxSigning ? (
          <SimpleBar
            autoHide={false}
            style={{
              display: "flex",
              flexDirection: "column",
              flex: !isViewData ? "0 1 auto" : 1,
              overflow: "auto",
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
            <Box>
              {isViewData ? (
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
                  }}
                >
                  {signingDataText}
                </Box>
              ) : (
                <Box padding="1rem" minHeight="7.5rem">
                  <Body2
                    color={
                      theme.mode === "light"
                        ? ColorPalette["gray-300"]
                        : ColorPalette["gray-100"]
                    }
                  >
                    {
                      defaultRegistry.render(
                        interactionData.data.chainId,
                        JSON.parse(
                          Buffer.from(interactionData.data.message).toString()
                        ) as UnsignedTransaction
                      ).content
                    }
                  </Body2>
                </Box>
              )}
            </Box>
          </SimpleBar>
        ) : (
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
            }}
          >
            {signingDataText}
          </Box>
        )}

        <div style={{ flex: 1 }} />

        <LedgerGuideBox
          data={{
            keyInsensitive: interactionData.data.keyInsensitive,
            isEthereum: true,
          }}
          isLedgerInteracting={isLedgerInteracting}
          ledgerInteractingError={ledgerInteractingError}
          isInternal={interactionData.isInternal}
        />
      </Box>
      <KeystoneSign
        ur={keystoneUR}
        isOpen={isKeystoneInteracting}
        close={() => {
          setIsKeystoneInteracting(false);
        }}
        onScan={(ur) => {
          if (keystoneScanResolve.current === undefined) {
            throw new Error("Keystone Scan Error");
          }
          keystoneScanResolve.current(ur);
        }}
        error={keystoneInteractingError}
        onCloseError={() => {
          if (keystoneInteractingError) {
            setIsKeystoneInteracting(false);
          }
          setKeystoneInteractingError(undefined);
        }}
      />
    </HeaderLayout>
  );
});
