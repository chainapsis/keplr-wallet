import React, { FunctionComponent, useMemo, useRef, useState } from "react";
import { SignEthereumInteractionStore } from "@keplr-wallet/stores-core";
import { ColorPalette } from "../../../../styles";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";
import { BackButton } from "../../../../layouts/header/components";
import { useInteractionInfo } from "../../../../hooks";
import { KeplrError } from "@keplr-wallet/router";
import { ErrModuleLedgerSign } from "../../utils/ledger-types";
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
import {
  EIP712Intent,
  useEIP712Intent,
} from "../../../../hooks/ethereum/use-eip712-intent";
import { ChainInfoWithCoreTypes } from "@keplr-wallet/background";
import { IChainInfoImpl } from "@keplr-wallet/stores";
import { XAxis } from "../../../../components/axis";
import { Body2, Subtitle4 } from "../../../../components/typography";
import { CoinOutlineIcon } from "../../../../components/icon/coin-outline";
import { LinkIcon } from "../../../../components/icon";
import { CurrencyImageFallback } from "../../../../components/image";
import { Skeleton } from "../../../../components/skeleton";
import { CoinPretty } from "@keplr-wallet/unit";
import { Tooltip } from "../../../../components/tooltip";

export const EthereumSignEIP712View: FunctionComponent<{
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
        () => {
          // noop
        }
      );
    },
  });

  const { chainId } = interactionData.data;

  const chainInfo = chainStore.getChain(chainId);

  const signerInfo = {
    name:
      typeof interactionData.data.keyInsensitive["keyRingName"] === "string"
        ? interactionData.data.keyInsensitive["keyRingName"]
        : "",
    address: interactionData.data.signer || "",
  };

  const { intent, signingDataBuff, signingDataText } =
    useEIP712Intent(interactionData);

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
        <EIP712IntentView
          chainInfo={chainInfo}
          intent={intent}
          signingDataText={signingDataText}
        />
        {ledgerGuideBox}
        {keystoneUSBBox}
      </Box>
      {keystoneSign}
    </HeaderLayout>
  );
});

const MAX_UINT256 =
  "115792089237316195423570985008687907853269984665640564039457584007913129639935";

const EIP712IntentView: FunctionComponent<{
  chainInfo: IChainInfoImpl<ChainInfoWithCoreTypes>;
  intent: EIP712Intent;
  signingDataText: string;
}> = observer(({ chainInfo, intent, signingDataText }) => {
  switch (intent.kind) {
    case "erc2612.permit":
      return (
        <PermitIntentView
          chainInfo={chainInfo}
          spender={intent.spender}
          tokenAddress={intent.domain.verifyingContract}
          amount={intent.amount}
          signingDataText={signingDataText}
        />
      );
    case "dai.permit":
      return (
        <PermitIntentView
          chainInfo={chainInfo}
          spender={intent.spender}
          tokenAddress={intent.domain.verifyingContract}
          amount={intent.allowed ? MAX_UINT256 : "0"}
          signingDataText={signingDataText}
        />
      );
    case "uniswap.permitSingle":
      return (
        <PermitIntentView
          chainInfo={chainInfo}
          spender={intent.spender}
          tokenAddress={intent.details.token}
          amount={intent.details.amount}
          signingDataText={signingDataText}
        />
      );
    case "unknown":
    default:
      return (
        <React.Fragment>
          <Gutter size="0.75rem" />
          <ArbitraryMsgDataView rawMessage={signingDataText} />
        </React.Fragment>
      );
  }
});

const PermitIntentView: FunctionComponent<{
  chainInfo: IChainInfoImpl<ChainInfoWithCoreTypes>;
  spender: string;
  tokenAddress: string;
  amount: string;
  signingDataText: string;
}> = observer(
  ({ chainInfo, spender, tokenAddress, amount, signingDataText }) => {
    const theme = useTheme();
    const { queriesStore } = useStore();

    const queryExplorer = queriesStore.simpleQuery.queryGet<{
      link: string;
    }>(
      process.env["KEPLR_EXT_CONFIG_SERVER"],
      `/tx-history/explorer/${chainInfo.chainId}`
    );

    const explorerUrl = queryExplorer.response?.data.link || "";

    function handleAddressClick() {
      try {
        const domain = new URL(explorerUrl).hostname;
        browser.tabs.create({ url: `https://${domain}/address/${spender}` });
      } catch (error) {
        console.error("Error extracting domain from explorerUrl", error);
      }
    }

    const UNKNOWN_ERC20_CURRENCY = {
      type: "erc20",
      contractAddress: tokenAddress,
      coinDenom: "Unknown",
      coinDecimals: 18,
      coinMinimalDenom: `erc20:${tokenAddress}`,
    };

    const { currency: erc20Currency, isFetching: isFetchingErc20Metadata } =
      (() => {
        const currency = chainInfo.findCurrency(`erc20:${tokenAddress}`);
        if (currency) {
          return { currency, isFetching: false };
        }

        const tokenMetadata = queriesStore
          .get(chainInfo.chainId)
          .ethereum.queryEthereumERC20ContractInfo.getQueryContract(
            tokenAddress
          );

        if (tokenMetadata.error === undefined && tokenMetadata.tokenInfo) {
          return {
            currency: {
              type: "erc20",
              contractAddress: tokenAddress,
              coinDenom: tokenMetadata.tokenInfo.symbol,
              coinDecimals: tokenMetadata.tokenInfo.decimals,
              coinMinimalDenom: `erc20:${tokenAddress}`,
            },
            isFetching: tokenMetadata.isFetching,
          };
        }

        return {
          currency: UNKNOWN_ERC20_CURRENCY,
          isFetching: tokenMetadata.isFetching,
        };
      })();

    const formattedAmount = (() => {
      const coinPretty = new CoinPretty(erc20Currency, amount);

      const maxLength = 24;
      const maxDecimals = 6;
      const showDenom = true;

      const numberOnlyText = coinPretty
        .shrink(true)
        .trim(true)
        .maxDecimals(maxDecimals)
        .hideDenom(true)
        .toString();

      const denom = coinPretty.currency.coinDenom;

      const fullText = showDenom
        ? `${numberOnlyText} ${denom}`
        : numberOnlyText;

      let displayText: string;

      if (fullText.length > maxLength) {
        if (showDenom) {
          const denomWithSpace = ` ${denom}`;
          const availableLength = maxLength - denomWithSpace.length - 3;

          if (availableLength > 0) {
            let truncatedNumber = numberOnlyText.slice(0, availableLength);

            truncatedNumber = truncatedNumber.replace(/[,.]$/, "");

            displayText = `${truncatedNumber}...${denomWithSpace}`;
          } else {
            displayText = denom;
          }
        } else {
          let truncatedNumber = numberOnlyText.slice(0, maxLength - 3);

          truncatedNumber = truncatedNumber.replace(/[,.]$/, "");

          displayText = `${truncatedNumber}...`;
        }
      } else {
        displayText = fullText;
      }

      const isTruncated = fullText.length > maxLength;

      return {
        display: displayText,
        full: fullText,
        isTruncated,
      };
    })();

    return (
      <React.Fragment>
        <Gutter size="1.5rem" />
        <Box
          style={{
            overflow: "auto",
            boxShadow:
              theme.mode === "light"
                ? "0px 1px 4px 0px rgba(43, 39, 55, 0.10)"
                : "none",
            display: "flex",
            flexShrink: 0,
            flexDirection: "column",
            borderRadius: "0.375rem",
            backgroundColor:
              theme.mode === "light"
                ? ColorPalette.white
                : ColorPalette["gray-600"],
            padding: "1rem",
          }}
        >
          <XAxis gap="0.375rem" alignY="center">
            <CoinOutlineIcon
              color={
                theme.mode === "light"
                  ? ColorPalette["gray-300"]
                  : ColorPalette["gray-200"]
              }
            />
            <Subtitle4
              color={
                theme.mode === "light"
                  ? ColorPalette["gray-300"]
                  : ColorPalette["gray-200"]
              }
            >
              Approve spending limit
            </Subtitle4>
          </XAxis>
          <Gutter size="1rem" />
          <XAxis alignY="center">
            <Body2
              color={
                theme.mode === "light"
                  ? ColorPalette["gray-300"]
                  : ColorPalette["gray-200"]
              }
            >
              Approve
            </Body2>
            <div style={{ flex: 1 }} />
            <Box
              cursor="pointer"
              onClick={handleAddressClick}
              style={{
                display: "flex",
                flexDirection: "row",
                gap: "0.25rem",
                alignItems: "center",
                justifyContent: "center",
              }}
              hover={{
                opacity: 0.7,
              }}
            >
              <Body2
                color={
                  theme.mode === "light"
                    ? ColorPalette["gray-400"]
                    : ColorPalette["gray-100"]
                }
              >
                {`${spender.slice(0, 10)}...${spender.slice(-8)}`}
              </Body2>
              <LinkIcon
                width="1rem"
                height="1rem"
                color={ColorPalette["gray-200"]}
              />
            </Box>
          </XAxis>
          <Gutter size="0.5rem" />
          <XAxis alignY="center">
            <Body2
              color={
                theme.mode === "light"
                  ? ColorPalette["gray-300"]
                  : ColorPalette["gray-200"]
              }
            >
              to use up to
            </Body2>
            <div style={{ flex: 1 }} />
            <Tooltip
              content={formattedAmount.full}
              enabled={formattedAmount.isTruncated}
              allowedPlacements={["bottom"]}
              textStyle={{
                wordBreak: "break-word",
                whiteSpace: "normal",
              }}
            >
              <Skeleton
                isNotReady={isFetchingErc20Metadata}
                type="button"
                layer={1}
              >
                <XAxis gap="0.5rem" alignY="center">
                  <CurrencyImageFallback
                    chainInfo={chainInfo}
                    currency={erc20Currency}
                    size="1.5rem"
                    alt={erc20Currency.coinDenom}
                  />

                  <Body2
                    color={
                      theme.mode === "light"
                        ? ColorPalette["gray-700"]
                        : ColorPalette["white"]
                    }
                  >
                    {formattedAmount.display}
                  </Body2>
                </XAxis>
              </Skeleton>
            </Tooltip>
          </XAxis>
        </Box>
        <Gutter size="0.75rem" />

        <ArbitraryMsgDataView
          rawMessage={signingDataText}
          forceCollapsable={true}
        />
      </React.Fragment>
    );
  }
);
