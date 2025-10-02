import React, { FunctionComponent, useMemo, useRef, useState } from "react";
import { SignEthereumInteractionStore } from "@keplr-wallet/stores-core";
import { ColorPalette } from "../../../../styles";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";
import { BackButton } from "../../../../layouts/header/components";
import { useInteractionInfo } from "../../../../hooks";
import { KeplrError } from "@keplr-wallet/router";
import { ErrModuleLedgerSign } from "../../utils/ledger-types";
import { Buffer } from "buffer/";
import { LedgerGuideBox } from "../../components/ledger-guide-box";
import { KeystoneUSBBox } from "../../components/keystone-usb-box";
import {
  handleEthereumPreSignByKeystone,
  handleEthereumPreSignByLedger,
} from "../../utils/handle-eth-sign";
import { useIntl } from "react-intl";
import { ErrModuleKeystoneSign, KeystoneUR } from "../../utils/keystone";
import { KeystoneSign } from "../../components/keystone";
import { useTheme } from "styled-components";
import { useUnmount } from "../../../../hooks/use-unmount";
import { handleExternalInteractionWithNoProceedNext } from "../../../../utils";
import { useNavigate } from "react-router";
import { ApproveIcon, CancelIcon } from "../../../../components/button";
import { HeaderProps } from "../../../../layouts/header/types";
import { HeaderLayout } from "../../../../layouts/header";
import { Box } from "../../../../components/box";
import { ArbitraryMsgSignHeader } from "../../components/arbitrary-message/arbitrary-message-header";
import { Gutter } from "../../../../components/gutter";
import { ArbitraryMsgRequestOrigin } from "../../components/arbitrary-message/arbitrary-message-origin";
import { ArbitraryMsgWalletDetails } from "../../components/arbitrary-message/arbitrary-message-wallet-details";
import { ArbitraryMsgDataView } from "../../components/arbitrary-message/arbitrary-message-data-view";

export const EthereumSignMessageView: FunctionComponent<{
  interactionData: NonNullable<SignEthereumInteractionStore["waitingData"]>;
}> = observer(({ interactionData }) => {
  const { uiConfigStore, signEthereumInteractionStore, chainStore } =
    useStore();
  const intl = useIntl();
  const theme = useTheme();
  const navigate = useNavigate();

  const interactionInfo = useInteractionInfo({
    onUnmount: async () => {
      await signEthereumInteractionStore.rejectWithProceedNext(
        interactionData.id,
        () => {}
      );
    },
  });

  const { message, chainId } = interactionData.data;

  const chainInfo = chainStore.getChain(chainId);

  const signerInfo = {
    name:
      typeof interactionData.data.keyInsensitive["keyRingName"] === "string"
        ? interactionData.data.keyInsensitive["keyRingName"]
        : "",
    address: interactionData.data.signer || "",
  };

  const signingDataBuff = Buffer.from(message);

  const signingDataText = useMemo(() => {
    // If the message is 32 bytes, it's probably a hash.
    if (signingDataBuff.length === 32) {
      return "0x" + signingDataBuff.toString("hex");
    } else {
      const text = (() => {
        const string = signingDataBuff.toString("utf8");
        if (string.startsWith("0x")) {
          const buf = Buffer.from(string.slice(2), "hex");

          try {
            // 정상적인 utf-8 문자열인지 확인
            const decoder = new TextDecoder("utf-8", { fatal: true });
            decoder.decode(new Uint8Array(buf)); // UTF-8 변환 시도
          } catch {
            // 정상적인 utf-8 문자열이 아니면 hex로 변환
            return "0x" + buf.toString("hex");
          }

          return buf.toString("utf8");
        }

        return string;
      })();

      // If the text contains RTL mark, escape it.
      return text.replace(/\u202E/giu, "\\u202E");
    }
  }, [signingDataBuff]);

  const [isLedgerInteracting, setIsLedgerInteracting] = useState(false);
  const [ledgerInteractingError, setLedgerInteractingError] = useState<
    Error | undefined
  >(undefined);

  const isKeystonUSB =
    interactionData.data.keyType === "keystone" &&
    interactionData.data.keyInsensitive["connectionType"] === "USB";

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

  const isLoading =
    signEthereumInteractionStore.isObsoleteInteractionApproved(
      interactionData.id
    ) ||
    isLedgerInteracting ||
    isKeystoneInteracting;

  const bottomButtons: HeaderProps["bottomButtons"] = [
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
        await signEthereumInteractionStore.rejectWithProceedNext(
          interactionData.id,
          async (proceedNext) => {
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
      text: intl.formatMessage({ id: "button.approve" }),
      color: "primary",
      size: "large",
      left: !isLoading && <ApproveIcon />,
      isLoading,
      onClick: async () => {
        try {
          let signature;
          if (interactionData.data.keyType === "ledger") {
            setIsLedgerInteracting(true);
            setLedgerInteractingError(undefined);
            signature = await handleEthereumPreSignByLedger(
              interactionData,
              signingDataBuff,
              {
                useWebHID: uiConfigStore.useWebHIDLedger,
              }
            );
          } else if (interactionData.data.keyType === "keystone") {
            setIsKeystoneInteracting(true);
            setKeystoneInteractingError(undefined);
            signature = await handleEthereumPreSignByKeystone(
              interactionData,
              signingDataBuff,
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
            signingDataBuff,
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
          setIsKeystoneInteracting(false);
        }
      },
    },
  ];

  const headerLeft = (
    <BackButton
      hidden={
        interactionInfo.interaction && !interactionInfo.interactionInternal
      }
    />
  );
  const ledgerGuideBox = useMemo(
    () => (
      <LedgerGuideBox
        data={{
          keyInsensitive: interactionData.data.keyInsensitive,
          isEthereum: true,
        }}
        isLedgerInteracting={isLedgerInteracting}
        ledgerInteractingError={ledgerInteractingError}
        isInternal={interactionData.isInternal}
      />
    ),
    [
      interactionData.data.keyInsensitive,
      interactionData.isInternal,
      isLedgerInteracting,
      ledgerInteractingError,
    ]
  );

  const keystoneUSBBox = isKeystonUSB && (
    <KeystoneUSBBox
      isKeystoneInteracting={isKeystoneInteracting}
      KeystoneInteractingError={keystoneInteractingError}
    />
  );

  const keystoneSign = !isKeystonUSB && (
    <KeystoneSign
      ur={keystoneUR}
      isOpen={isKeystoneInteracting}
      close={() => setIsKeystoneInteracting(false)}
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
  );

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
      left={headerLeft}
      bottomButtons={bottomButtons}
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
          chainInfo={chainInfo}
          addressInfo={{
            type: "ethereum",
            address: signerInfo.address,
          }}
        />
        <Gutter size="0.75rem" />
        <ArbitraryMsgDataView message={signingDataText} />
        {ledgerGuideBox}
        {keystoneUSBBox}
      </Box>
      {keystoneSign}
    </HeaderLayout>
  );
});
