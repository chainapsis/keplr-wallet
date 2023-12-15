import React, { FunctionComponent, useMemo, useRef, useState } from "react";
import { SignEthereumInteractionStore } from "@keplr-wallet/stores-core";
import { Box } from "../../../components/box";
import { XAxis } from "../../../components/axis";
import { Body2, Subtitle3 } from "../../../components/typography";
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

  const messageText = useMemo(() => {
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

  return (
    <HeaderLayout
      title={intl.formatMessage({ id: "page.sign.ethereum.title" })}
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
        height="100%"
        padding="0.75rem"
        paddingTop="0.5rem"
        paddingBottom="0"
        style={{
          overflow: "auto",
        }}
      >
        <Box
          height="17.5rem"
          padding="1rem"
          backgroundColor={
            theme.mode === "light"
              ? ColorPalette.white
              : ColorPalette["gray-600"]
          }
          borderRadius="0.375rem"
          style={{
            overflow: "auto",
          }}
        >
          <pre
            style={{
              color:
                theme.mode === "light"
                  ? ColorPalette["gray-400"]
                  : ColorPalette["gray-10"],
              // Remove normalized style of pre tag
              margin: 0,
            }}
          >
            {messageText}
          </pre>
        </Box>

        <div style={{ flex: 1 }} />
        <Box
          padding="1rem"
          backgroundColor={
            theme.mode === "light"
              ? ColorPalette.white
              : ColorPalette["gray-600"]
          }
          borderRadius="0.375rem"
        >
          <XAxis alignY="center">
            <Body2
              color={
                theme.mode === "light"
                  ? ColorPalette["gray-500"]
                  : ColorPalette["gray-200"]
              }
            >
              <FormattedMessage id="page.sign.ethereum.requested-network" />
            </Body2>
            <div style={{ flex: 1 }} />
            <Subtitle3
              color={
                theme.mode === "light"
                  ? ColorPalette["gray-200"]
                  : ColorPalette["gray-50"]
              }
            >
              {chainStore.getChain(interactionData.data.chainId).chainName}
            </Subtitle3>
          </XAxis>
        </Box>

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
