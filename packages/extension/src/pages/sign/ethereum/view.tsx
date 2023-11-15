import React, { FunctionComponent, useMemo, useRef, useState } from "react";
import { SignEthereumInteractionStore } from "@keplr-wallet/stores";
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
import { KeystoneUR } from "../utils/keystone";
import { KeystoneSign } from "../components/keystone";
import { useTheme } from "styled-components";
import SimpleBar from "simplebar-react";
import { Column, Columns } from "../../../components/column";
import { ViewDataButton } from "../components/view-data-button";
import { UnsignedTransaction } from "@ethersproject/transactions";
import { EthSendTxPretty } from "../components/eth-sign-data";
import { ChainImageFallback } from "../../../components/image";
import { Gutter } from "../../../components/gutter";

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
              style={{
                width: "1.25rem",
                height: "1.25rem",
              }}
              src={chainInfo.chainSymbolImageUrl}
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
                    <EthSendTxPretty
                      chainId={interactionData.data.chainId}
                      unsignedTx={
                        JSON.parse(
                          Buffer.from(interactionData.data.message).toString()
                        ) as UnsignedTransaction
                      }
                    />
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
      />
    </HeaderLayout>
  );
});
