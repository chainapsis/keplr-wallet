import React, { FunctionComponent, useMemo } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";
import { BackButton } from "../../../../layouts/header/components";
import { EthSignType } from "@keplr-wallet/types";
import { LedgerGuideBox } from "../../components/ledger-guide-box";
import { KeystoneUSBBox } from "../../components/keystone-usb-box";
import { KeystoneSign } from "../../components/keystone";
import { SignEthereumInteractionStore } from "@keplr-wallet/stores-core";
import { useEthereumSigningCommon } from "../hooks/use-ethereum-signing-common";
import { useEthereumSigningButtons } from "../hooks/use-ethereum-signing-buttons";
import { HeaderLayout } from "../../../../layouts/header";
import { Box } from "../../../../components/box";
import { ArbitraryMsgSignHeader } from "../../components/arbitrary-message/arbitrary-message-header";
import { Gutter } from "../../../../components/gutter";
import { ArbitraryMsgWalletDetails } from "../../components/arbitrary-message/arbitrary-message-wallet-details";
import { ArbitraryMsgRequestOrigin } from "../../components/arbitrary-message/arbitrary-message-origin";
import { ArbitraryMsgDataView } from "../../components/arbitrary-message/arbitrary-message-data-view";

export const EthereumArbitrarySignView: FunctionComponent<{
  interactionData: NonNullable<SignEthereumInteractionStore["waitingData"]>;
}> = observer(({ interactionData }) => {
  const { chainStore } = useStore();
  const { signType, chainId } = interactionData.data;

  const {
    interactionInfo,
    signerInfo,
    signingDataBuff,
    isLedgerInteracting,
    ledgerInteractingError,
    setLedgerInteractingError,
    isKeystoneUSB,
    isKeystoneInteracting,
    setIsKeystoneInteracting,
    keystoneUR,
    setKeystoneUR,
    keystoneScanResolve,
    keystoneInteractingError,
    setKeystoneInteractingError,
    isLoading,
  } = useEthereumSigningCommon({ interactionData });

  const chainInfo = chainStore.getChain(chainId);

  const { bottomButtons } = useEthereumSigningButtons({
    interactionData,
    interactionInfo,
    signingDataBuff,
    isLoading,
    setIsLedgerInteracting: () => {}, // Not used in arbitrary sign
    setLedgerInteractingError,
    setIsKeystoneInteracting,
    setKeystoneInteractingError,
    keystoneScanResolve,
    unmountPromise: { promise: Promise.resolve() }, // Not used in arbitrary sign
    setKeystoneUR,
  });

  const signingDataText = useMemo(() => {
    switch (signType) {
      case EthSignType.MESSAGE:
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
      case EthSignType.EIP712:
        return JSON.stringify(JSON.parse(signingDataBuff.toString()), null, 2);
      default:
        return "0x" + signingDataBuff.toString("hex");
    }
  }, [signingDataBuff, signType]);

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

  const keystoneUSBBox = isKeystoneUSB && (
    <KeystoneUSBBox
      isKeystoneInteracting={isKeystoneInteracting}
      KeystoneInteractingError={keystoneInteractingError}
    />
  );

  const keystoneSign = !isKeystoneUSB && (
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
        <ArbitraryMsgRequestOrigin origin={origin} />
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
        <ArbitraryMsgDataView
          {...(signType === EthSignType.MESSAGE
            ? { message: signingDataText }
            : { rawMessage: signingDataText })}
        />
        {ledgerGuideBox}
        {keystoneUSBBox}
      </Box>
      {keystoneSign}
    </HeaderLayout>
  );
});
