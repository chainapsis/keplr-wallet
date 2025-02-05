import React, {
  FunctionComponent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { observer } from "mobx-react-lite";
import { HeaderLayout } from "../../../layouts/header";
import { BackButton } from "../../../layouts/header/components";

import { Stack } from "../../../components/stack";

import styled from "styled-components";
import { useSearchParams } from "react-router-dom";

import { ChainStore, useStore } from "../../../stores";
import {
  FeeConfig,
  GasConfig,
  IBCAmountConfig,
  IBCChannelConfig,
  MemoConfig,
  SenderConfig,
  useGasSimulator,
  useIBCChannelConfig,
  useSendMixedIBCTransferConfig,
  useTxConfigsValidate,
  IBCRecipientConfig,
  useIBCRecipientConfig,
} from "@keplr-wallet/hooks";
import { useNavigate } from "react-router";
import { AmountInput, RecipientInput } from "../../../components/input";
import { TokenItem } from "../../main/components";
import { Caption2, Subtitle3 } from "../../../components/typography";
import { Box } from "../../../components/box";
import { MemoInput } from "../../../components/input/memo-input";
import { XAxis, YAxis } from "../../../components/axis";
import { Gutter } from "../../../components/gutter";
import { FeeControl } from "../../../components/input/fee-control";
import { useNotification } from "../../../hooks/notification";
import { DenomHelper, ExtensionKVStore } from "@keplr-wallet/common";
import { ENSInfo, ICNSInfo } from "../../../config.ui";
import { CoinPretty, Dec, DecUtils, Int } from "@keplr-wallet/unit";
import { ColorPalette } from "../../../styles";
import { openPopupWindow } from "@keplr-wallet/popup";
import { InExtensionMessageRequester } from "@keplr-wallet/router-extension";
import { BACKGROUND_PORT, Message } from "@keplr-wallet/router";
import {
  ChainInfoWithCoreTypes,
  LogAnalyticsEventMsg,
  RecordTxWithSkipSwapMsg,
  SendTxAndRecordMsg,
  SendTxAndRecordWithIBCSwapMsg,
  SendTxEthereumMsgAndRecordMsg,
} from "@keplr-wallet/background";
import { FormattedMessage, useIntl } from "react-intl";
import { useTxConfigsQueryString } from "../../../hooks/use-tx-config-query-string";
import { LayeredHorizontalRadioGroup } from "../../../components/radio-group";
import { Modal } from "../../../components/modal";
import {
  DestinationChainView,
  IBCTransferSelectDestinationModal,
} from "./ibc-transfer";
import { useIBCChannelConfigQueryString } from "../../../hooks/use-ibc-channel-config-query-string";
import { VerticalCollapseTransition } from "../../../components/transition/vertical-collapse";
import { GuideBox } from "../../../components/guide-box";
import { ChainIdHelper } from "@keplr-wallet/cosmos";
import { amountToAmbiguousAverage, isRunningInSidePanel } from "../../../utils";
import { AppCurrency, EthTxStatus } from "@keplr-wallet/types";
import {
  IBCSwapAmountConfig,
  useIBCSwapConfig,
} from "@keplr-wallet/hooks-internal";
import {
  ObservableQueryRouteInner,
  SkipQueries,
} from "@keplr-wallet/stores-internal";
import {
  AccountSetBase,
  AccountStore,
  ChainGetter,
  CosmosAccount,
  CosmwasmAccount,
  IAccountStoreWithInjects,
  IChainInfoImpl,
  IQueriesStore,
  MakeTxResponse,
  // MakeTxResponse,
  SecretAccount,
  WalletStatus,
} from "@keplr-wallet/stores";
import {
  EthereumAccountBase,
  EthereumAccountStore,
  UnsignedEVMTransaction,
  UnsignedEVMTransactionWithErc20Approvals,
} from "@keplr-wallet/stores-eth";
import { autorun } from "mobx";
import { usePreviousDistinct } from "../../../hooks/use-previous";
import { SwapFeeInfoForBridgeOnSend } from "./swap-fee-info";

const Styles = {
  Flex1: styled.div`
    flex: 1;
  `,
};

export type SendType = "bridge" | "ibc-transfer" | "send";

function useGetGasSimulatorOfNotBridge(
  isEvmTx: boolean,
  sendConfigs: {
    amountConfig: IBCAmountConfig;
    memoConfig: MemoConfig;
    gasConfig: GasConfig;
    feeConfig: FeeConfig;
    recipientConfig: IBCRecipientConfig;
    channelConfig: IBCChannelConfig;
    senderConfig: SenderConfig;
  },
  chainStore: ChainStore,
  chainId: string,
  sendType: string,
  account: AccountSetBase & CosmosAccount & CosmwasmAccount & SecretAccount,
  accountStore: AccountStore<
    [CosmosAccount, CosmwasmAccount, SecretAccount],
    AccountSetBase & CosmosAccount & CosmwasmAccount & SecretAccount
  >,
  ethereumAccount: EthereumAccountBase
) {
  const gasSimulatorKey = useMemo(() => {
    const txType: "evm" | "cosmos" = isEvmTx ? "evm" : "cosmos";

    if (sendConfigs.amountConfig.currency) {
      const denomHelper = new DenomHelper(
        sendConfigs.amountConfig.currency.coinMinimalDenom
      );

      if (denomHelper.type !== "native") {
        if (denomHelper.type === "erc20") {
          // XXX: This logic causes gas simulation to run even if `gasSimulatorKey` is the same, it needs to be figured out why.
          const amountHexDigits = BigInt(
            sendConfigs.amountConfig.amount[0].toCoin().amount
          ).toString(16).length;
          return `${txType}/${denomHelper.type}/${denomHelper.contractAddress}/${amountHexDigits}`;
        }

        if (denomHelper.type === "cw20") {
          // Probably, the gas can be different per cw20 according to how the contract implemented.
          return `${txType}/${denomHelper.type}/${denomHelper.contractAddress}`;
        }

        return `${txType}/${denomHelper.type}`;
      }
    }

    return `${txType}/native`;
  }, [
    isEvmTx,
    sendConfigs.amountConfig.amount,
    sendConfigs.amountConfig.currency,
  ]);

  const gasSimulator = useGasSimulator(
    new ExtensionKVStore("gas-simulator.main.send"),
    chainStore,
    chainId,
    sendConfigs.gasConfig,
    sendConfigs.feeConfig,
    sendType === "ibc-transfer" ? `ibc/${gasSimulatorKey}` : gasSimulatorKey,
    () => {
      if (!sendConfigs.amountConfig.currency) {
        throw new Error("Send currency not set");
      }

      if (sendType === "ibc-transfer") {
        if (
          sendConfigs.channelConfig.uiProperties.loadingState ===
            "loading-block" ||
          sendConfigs.channelConfig.uiProperties.error != null
        ) {
          throw new Error("Not ready to simulate tx");
        }
      }

      // Prefer not to use the gas config or fee config,
      // because gas simulator can change the gas config and fee config from the result of reaction,
      // and it can make repeated reaction.
      if (
        sendConfigs.amountConfig.uiProperties.loadingState ===
          "loading-block" ||
        sendConfigs.amountConfig.uiProperties.error != null ||
        sendConfigs.recipientConfig.uiProperties.loadingState ===
          "loading-block" ||
        sendConfigs.recipientConfig.uiProperties.error != null
      ) {
        throw new Error("Not ready to simulate tx");
      }

      const denomHelper = new DenomHelper(
        sendConfigs.amountConfig.currency.coinMinimalDenom
      );
      // I don't know why, but simulation does not work for secret20
      if (denomHelper.type === "secret20") {
        throw new Error("Simulating secret wasm not supported");
      }

      if (sendType === "ibc-transfer") {
        return account.cosmos.makePacketForwardIBCTransferTx(
          accountStore,
          sendConfigs.channelConfig.channels,
          sendConfigs.amountConfig.amount[0].toDec().toString(),
          sendConfigs.amountConfig.amount[0].currency,
          sendConfigs.recipientConfig.recipient
        );
      }

      if (isEvmTx) {
        return {
          simulate: () =>
            ethereumAccount.simulateGasForSendTokenTx({
              currency: sendConfigs.amountConfig.amount[0].currency,
              amount: sendConfigs.amountConfig.amount[0].toDec().toString(),
              sender: sendConfigs.senderConfig.sender,
              recipient: sendConfigs.recipientConfig.recipient,
            }),
        };
      }

      return account.makeSendTokenTx(
        sendConfigs.amountConfig.amount[0].toDec().toString(),
        sendConfigs.amountConfig.amount[0].currency,
        sendConfigs.recipientConfig.recipient
      );
    }
  );
  return gasSimulator;
}

function useChangeSenderAddressWhenEtherMintChainSendToHexAddress(
  isEvmChain: boolean,
  sendConfigs: {
    amountConfig: IBCAmountConfig;
    memoConfig: MemoConfig;
    gasConfig: GasConfig;
    feeConfig: FeeConfig;
    recipientConfig: IBCRecipientConfig;
    channelConfig: IBCChannelConfig;
    senderConfig: SenderConfig;
  },
  chainInfo: IChainInfoImpl<ChainInfoWithCoreTypes>,
  isEVMOnlyChain: boolean,
  account: AccountSetBase & CosmosAccount & CosmwasmAccount & SecretAccount,
  setIsEvmTx: React.Dispatch<React.SetStateAction<boolean>>,
  ethereumAccount: EthereumAccountBase
) {
  useEffect(() => {
    if (isEvmChain) {
      const sendingDenomHelper = new DenomHelper(
        sendConfigs.amountConfig.currency.coinMinimalDenom
      );
      const isERC20 = sendingDenomHelper.type === "erc20";
      const isSendingNativeToken =
        sendingDenomHelper.type === "native" &&
        (chainInfo.stakeCurrency?.coinMinimalDenom ??
          chainInfo.currencies[0].coinMinimalDenom) ===
          sendingDenomHelper.denom;

      const isSendToHexAddressAndNotIBCToken =
        sendConfigs.recipientConfig.isRecipientEthereumHexAddress &&
        (isERC20 || isSendingNativeToken);

      const newIsEvmTx = isEVMOnlyChain || isSendToHexAddressAndNotIBCToken;

      const newSenderAddress = newIsEvmTx
        ? account.ethereumHexAddress
        : account.bech32Address;

      sendConfigs.senderConfig.setValue(newSenderAddress);
      setIsEvmTx(newIsEvmTx);
      ethereumAccount.setIsSendingTx(false);
    }
  }, [
    account,
    ethereumAccount,
    isEvmChain,
    isEVMOnlyChain,
    sendConfigs.amountConfig.currency.coinMinimalDenom,
    sendConfigs.recipientConfig.isRecipientEthereumHexAddress,
    sendConfigs.senderConfig,
    chainInfo.stakeCurrency?.coinMinimalDenom,
    chainInfo.currencies,
    setIsEvmTx,
  ]);
}

const REFRESH_EIP1559_TX_FEE_INTERVAL_TIME_MS = 12000;
function useRefreshEIP1559TxFee(
  isEvmTx: boolean,
  sendConfigs: {
    amountConfig: IBCAmountConfig;
    memoConfig: MemoConfig;
    gasConfig: GasConfig;
    feeConfig: FeeConfig;
    recipientConfig: IBCRecipientConfig;
    channelConfig: IBCChannelConfig;
    senderConfig: SenderConfig;
  }
) {
  useEffect(() => {
    if (isEvmTx) {
      // Refresh EIP-1559 fee every 12 seconds.
      const intervalId = setInterval(() => {
        sendConfigs.feeConfig.refreshEIP1559TxFees();
      }, REFRESH_EIP1559_TX_FEE_INTERVAL_TIME_MS);

      return () => clearInterval(intervalId);
    }
  }, [isEvmTx, sendConfigs.feeConfig]);
}

const QUERY_ROUTE_FETCH_TIMEOUT_MS = 10000;
function useFetchBridgeRouterPer10sec(
  queryRoute: ObservableQueryRouteInner | undefined
) {
  useEffect(() => {
    if (queryRoute && !queryRoute.isFetching) {
      const timeoutId = setTimeout(() => {
        if (!queryRoute.isFetching) {
          queryRoute.fetch();
        }
      }, QUERY_ROUTE_FETCH_TIMEOUT_MS);

      return () => {
        clearTimeout(timeoutId);
      };
    }
    // eslint가 자동으로 추천해주는 deps를 쓰면 안된다.
    // queryRoute는 amountConfig에서 필요할때마다 reference가 바뀌므로 deps에 넣는다.
    // queryRoute.isFetching는 현재 fetch중인지 아닌지를 알려주는 값이므로 deps에 꼭 넣어야한다.
    // queryRoute는 input이 같으면 reference가 같으므로 eslint에서 추천하는대로 queryRoute만 deps에 넣으면
    // queryRoute.isFetching이 무시되기 때문에 수동으로 넣어줌
    // 해당 코드는 IBCSwapPage에서 그대로 가져옴
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryRoute, queryRoute?.isFetching]);
}

const useIBCSwapConfigWithRecipientConfig = (
  chainGetter: ChainGetter,
  queriesStore: IQueriesStore,
  accountStore: IAccountStoreWithInjects<[CosmosAccount, CosmwasmAccount]>,
  ethereumAccountStore: EthereumAccountStore,
  skipQueries: SkipQueries,
  chainId: string,
  sender: string,
  initialGas: number,
  outChainId: string,
  outCurrency: AppCurrency,
  swapFeeBps: number,
  options: {
    allowHexAddressToBech32Address?: boolean;
    allowHexAddressOnly?: boolean;
    icns?: {
      chainId: string;
      resolverContractAddress: string;
    };
    ens?: {
      chainId: string;
    };
    computeTerraClassicTax?: boolean;
  } = {}
) => {
  const isAllowSwaps = false;

  const ibcSwapConfigsForBridge = useIBCSwapConfig(
    chainGetter,
    queriesStore,
    accountStore,
    ethereumAccountStore,
    skipQueries,
    chainId,
    sender,
    initialGas,
    outChainId,
    outCurrency,
    swapFeeBps,
    isAllowSwaps,
    {
      evmSwaps: false,
    }
  );
  const channelConfig = useIBCChannelConfig(false);

  const recipientConfig = useIBCRecipientConfig(
    chainGetter,
    outChainId,
    channelConfig,
    options,
    false
  );

  return {
    ...ibcSwapConfigsForBridge,
    recipientConfig,
  };
};

export const SendAmountPage: FunctionComponent = observer(() => {
  const {
    analyticsStore,
    accountStore,
    ethereumAccountStore,
    chainStore,
    queriesStore,
    skipQueriesStore,
    priceStore,
    uiConfigStore,
  } = useStore();
  const addressRef = useRef<HTMLInputElement | null>(null);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const notification = useNotification();
  const intl = useIntl();

  const initialChainId = searchParams.get("chainId");
  const initialCoinMinimalDenom = searchParams.get("coinMinimalDenom");

  const chainId = initialChainId || chainStore.chainInfosInUI[0].chainId;
  const chainInfo = chainStore.getChain(chainId);
  const isEvmChain = chainStore.isEvmChain(chainId);
  const isEVMOnlyChain = chainStore.isEvmOnlyChain(chainId);
  // const [isLessAmountThanFee, setIsLessAmountThanFee] = useState(false);

  const coinMinimalDenom =
    initialCoinMinimalDenom ||
    chainStore.getChain(chainId).currencies[0].coinMinimalDenom;
  const currency = chainInfo.forceFindCurrency(coinMinimalDenom);
  const isErc20 = new DenomHelper(currency.coinMinimalDenom).type === "erc20";

  const [sendType, setSendType] = useState<SendType>("send");

  const [isTxLoading, setIsTxLoading] = useState(false);
  const [calculatingTxError, setCalculatingTxError] = useState<
    Error | undefined
  >();

  const [destinationChainInfoOfBridge, setDestinationChainInfoOfBridge] =
    useState({
      chainId,
      currency: currency,
    });

  const [
    isIBCTransferDestinationModalOpen,
    setIsIBCTransferDestinationModalOpen,
  ] = useState(false);

  useKeepIBCSwapObservable(skipQueriesStore);

  useEffect(() => {
    if (addressRef.current) {
      addressRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (!initialChainId || !initialCoinMinimalDenom) {
      navigate(
        `/send/select-asset?navigateReplace=true&navigateTo=${encodeURIComponent(
          "/send?chainId={chainId}&coinMinimalDenom={coinMinimalDenom}"
        )}`
      );
    }
  }, [navigate, initialChainId, initialCoinMinimalDenom]);

  const [isEvmTx, setIsEvmTx] = useState(isErc20 || isEVMOnlyChain);

  const account = accountStore.getAccount(chainId);

  const ethereumAccount = ethereumAccountStore.getAccount(chainId);

  const queryBalances = queriesStore.get(chainId).queryBalances;
  const sender = isEvmTx ? account.ethereumHexAddress : account.bech32Address;
  const balance = isEvmTx
    ? queryBalances.getQueryEthereumHexAddress(sender).getBalance(currency)
    : queryBalances.getQueryBech32Address(sender).getBalance(currency);

  const isDestinationEvmChain = chainStore.isEvmChain(
    destinationChainInfoOfBridge.chainId
  );
  const isDestinationEvmOnlyChain = chainStore.isEvmOnlyChain(
    destinationChainInfoOfBridge.chainId
  );

  const ibcSwapConfigsForBridge = useIBCSwapConfigWithRecipientConfig(
    chainStore,
    queriesStore,
    accountStore,
    ethereumAccountStore,
    skipQueriesStore,
    chainId,
    isEVMOnlyChain ? account.ethereumHexAddress : account.bech32Address,
    200000,
    destinationChainInfoOfBridge.chainId,
    destinationChainInfoOfBridge.currency,
    //NOTE - when swap is used on send page, it use bridge so swap fee is 10
    10,
    {
      allowHexAddressToBech32Address:
        isDestinationEvmChain &&
        !isDestinationEvmOnlyChain &&
        !chainStore.getChain(chainId).chainId.startsWith("injective"),
      allowHexAddressOnly: isDestinationEvmOnlyChain,
      icns: ICNSInfo,
      ens: ENSInfo,
      computeTerraClassicTax: true,
    }
  );
  ibcSwapConfigsForBridge.amountConfig.setCurrency(currency);

  const gasSimulatorForBridge = useGetGasSimulationForBridge(
    chainStore,
    chainId,
    ibcSwapConfigsForBridge,
    ethereumAccountStore,
    currency,
    {
      chainId: ibcSwapConfigsForBridge.recipientConfig.chainId,
      recipient: ibcSwapConfigsForBridge.recipientConfig.value,
    }
  );
  const txConfigsValidateForBridge = useTxConfigsValidate({
    ...ibcSwapConfigsForBridge,
    gasSimulator: gasSimulatorForBridge,
  });
  useTxConfigsQueryString(chainId, {
    ...ibcSwapConfigsForBridge,
    gasSimulator: gasSimulatorForBridge,
  });

  const queryIBCSwap = ibcSwapConfigsForBridge.amountConfig.getQueryIBCSwap();
  const queryRoute = queryIBCSwap?.getQueryRoute();
  useFetchBridgeRouterPer10sec(queryRoute);

  const sendConfigs = useSendMixedIBCTransferConfig(
    chainStore,
    queriesStore,
    chainId,
    sender,
    // TODO: 이 값을 config 밑으로 빼자
    isEvmTx ? 21000 : 300000,
    sendType === "ibc-transfer",
    {
      allowHexAddressToBech32Address:
        !isEvmChain &&
        !isEvmTx &&
        !chainStore.getChain(chainId).chainId.startsWith("injective"),
      allowHexAddressOnly: isEvmTx,
      icns: ICNSInfo,
      ens: ENSInfo,
      computeTerraClassicTax: true,
    }
  );
  sendConfigs.amountConfig.setCurrency(currency);

  const gasSimulatorForNotBridgeSend = useGetGasSimulatorOfNotBridge(
    isEvmTx,
    sendConfigs,
    chainStore,
    chainId,
    sendType,
    account,
    accountStore,
    ethereumAccount
  );

  const currentFeeCurrencyCoinMinimalDenom =
    sendConfigs.feeConfig.fees[0]?.currency.coinMinimalDenom;
  useEffect(() => {
    const chainInfo = chainStore.getChain(chainId);
    // feemarket 이상하게 만들어서 simulate하면 더 적은 gas가 나온다 귀찮아서 대충 처리.
    if (chainInfo.hasFeature("feemarket")) {
      if (
        currentFeeCurrencyCoinMinimalDenom !==
        chainInfo.currencies[0].coinMinimalDenom
      ) {
        gasSimulatorForNotBridgeSend.setGasAdjustmentValue("2");
      } else {
        gasSimulatorForNotBridgeSend.setGasAdjustmentValue("1.6");
      }
    }
  }, [
    chainId,
    chainStore,
    gasSimulatorForNotBridgeSend,
    currentFeeCurrencyCoinMinimalDenom,
  ]);

  useChangeSenderAddressWhenEtherMintChainSendToHexAddress(
    isEvmChain,
    sendConfigs,
    chainInfo,
    isEVMOnlyChain,
    account,
    setIsEvmTx,
    ethereumAccount
  );

  useEffect(() => {
    (async () => {
      if (sendType === "bridge") {
        return;
      }

      if (chainInfo.features.includes("op-stack-l1-data-fee")) {
        const { maxFeePerGas, maxPriorityFeePerGas, gasPrice } =
          sendConfigs.feeConfig.getEIP1559TxFees(sendConfigs.feeConfig.type);

        const { to, gasLimit, value, data, chainId } =
          ethereumAccount.makeSendTokenTx({
            currency: sendConfigs.amountConfig.amount[0].currency,
            amount: sendConfigs.amountConfig.amount[0].toDec().toString(),
            to: sendConfigs.recipientConfig.recipient,
            gasLimit: sendConfigs.gasConfig.gas,
            maxFeePerGas: maxFeePerGas?.toString(),
            maxPriorityFeePerGas: maxPriorityFeePerGas?.toString(),
            gasPrice: gasPrice?.toString(),
          });

        const l1DataFee = await ethereumAccount.simulateOpStackL1Fee({
          to,
          gasLimit,
          value,
          data,
          chainId,
        });
        sendConfigs.feeConfig.setL1DataFee(new Dec(BigInt(l1DataFee)));
      }
    })();
  }, [
    sendType,
    chainInfo.features,
    ethereumAccount,
    sendConfigs.amountConfig.amount,
    sendConfigs.feeConfig,
    sendConfigs.gasConfig.gas,
    sendConfigs.recipientConfig.recipient,
  ]);

  useRefreshEIP1559TxFee(isEvmTx, sendConfigs);

  useEffect(() => {
    // To simulate secretwasm, we need to include the signature in the tx.
    // With the current structure, this approach is not possible.
    if (
      sendConfigs.amountConfig.currency &&
      new DenomHelper(sendConfigs.amountConfig.currency.coinMinimalDenom)
        .type === "secret20"
    ) {
      gasSimulatorForNotBridgeSend.forceDisable(
        new Error(
          intl.formatMessage({ id: "error.simulating-secret-20-not-supported" })
        )
      );
      sendConfigs.gasConfig.setValue(
        // TODO: 이 값을 config 밑으로 빼자
        250000
      );
    } else {
      gasSimulatorForNotBridgeSend.forceDisable(false);
      gasSimulatorForNotBridgeSend.setEnabled(true);
    }
  }, [
    gasSimulatorForNotBridgeSend,
    intl,
    sendConfigs.amountConfig.currency,
    sendConfigs.gasConfig,
  ]);

  // --------------------------
  // from or to 중에서 coingecko로부터 가격을 알 수 없는 경우 price impact를 알 수 없기 때문에
  // 이런 경우 유저에게 경고를 표시해줌
  // 가끔씩 바보같이 coingecko에 올라가있지도 않은데 지 맘대로 coingecko id를 넣는 얘들도 있어서
  // 실제로 쿼리를 해보고 있는지 아닌지 판단하는 로직도 있음
  // coingecko로부터 가격이 undefined거나 0이면 알 수 없는 것으로 처리함.
  // 근데 쿼리에 걸리는 시간도 있으니 이 경우는 1000초 쉼.
  const inCurrency = ibcSwapConfigsForBridge.amountConfig.currency;
  const outCurrency = ibcSwapConfigsForBridge.amountConfig.outCurrency;
  const [inOrOutChangedDelay, setInOrOutChangedDelay] = useState(true);
  useEffect(() => {
    setInOrOutChangedDelay(true);
    const timeoutId = setTimeout(() => {
      setInOrOutChangedDelay(false);
    }, 1000);

    return () => {
      clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inCurrency.coinMinimalDenom, outCurrency.coinMinimalDenom]);
  const unablesToPopulatePrice = (() => {
    const r: string[] = [];
    if (!inCurrency.coinGeckoId) {
      if ("originCurrency" in inCurrency && inCurrency.originCurrency) {
        r.push(inCurrency.originCurrency.coinDenom);
      } else {
        r.push(inCurrency.coinDenom);
      }
    } else if (!inOrOutChangedDelay) {
      const price = priceStore.getPrice(inCurrency.coinGeckoId, "usd");
      if (!price) {
        if ("originCurrency" in inCurrency && inCurrency.originCurrency) {
          r.push(inCurrency.originCurrency.coinDenom);
        } else {
          r.push(inCurrency.coinDenom);
        }
      }
    }
    if (!outCurrency.coinGeckoId) {
      if ("originCurrency" in outCurrency && outCurrency.originCurrency) {
        r.push(outCurrency.originCurrency.coinDenom);
      } else {
        r.push(outCurrency.coinDenom);
      }
    } else if (!inOrOutChangedDelay) {
      const price = priceStore.getPrice(outCurrency.coinGeckoId, "usd");
      if (!price) {
        if ("originCurrency" in outCurrency && outCurrency.originCurrency) {
          r.push(outCurrency.originCurrency.coinDenom);
        } else {
          r.push(outCurrency.coinDenom);
        }
      }
    }

    return r;
  })();
  // --------------------------

  useTxConfigsQueryString(chainId, {
    ...sendConfigs,
    gasSimulator: gasSimulatorForNotBridgeSend,
  });
  useIBCChannelConfigQueryString(sendConfigs.channelConfig, (channels) => {
    if (channels && channels.length > 0) {
      setSendType("ibc-transfer");
    }
  });

  const isIBCTransferPrevious = usePreviousDistinct(sendType);
  useEffect(() => {
    if (isIBCTransferPrevious !== "send" && sendType === "send") {
      // ibc transfer에서 기본 send로 변할때 recipient를 초기화한다.
      sendConfigs.recipientConfig.setValue("");
    }
  }, [isIBCTransferPrevious, sendType, sendConfigs.recipientConfig]);

  const txConfigsValidate = useTxConfigsValidate({
    ...sendConfigs,
    gasSimulator: gasSimulatorForNotBridgeSend,
  });

  // IBC Send일때 auto fill일때는 recipient input에서 paragraph로 auto fill되었다는 것을 알려준다.
  const [isRecipientNotBasicSendSetAuto, setIsRecipientNotBasicSendSetAuto] =
    useState(false);
  // 유저가 주소를 수정했을때 auto fill이라는 state를 해제하기 위해서 마지막으로 auto fill된 주소를 기억한다.
  const [recipientAddressNotBasicSend, setRecipientAddressNotBasicSend] =
    useState("");

  useEffect(() => {
    const recipientAddress =
      sendType === "bridge"
        ? ibcSwapConfigsForBridge.recipientConfig.value
        : sendConfigs.recipientConfig.value;

    if (
      sendType === "send" ||
      recipientAddress !== recipientAddressNotBasicSend
    ) {
      setIsRecipientNotBasicSendSetAuto(false);
    }
    // else 문을 써서 같다면 setAuto를 true로 해주면 안된다.
    // 의도상 한번 바꾸면 다시 auto fill 값과 같더라도 유저가 수정한걸로 간주한다.
  }, [
    recipientAddressNotBasicSend,
    sendConfigs.recipientConfig.value,
    ibcSwapConfigsForBridge.recipientConfig.value,
    sendType,
  ]);

  const [ibcChannelFluent, setIBCChannelFluent] = useState<
    | {
        destinationChainId: string;
        originDenom: string;
        originChainId: string;

        channels: {
          portId: string;
          channelId: string;

          counterpartyChainId: string;
        }[];
      }
    | undefined
  >(undefined);

  const isDetachedMode = searchParams.get("detached") === "true";

  const historyType =
    sendType === "ibc-transfer" ? "basic-send/ibc" : "basic-send";

  const [isSendingIBCToken, setIsSendingIBCToken] = useState(false);
  useEffect(() => {
    if (sendType === "send") {
      if (
        new DenomHelper(sendConfigs.amountConfig.currency.coinMinimalDenom)
          .type === "native" &&
        sendConfigs.amountConfig.currency.coinMinimalDenom.startsWith("ibc/")
      ) {
        setIsSendingIBCToken(true);
        return;
      }
    }

    setIsSendingIBCToken(false);
  }, [sendType, sendConfigs.amountConfig.currency]);

  // Prefetch IBC channels to reduce the UI flickering(?) when open ibc channel modal.
  try {
    skipQueriesStore.queryIBCPacketForwardingTransfer.getIBCChannels(
      chainId,
      currency.coinMinimalDenom
    );
  } catch (e) {
    console.log(e);
  }

  const destinationChainInfo = useMemo(() => {
    if (sendType === "ibc-transfer") {
      if (sendConfigs.channelConfig.channels.length === 0) {
        return undefined;
      }

      return chainStore.getChain(
        sendConfigs.channelConfig.channels[
          sendConfigs.channelConfig.channels.length - 1
        ].counterpartyChainId
      );
    }

    if (sendType === "bridge") {
      return chainStore.getChain(
        ibcSwapConfigsForBridge.amountConfig.outChainId
      );
    }
  }, [
    sendType,
    chainStore,
    sendConfigs.channelConfig.channels,
    ibcSwapConfigsForBridge,
  ]);

  const {
    feeConfig,
    gasConfig,
    senderConfig,
    recipientConfig,
    memoConfig,
    amountConfig,
  } = useMemo(() => {
    if (sendType === "bridge") {
      return {
        feeConfig: ibcSwapConfigsForBridge.feeConfig,
        gasConfig: ibcSwapConfigsForBridge.gasConfig,
        senderConfig: ibcSwapConfigsForBridge.senderConfig,
        recipientConfig: ibcSwapConfigsForBridge.recipientConfig,
        memoConfig: ibcSwapConfigsForBridge.memoConfig,
        amountConfig: ibcSwapConfigsForBridge.amountConfig,
      };
    }

    return {
      feeConfig: sendConfigs.feeConfig,
      gasConfig: sendConfigs.gasConfig,
      senderConfig: sendConfigs.senderConfig,
      recipientConfig: sendConfigs.recipientConfig,
      memoConfig: sendConfigs.memoConfig,
      amountConfig: sendConfigs.amountConfig,
    };
  }, [sendType, sendConfigs, ibcSwapConfigsForBridge]);

  const outCurrencyFetched =
    chainStore
      .getChain(ibcSwapConfigsForBridge.amountConfig.outChainId)
      .findCurrency(
        ibcSwapConfigsForBridge.amountConfig.outCurrency.coinMinimalDenom
      ) != null;

  const interactionBlocked =
    sendType === "bridge"
      ? txConfigsValidateForBridge.interactionBlocked || !outCurrencyFetched
      : txConfigsValidate.interactionBlocked;

  return (
    <HeaderLayout
      title={intl.formatMessage({ id: "page.send.amount.title" })}
      displayFlex={true}
      fixedMinHeight={true}
      left={<BackButton />}
      right={
        // side panel 모드에서는 detach 모드가 필요가 없다...
        isDetachedMode || isRunningInSidePanel() ? null : (
          <Box
            paddingRight="1rem"
            cursor="pointer"
            onClick={async (e) => {
              e.preventDefault();

              analyticsStore.logEvent("click_popOutButton");
              const url = window.location.href + "&detached=true";

              await openPopupWindow(url, undefined);
              window.close();
            }}
          >
            <DetachIcon size="1.5rem" color={ColorPalette["gray-300"]} />
          </Box>
        )
      }
      bottomButtons={[
        {
          disabled: interactionBlocked,
          text: intl.formatMessage({ id: "button.next" }),
          color: "primary",
          size: "large",
          type: "submit",
          isLoading: isEvmTx
            ? isTxLoading || ethereumAccount.isSendingTx
            : isTxLoading ||
              accountStore.getAccount(chainId).isSendingMsg ===
                (sendType === "ibc-transfer" ? "ibcTransfer" : "send"),
        },
      ]}
      onSubmit={async (e) => {
        e.preventDefault();

        if (!interactionBlocked) {
          let hasApprovalTxWhenBridge = false;

          try {
            if (sendType === "bridge") {
              setIsTxLoading(true);

              let tx: MakeTxResponse | UnsignedEVMTransactionWithErc20Approvals;

              const queryRoute = ibcSwapConfigsForBridge.amountConfig
                .getQueryIBCSwap()!
                .getQueryRoute();

              const swapFeeBpsReceiver: string[] = [];
              const simpleRoute: {
                isOnlyEvm: boolean;
                chainId: string;
                receiver: string;
              }[] = [];
              let routeDurationSeconds: number | undefined;
              const channels: {
                portId: string;
                channelId: string;
                counterpartyChainId: string;
              }[] = [];
              const swapChannelIndex: number = -1;
              const swapReceiver: string[] = [];

              try {
                let priorOutAmount: Int | undefined = undefined;
                if (queryRoute.response) {
                  priorOutAmount = new Int(queryRoute.response.data.amount_out);
                }

                if (!queryRoute.response) {
                  throw new Error("queryRoute.response is undefined");
                }

                const operations = queryRoute.response.data.operations;
                const isContainsSwap = operations.some(
                  (operation) => "swap" in operation || "evm_swap" in operation
                );
                const isUseSwap =
                  queryRoute.response.data.does_swap || isContainsSwap;

                if (isUseSwap) {
                  //NOTE - ibcSwapAmountConfig에서 이미 에러를 발생시키만
                  //어쩌다 여기까지 오면 tx가 실행되지 않게 막음
                  throw new Error("Swap in bridge is not allowed");
                }

                routeDurationSeconds =
                  queryRoute.response.data.estimated_route_duration_seconds;

                // 일단은 체인 id를 keplr에서 사용하는 형태로 바꿔야 한다.
                for (const chainId of queryRoute.response.data.chain_ids) {
                  const isOnlyEvm = parseInt(chainId) > 0;
                  const chainIdInKeplr = isOnlyEvm
                    ? `eip155:${chainId}`
                    : chainId;
                  if (!chainStore.hasChain(chainIdInKeplr)) {
                    continue;
                  }

                  const receiverAccount =
                    accountStore.getAccount(chainIdInKeplr);
                  if (receiverAccount.walletStatus !== WalletStatus.Loaded) {
                    await receiverAccount.init();
                  }

                  if (isOnlyEvm && !receiverAccount.ethereumHexAddress) {
                    const receiverChainInfo =
                      chainStore.hasChain(chainId) &&
                      chainStore.getChain(chainId);
                    if (
                      receiverAccount.isNanoLedger &&
                      receiverChainInfo &&
                      (receiverChainInfo.bip44.coinType === 60 ||
                        receiverChainInfo.features.includes(
                          "eth-address-gen"
                        ) ||
                        receiverChainInfo.features.includes("eth-key-sign") ||
                        receiverChainInfo.evm != null)
                    ) {
                      throw new Error(
                        "Please connect Ethereum app on Ledger with Keplr to get the address"
                      );
                    }

                    throw new Error(
                      "receiverAccount.ethereumHexAddress is undefined"
                    );
                  }

                  simpleRoute.push({
                    isOnlyEvm,
                    chainId: chainIdInKeplr,
                    receiver: isOnlyEvm
                      ? receiverAccount.ethereumHexAddress
                      : receiverAccount.bech32Address,
                  });
                }

                const [_tx] = await Promise.all([
                  ibcSwapConfigsForBridge.amountConfig.getTx(
                    uiConfigStore.ibcSwapConfig.slippageNum,
                    // 코스모스 스왑은 스왑베뉴가 무조건 하나라고 해서 일단 처음걸 쓰기로 한다.
                    swapFeeBpsReceiver[0],
                    priorOutAmount,
                    {
                      chainId: ibcSwapConfigsForBridge.recipientConfig.chainId,
                      recipient: ibcSwapConfigsForBridge.recipientConfig.value,
                    }
                  ),
                ]);
                tx = _tx;
              } catch (e) {
                setCalculatingTxError(e);
                setIsTxLoading(false);
                return;
              }

              setCalculatingTxError(undefined);

              try {
                if ("send" in tx) {
                  await tx.send(
                    ibcSwapConfigsForBridge.feeConfig.toStdFee(),
                    ibcSwapConfigsForBridge.memoConfig.memo,
                    {
                      preferNoSetFee: true,
                      preferNoSetMemo: false,

                      sendTx: async (chainId, tx, mode) => {
                        const outChainId =
                          ibcSwapConfigsForBridge.amountConfig.outChainId;
                        const outCurrency =
                          ibcSwapConfigsForBridge.amountConfig.outCurrency;

                        const msg = new SendTxAndRecordWithIBCSwapMsg(
                          "amount-in",
                          chainId,
                          outChainId,
                          tx,
                          channels,
                          {
                            chainId: outChainId,
                            denom: outCurrency.coinMinimalDenom,
                          },
                          swapChannelIndex,
                          swapReceiver,
                          mode,
                          false,
                          ibcSwapConfigsForBridge.senderConfig.sender,
                          ibcSwapConfigsForBridge.amountConfig.amount.map(
                            (amount) => {
                              return {
                                amount: DecUtils.getTenExponentN(
                                  amount.currency.coinDecimals
                                )
                                  .mul(amount.toDec())
                                  .toString(),
                                denom: amount.currency.coinMinimalDenom,
                              };
                            }
                          ),
                          ibcSwapConfigsForBridge.memoConfig.memo,
                          {
                            currencies:
                              chainStore.getChain(outChainId).currencies,
                          },
                          false // bridge의 경우 무조건 interChainSwap이므로 무조건 false, 정확히는 swap이 아니지만 swap 페이지에서 그렇게 적혀있어서 해당 용어로 사용
                        );

                        return await new InExtensionMessageRequester().sendMessage(
                          BACKGROUND_PORT,
                          msg
                        );
                      },
                    },
                    {
                      onBroadcasted: (txHash) => {
                        const inChainId =
                          ibcSwapConfigsForBridge.amountConfig.chainId;

                        const outChainId =
                          ibcSwapConfigsForBridge.amountConfig.outChainId;
                        const outCurrency =
                          ibcSwapConfigsForBridge.amountConfig.outCurrency;

                        const msg = new RecordTxWithSkipSwapMsg(
                          inChainId,
                          outChainId,
                          {
                            chainId: outChainId,
                            denom: outCurrency.coinMinimalDenom,
                            expectedAmount:
                              ibcSwapConfigsForBridge.amountConfig.outAmount
                                .toDec()
                                .toString(),
                          },
                          simpleRoute,
                          ibcSwapConfigsForBridge.senderConfig.sender,
                          chainStore.isEvmOnlyChain(outChainId)
                            ? accountStore.getAccount(outChainId)
                                .ethereumHexAddress
                            : accountStore.getAccount(outChainId).bech32Address,
                          [
                            ...ibcSwapConfigsForBridge.amountConfig.amount.map(
                              (amount) => {
                                return {
                                  amount: DecUtils.getTenExponentN(
                                    amount.currency.coinDecimals
                                  )
                                    .mul(amount.toDec())
                                    .toString(),
                                  denom: amount.currency.coinMinimalDenom,
                                };
                              }
                            ),
                            {
                              amount: DecUtils.getTenExponentN(
                                ibcSwapConfigsForBridge.amountConfig.outAmount
                                  .currency.coinDecimals
                              )
                                .mul(
                                  ibcSwapConfigsForBridge.amountConfig.outAmount.toDec()
                                )
                                .toString(),
                              denom:
                                ibcSwapConfigsForBridge.amountConfig.outAmount
                                  .currency.coinMinimalDenom,
                            },
                          ],
                          {
                            currencies:
                              chainStore.getChain(outChainId).currencies,
                          },
                          routeDurationSeconds ?? 0,
                          Buffer.from(txHash).toString("hex")
                        );

                        new InExtensionMessageRequester().sendMessage(
                          BACKGROUND_PORT,
                          msg
                        );

                        //NOTE - GA에서 어떤 제목으로 기록할지가 먼저 필요함 그 이후 해당 로직 주석 제가 필요
                        // const params: Record<
                        //   string,
                        //   | number
                        //   | string
                        //   | boolean
                        //   | number[]
                        //   | string[]
                        //   | undefined
                        // > = {
                        //   inChainId: inChainId,
                        //   inChainIdentifier:
                        //     ChainIdHelper.parse(inChainId).identifier,
                        //   inCurrencyMinimalDenom: inCurrency.coinMinimalDenom,
                        //   inCurrencyDenom: inCurrency.coinDenom,
                        //   inCurrencyCommonMinimalDenom:
                        //     inCurrency.coinMinimalDenom,
                        //   inCurrencyCommonDenom: inCurrency.coinDenom,
                        //   outChainId: outChainId,
                        //   outChainIdentifier:
                        //     ChainIdHelper.parse(outChainId).identifier,
                        //   outCurrencyMinimalDenom: outCurrency.coinMinimalDenom,
                        //   outCurrencyDenom: outCurrency.coinDenom,
                        //   outCurrencyCommonMinimalDenom:
                        //     outCurrency.coinMinimalDenom,
                        //   outCurrencyCommonDenom: outCurrency.coinDenom,
                        //   swapType: ibcSwapConfigsForBridge.amountConfig.type,
                        // };
                        // if (
                        //   "originChainId" in inCurrency &&
                        //   inCurrency.originChainId
                        // ) {
                        //   const originChainId = inCurrency.originChainId;
                        //   params["inOriginChainId"] = originChainId;
                        //   params["inOriginChainIdentifier"] =
                        //     ChainIdHelper.parse(originChainId).identifier;

                        //   params["inToDifferentChain"] = true;
                        // }
                        // if (
                        //   "originCurrency" in inCurrency &&
                        //   inCurrency.originCurrency
                        // ) {
                        //   params["inCurrencyCommonMinimalDenom"] =
                        //     inCurrency.originCurrency.coinMinimalDenom;
                        //   params["inCurrencyCommonDenom"] =
                        //     inCurrency.originCurrency.coinDenom;
                        // }
                        // if (
                        //   "originChainId" in outCurrency &&
                        //   outCurrency.originChainId
                        // ) {
                        //   const originChainId = outCurrency.originChainId;
                        //   params["outOriginChainId"] = originChainId;
                        //   params["outOriginChainIdentifier"] =
                        //     ChainIdHelper.parse(originChainId).identifier;

                        //   params["outToDifferentChain"] = true;
                        // }
                        // if (
                        //   "originCurrency" in outCurrency &&
                        //   outCurrency.originCurrency
                        // ) {
                        //   params["outCurrencyCommonMinimalDenom"] =
                        //     outCurrency.originCurrency.coinMinimalDenom;
                        //   params["outCurrencyCommonDenom"] =
                        //     outCurrency.originCurrency.coinDenom;
                        // }
                        // params["inRange"] = amountToAmbiguousString(
                        //   ibcSwapConfigsForBridge.amountConfig.amount[0]
                        // );
                        // params["outRange"] = amountToAmbiguousString(
                        //   ibcSwapConfigsForBridge.amountConfig.outAmount
                        // );

                        // // UI 상에서 in currency의 가격은 in input에서 표시되고
                        // // out currency의 가격은 swap fee에서 표시된다.
                        // // price store에서 usd는 무조건 쿼리하므로 in, out currency의 usd는 보장된다.
                        // const inCurrencyPrice = priceStore.calculatePrice(
                        //   ibcSwapConfigsForBridge.amountConfig.amount[0],
                        //   "usd"
                        // );
                        // if (inCurrencyPrice) {
                        //   params["inFiatRange"] =
                        //     amountToAmbiguousString(inCurrencyPrice);
                        //   params["inFiatAvg"] =
                        //     amountToAmbiguousAverage(inCurrencyPrice);
                        // }
                        // const outCurrencyPrice = priceStore.calculatePrice(
                        //   ibcSwapConfigsForBridge.amountConfig.outAmount,
                        //   "usd"
                        // );
                        // if (outCurrencyPrice) {
                        //   params["outFiatRange"] =
                        //     amountToAmbiguousString(outCurrencyPrice);
                        //   params["outFiatAvg"] =
                        //     amountToAmbiguousAverage(outCurrencyPrice);
                        // }

                        // new InExtensionMessageRequester().sendMessage(
                        //   BACKGROUND_PORT,
                        //   new LogAnalyticsEventMsg("ibc_swap", params)
                        // );

                        // analyticsStore.logEvent("swap_occurred", {
                        //   in_chain_id: inChainId,
                        //   in_chain_identifier:
                        //     ChainIdHelper.parse(inChainId).identifier,
                        //   in_currency_minimal_denom:
                        //     inCurrency.coinMinimalDenom,
                        //   in_currency_denom: inCurrency.coinDenom,
                        //   out_chain_id: outChainId,
                        //   out_chain_identifier:
                        //     ChainIdHelper.parse(outChainId).identifier,
                        //   out_currency_minimal_denom:
                        //     outCurrency.coinMinimalDenom,
                        //   out_currency_denom: outCurrency.coinDenom,
                        // });
                      },
                      onFulfill: (tx: any) => {
                        if (tx.code != null && tx.code !== 0) {
                          console.log(tx.log ?? tx.raw_log);

                          notification.show(
                            "failed",
                            intl.formatMessage({
                              id: "error.transaction-failed",
                            }),
                            ""
                          );
                          return;
                        }

                        notification.show(
                          "success",
                          intl.formatMessage({
                            id: "notification.transaction-success",
                          }),
                          ""
                        );
                      },
                    }
                  );
                } else {
                  const ethereumAccount = ethereumAccountStore.getAccount(
                    ibcSwapConfigsForBridge.amountConfig.chainId
                  );
                  const sender = ibcSwapConfigsForBridge.senderConfig.sender;

                  const inCurrency =
                    ibcSwapConfigsForBridge.amountConfig.currency;
                  const inChainId =
                    ibcSwapConfigsForBridge.amountConfig.chainId;
                  const outChainId =
                    ibcSwapConfigsForBridge.amountConfig.outChainId;
                  const outCurrency =
                    ibcSwapConfigsForBridge.amountConfig.outCurrency;

                  const isErc20InCurrency =
                    ("type" in inCurrency && inCurrency.type === "erc20") ||
                    inCurrency.coinMinimalDenom.startsWith("erc20:");
                  const erc20Approval = tx.requiredErc20Approvals?.[0];
                  const erc20ApprovalTx =
                    erc20Approval && isErc20InCurrency
                      ? ethereumAccount.makeErc20ApprovalTx(
                          {
                            ...inCurrency,
                            type: "erc20",
                            contractAddress:
                              inCurrency.coinMinimalDenom.replace("erc20:", ""),
                          },
                          erc20Approval.spender,
                          erc20Approval.amount
                        )
                      : undefined;

                  const { maxFeePerGas, maxPriorityFeePerGas, gasPrice } =
                    ibcSwapConfigsForBridge.feeConfig.getEIP1559TxFees(
                      ibcSwapConfigsForBridge.feeConfig.type
                    );

                  const feeObject =
                    maxFeePerGas && maxPriorityFeePerGas
                      ? {
                          type: 2,
                          maxFeePerGas: `0x${BigInt(
                            maxFeePerGas.truncate().toString()
                          ).toString(16)}`,
                          maxPriorityFeePerGas: `0x${BigInt(
                            maxPriorityFeePerGas.truncate().toString()
                          ).toString(16)}`,
                          gasLimit: `0x${ibcSwapConfigsForBridge.gasConfig.gas.toString(
                            16
                          )}`,
                        }
                      : {
                          gasPrice: `0x${BigInt(
                            gasPrice.truncate().toString()
                          ).toString(16)}`,
                          gasLimit: `0x${ibcSwapConfigsForBridge.gasConfig.gas.toString(
                            16
                          )}`,
                        };
                  ethereumAccount.setIsSendingTx(true);

                  if (erc20ApprovalTx) {
                    hasApprovalTxWhenBridge = true;
                  }

                  await ethereumAccount.sendEthereumTx(
                    sender,
                    {
                      ...(erc20ApprovalTx ?? tx),
                      ...feeObject,
                    },
                    {
                      onBroadcasted: (txHash) => {
                        if (!erc20ApprovalTx) {
                          ethereumAccount.setIsSendingTx(false);
                          const msg = new RecordTxWithSkipSwapMsg(
                            inChainId,
                            outChainId,
                            {
                              chainId: outChainId,
                              denom: outCurrency.coinMinimalDenom,
                              expectedAmount:
                                ibcSwapConfigsForBridge.amountConfig.outAmount
                                  .toDec()
                                  .toString(),
                            },
                            simpleRoute,
                            sender,
                            chainStore.isEvmOnlyChain(outChainId)
                              ? accountStore.getAccount(outChainId)
                                  .ethereumHexAddress
                              : accountStore.getAccount(outChainId)
                                  .bech32Address,
                            [
                              ...ibcSwapConfigsForBridge.amountConfig.amount.map(
                                (amount) => {
                                  return {
                                    amount: DecUtils.getTenExponentN(
                                      amount.currency.coinDecimals
                                    )
                                      .mul(amount.toDec())
                                      .toString(),
                                    denom: amount.currency.coinMinimalDenom,
                                  };
                                }
                              ),
                              {
                                amount: DecUtils.getTenExponentN(
                                  ibcSwapConfigsForBridge.amountConfig.outAmount
                                    .currency.coinDecimals
                                )
                                  .mul(
                                    ibcSwapConfigsForBridge.amountConfig.outAmount.toDec()
                                  )
                                  .toString(),
                                denom:
                                  ibcSwapConfigsForBridge.amountConfig.outAmount
                                    .currency.coinMinimalDenom,
                              },
                            ],
                            {
                              currencies:
                                chainStore.getChain(outChainId).currencies,
                            },
                            routeDurationSeconds ?? 0,
                            txHash
                          );
                          new InExtensionMessageRequester().sendMessage(
                            BACKGROUND_PORT,
                            msg
                          );

                          if (!isDetachedMode) {
                            navigate("/", {
                              replace: true,
                            });
                          } else {
                            window.close();
                          }
                        }
                      },
                      onFulfill: (txReceipt) => {
                        const queryBalances = queriesStore.get(
                          ibcSwapConfigsForBridge.amountConfig.chainId
                        ).queryBalances;
                        queryBalances
                          .getQueryEthereumHexAddress(sender)
                          .balances.forEach((balance) => {
                            if (
                              balance.currency.coinMinimalDenom ===
                                ibcSwapConfigsForBridge.amountConfig.currency
                                  .coinMinimalDenom ||
                              ibcSwapConfigsForBridge.feeConfig.fees.some(
                                (fee) =>
                                  fee.currency.coinMinimalDenom ===
                                  balance.currency.coinMinimalDenom
                              )
                            ) {
                              balance.fetch();
                            }
                          });
                        if (txReceipt.status === EthTxStatus.Success) {
                          notification.show(
                            "success",
                            intl.formatMessage({
                              id: "notification.transaction-success",
                            }),
                            ""
                          );
                          if (erc20ApprovalTx) {
                            delete (
                              tx as UnsignedEVMTransactionWithErc20Approvals
                            ).requiredErc20Approvals;
                            ethereumAccount.setIsSendingTx(true);
                            ethereumAccount
                              .simulateGas(sender, tx as UnsignedEVMTransaction)
                              .then(({ gasUsed }) => {
                                const {
                                  maxFeePerGas,
                                  maxPriorityFeePerGas,
                                  gasPrice,
                                } =
                                  ibcSwapConfigsForBridge.feeConfig.getEIP1559TxFees(
                                    ibcSwapConfigsForBridge.feeConfig.type
                                  );
                                const feeObject =
                                  maxFeePerGas && maxPriorityFeePerGas
                                    ? {
                                        type: 2,
                                        maxFeePerGas: `0x${BigInt(
                                          maxFeePerGas.truncate().toString()
                                        ).toString(16)}`,
                                        maxPriorityFeePerGas: `0x${BigInt(
                                          maxPriorityFeePerGas
                                            .truncate()
                                            .toString()
                                        ).toString(16)}`,
                                        gasLimit: `0x${gasUsed.toString(16)}`,
                                      }
                                    : {
                                        gasPrice: `0x${BigInt(
                                          gasPrice.truncate().toString()
                                        ).toString(16)}`,
                                        gasLimit: `0x${gasUsed.toString(16)}`,
                                      };
                                ethereumAccount.sendEthereumTx(
                                  sender,
                                  {
                                    ...(tx as UnsignedEVMTransactionWithErc20Approvals),
                                    ...feeObject,
                                  },
                                  {
                                    onBroadcasted: (txHash) => {
                                      ethereumAccount.setIsSendingTx(false);
                                      const msg = new RecordTxWithSkipSwapMsg(
                                        inChainId,
                                        outChainId,
                                        {
                                          chainId: outChainId,
                                          denom: outCurrency.coinMinimalDenom,
                                          expectedAmount:
                                            ibcSwapConfigsForBridge.amountConfig.outAmount
                                              .toDec()
                                              .toString(),
                                        },
                                        simpleRoute,
                                        sender,
                                        chainStore.isEvmOnlyChain(outChainId)
                                          ? accountStore.getAccount(outChainId)
                                              .ethereumHexAddress
                                          : accountStore.getAccount(outChainId)
                                              .bech32Address,
                                        [
                                          ...ibcSwapConfigsForBridge.amountConfig.amount.map(
                                            (amount) => {
                                              return {
                                                amount:
                                                  DecUtils.getTenExponentN(
                                                    amount.currency.coinDecimals
                                                  )
                                                    .mul(amount.toDec())
                                                    .toString(),
                                                denom:
                                                  amount.currency
                                                    .coinMinimalDenom,
                                              };
                                            }
                                          ),
                                          {
                                            amount: DecUtils.getTenExponentN(
                                              ibcSwapConfigsForBridge
                                                .amountConfig.outAmount.currency
                                                .coinDecimals
                                            )
                                              .mul(
                                                ibcSwapConfigsForBridge.amountConfig.outAmount.toDec()
                                              )
                                              .toString(),
                                            denom:
                                              ibcSwapConfigsForBridge
                                                .amountConfig.outAmount.currency
                                                .coinMinimalDenom,
                                          },
                                        ],
                                        {
                                          currencies:
                                            chainStore.getChain(outChainId)
                                              .currencies,
                                        },
                                        routeDurationSeconds ?? 0,
                                        txHash
                                      );
                                      new InExtensionMessageRequester().sendMessage(
                                        BACKGROUND_PORT,
                                        msg
                                      );

                                      if (!isDetachedMode) {
                                        navigate("/", {
                                          replace: true,
                                        });
                                      } else {
                                        window.close();
                                      }
                                    },
                                    onFulfill: (txReceipt) => {
                                      const queryBalances = queriesStore.get(
                                        ibcSwapConfigsForBridge.amountConfig
                                          .chainId
                                      ).queryBalances;
                                      queryBalances
                                        .getQueryEthereumHexAddress(sender)
                                        .balances.forEach((balance) => {
                                          if (
                                            balance.currency
                                              .coinMinimalDenom ===
                                              ibcSwapConfigsForBridge
                                                .amountConfig.currency
                                                .coinMinimalDenom ||
                                            ibcSwapConfigsForBridge.feeConfig.fees.some(
                                              (fee) =>
                                                fee.currency
                                                  .coinMinimalDenom ===
                                                balance.currency
                                                  .coinMinimalDenom
                                            )
                                          ) {
                                            balance.fetch();
                                          }
                                        });
                                      if (
                                        txReceipt.status === EthTxStatus.Success
                                      ) {
                                        notification.show(
                                          "success",
                                          intl.formatMessage({
                                            id: "notification.transaction-success",
                                          }),
                                          ""
                                        );
                                      } else {
                                        notification.show(
                                          "failed",
                                          intl.formatMessage({
                                            id: "error.transaction-failed",
                                          }),
                                          ""
                                        );
                                      }
                                    },
                                  }
                                );
                              })
                              .catch((e) => {
                                console.log(e);
                                ethereumAccount.setIsSendingTx(false);
                              });
                          }
                        } else {
                          notification.show(
                            "failed",
                            intl.formatMessage({
                              id: "error.transaction-failed",
                            }),
                            ""
                          );
                        }
                      },
                    }
                  );
                }
              } catch (e) {
                if (e?.message === "Request rejected") {
                  return;
                }

                console.log(e);
                notification.show(
                  "failed",
                  intl.formatMessage({ id: "error.transaction-failed" }),
                  ""
                );
                if (!isDetachedMode) {
                  navigate("/", {
                    replace: true,
                  });
                } else {
                  window.close();
                }
              } finally {
                setIsTxLoading(false);
              }
            } else if (isEvmTx) {
              ethereumAccount.setIsSendingTx(true);
              const { maxFeePerGas, maxPriorityFeePerGas, gasPrice } =
                sendConfigs.feeConfig.getEIP1559TxFees(
                  sendConfigs.feeConfig.type
                );

              const unsignedTx = ethereumAccount.makeSendTokenTx({
                currency: sendConfigs.amountConfig.amount[0].currency,
                amount: sendConfigs.amountConfig.amount[0].toDec().toString(),
                to: sendConfigs.recipientConfig.recipient,
                gasLimit: sendConfigs.gasConfig.gas,
                maxFeePerGas: maxFeePerGas?.toString(),
                maxPriorityFeePerGas: maxPriorityFeePerGas?.toString(),
                gasPrice: gasPrice?.toString(),
              });
              await ethereumAccount.sendEthereumTx(
                sender,
                unsignedTx,
                {
                  onFulfill: (txReceipt) => {
                    queryBalances
                      .getQueryEthereumHexAddress(sender)
                      .balances.forEach((balance) => {
                        if (
                          balance.currency.coinMinimalDenom ===
                            coinMinimalDenom ||
                          sendConfigs.feeConfig.fees.some(
                            (fee) =>
                              fee.currency.coinMinimalDenom ===
                              balance.currency.coinMinimalDenom
                          )
                        ) {
                          balance.fetch();
                        }
                      });
                    queryBalances
                      .getQueryBech32Address(account.bech32Address)
                      .balances.forEach((balance) => {
                        if (
                          balance.currency.coinMinimalDenom ===
                            coinMinimalDenom ||
                          sendConfigs.feeConfig.fees.some(
                            (fee) =>
                              fee.currency.coinMinimalDenom ===
                              balance.currency.coinMinimalDenom
                          )
                        ) {
                          balance.fetch();
                        }
                      });

                    if (txReceipt.status === EthTxStatus.Success) {
                      notification.show(
                        "success",
                        intl.formatMessage({
                          id: "notification.transaction-success",
                        }),
                        ""
                      );
                    } else {
                      notification.show(
                        "failed",
                        intl.formatMessage({ id: "error.transaction-failed" }),
                        ""
                      );
                    }
                  },
                },
                {
                  sendTx: async (chainId, signedTx) => {
                    const msg = new SendTxEthereumMsgAndRecordMsg(
                      historyType,
                      chainId,
                      sendConfigs.recipientConfig.chainId,
                      signedTx,
                      sendConfigs.senderConfig.sender,
                      sendConfigs.recipientConfig.recipient,
                      sendConfigs.amountConfig.amount.map((amount) => {
                        return {
                          amount: DecUtils.getTenExponentN(
                            amount.currency.coinDecimals
                          )
                            .mul(amount.toDec())
                            .toString(),
                          denom: amount.currency.coinMinimalDenom,
                        };
                      }),
                      sendConfigs.memoConfig.memo
                    );

                    return await new InExtensionMessageRequester().sendMessage(
                      BACKGROUND_PORT,
                      msg
                    );
                  },
                }
              );
              ethereumAccount.setIsSendingTx(false);
            } else {
              const tx =
                sendType === "ibc-transfer"
                  ? accountStore
                      .getAccount(chainId)
                      .cosmos.makePacketForwardIBCTransferTx(
                        accountStore,
                        sendConfigs.channelConfig.channels,
                        sendConfigs.amountConfig.amount[0].toDec().toString(),
                        sendConfigs.amountConfig.amount[0].currency,
                        sendConfigs.recipientConfig.recipient
                      )
                  : accountStore
                      .getAccount(chainId)
                      .makeSendTokenTx(
                        sendConfigs.amountConfig.amount[0].toDec().toString(),
                        sendConfigs.amountConfig.amount[0].currency,
                        sendConfigs.recipientConfig.recipient
                      );

              await tx.send(
                sendConfigs.feeConfig.toStdFee(),
                sendConfigs.memoConfig.memo,
                {
                  preferNoSetFee: true,
                  preferNoSetMemo: true,
                  sendTx: async (chainId, tx, mode) => {
                    let msg: Message<Uint8Array> = new SendTxAndRecordMsg(
                      historyType,
                      chainId,
                      sendConfigs.recipientConfig.chainId,
                      tx,
                      mode,
                      false,
                      sendConfigs.senderConfig.sender,
                      sendConfigs.recipientConfig.recipient,
                      sendConfigs.amountConfig.amount.map((amount) => {
                        return {
                          amount: DecUtils.getTenExponentN(
                            amount.currency.coinDecimals
                          )
                            .mul(amount.toDec())
                            .toString(),
                          denom: amount.currency.coinMinimalDenom,
                        };
                      }),
                      sendConfigs.memoConfig.memo
                    );
                    if (sendType === "ibc-transfer") {
                      if (msg instanceof SendTxAndRecordMsg) {
                        msg = msg.withIBCPacketForwarding(
                          sendConfigs.channelConfig.channels,
                          {
                            currencies: chainStore.getChain(chainId).currencies,
                          }
                        );
                      } else {
                        throw new Error("Invalid message type");
                      }
                    }
                    return await new InExtensionMessageRequester().sendMessage(
                      BACKGROUND_PORT,
                      msg
                    );
                  },
                },
                {
                  onBroadcasted: async () => {
                    chainStore.enableVaultsWithCosmosAddress(
                      sendConfigs.recipientConfig.chainId,
                      sendConfigs.recipientConfig.recipient
                    );

                    if (sendType === "send") {
                      const inCurrencyPrice =
                        await priceStore.waitCalculatePrice(
                          sendConfigs.amountConfig.amount[0],
                          "usd"
                        );

                      const params: Record<
                        string,
                        | number
                        | string
                        | boolean
                        | number[]
                        | string[]
                        | undefined
                      > = {
                        denom:
                          sendConfigs.amountConfig.amount[0].currency
                            .coinMinimalDenom,
                        commonDenom: (() => {
                          const currency =
                            sendConfigs.amountConfig.amount[0].currency;
                          if ("paths" in currency && currency.originCurrency) {
                            return currency.originCurrency.coinDenom;
                          }
                          return currency.coinDenom;
                        })(),
                        chainId: sendConfigs.recipientConfig.chainId,
                        chainIdentifier: ChainIdHelper.parse(
                          sendConfigs.recipientConfig.chainId
                        ).identifier,
                        inAvg: amountToAmbiguousAverage(
                          sendConfigs.amountConfig.amount[0]
                        ),
                      };
                      if (inCurrencyPrice) {
                        params["inFiatAvg"] =
                          amountToAmbiguousAverage(inCurrencyPrice);
                      }
                      new InExtensionMessageRequester().sendMessage(
                        BACKGROUND_PORT,
                        new LogAnalyticsEventMsg("send", params)
                      );
                    } else if (ibcChannelFluent != null) {
                      const pathChainIds = [chainId].concat(
                        ...ibcChannelFluent.channels.map(
                          (channel) => channel.counterpartyChainId
                        )
                      );
                      const intermediateChainIds: string[] = [];
                      if (pathChainIds.length > 2) {
                        intermediateChainIds.push(...pathChainIds.slice(1, -1));
                      }

                      const inCurrencyPrice =
                        await priceStore.waitCalculatePrice(
                          sendConfigs.amountConfig.amount[0],
                          "usd"
                        );

                      const params: Record<
                        string,
                        | number
                        | string
                        | boolean
                        | number[]
                        | string[]
                        | undefined
                      > = {
                        originDenom: ibcChannelFluent.originDenom,
                        originCommonDenom: (() => {
                          const currency = chainStore
                            .getChain(ibcChannelFluent.originChainId)
                            .forceFindCurrency(ibcChannelFluent.originDenom);
                          if ("paths" in currency && currency.originCurrency) {
                            return currency.originCurrency.coinDenom;
                          }
                          return currency.coinDenom;
                        })(),
                        originChainId: ibcChannelFluent.originChainId,
                        originChainIdentifier: ChainIdHelper.parse(
                          ibcChannelFluent.originChainId
                        ).identifier,
                        sourceChainId: chainId,
                        sourceChainIdentifier:
                          ChainIdHelper.parse(chainId).identifier,
                        destinationChainId: ibcChannelFluent.destinationChainId,
                        destinationChainIdentifier: ChainIdHelper.parse(
                          ibcChannelFluent.destinationChainId
                        ).identifier,
                        pathChainIds,
                        pathChainIdentifiers: pathChainIds.map(
                          (chainId) => ChainIdHelper.parse(chainId).identifier
                        ),
                        intermediateChainIds,
                        intermediateChainIdentifiers: intermediateChainIds.map(
                          (chainId) => ChainIdHelper.parse(chainId).identifier
                        ),
                        isToOrigin:
                          ibcChannelFluent.destinationChainId ===
                          ibcChannelFluent.originChainId,
                        inAvg: amountToAmbiguousAverage(
                          sendConfigs.amountConfig.amount[0]
                        ),
                      };
                      if (inCurrencyPrice) {
                        params["inFiatAvg"] =
                          amountToAmbiguousAverage(inCurrencyPrice);
                      }
                      new InExtensionMessageRequester().sendMessage(
                        BACKGROUND_PORT,
                        new LogAnalyticsEventMsg("ibc_send", params)
                      );
                    }
                  },
                  onFulfill: (tx: any) => {
                    if (tx.code != null && tx.code !== 0) {
                      console.log(tx.log ?? tx.raw_log);
                      notification.show(
                        "failed",
                        intl.formatMessage({ id: "error.transaction-failed" }),
                        ""
                      );
                      return;
                    }
                    notification.show(
                      "success",
                      intl.formatMessage({
                        id: "notification.transaction-success",
                      }),
                      ""
                    );
                  },
                }
              );
            }

            //NOTE - For evmTx on bridge, erc20 approve may be present, in which case evm tx processing will handle navigation,
            // so using early return here
            if (hasApprovalTxWhenBridge) {
              return;
            }

            if (!isDetachedMode) {
              navigate("/", {
                replace: true,
              });
            } else {
              window.close();
            }
          } catch (e) {
            if (e?.message === "Request rejected") {
              return;
            }

            if (isEvmTx) {
              ethereumAccount.setIsSendingTx(false);
            }

            console.log(e);
            notification.show(
              "failed",
              intl.formatMessage({ id: "error.transaction-failed" }),
              ""
            );
            if (!isDetachedMode) {
              navigate("/", {
                replace: true,
              });
            } else {
              await new Promise((resolve) => setTimeout(resolve, 2000));
              window.close();
            }
          }
        }
      }}
    >
      <Box
        paddingX="0.75rem"
        style={{
          flex: 1,
        }}
      >
        <Stack gutter="0.75rem" flex={1}>
          <YAxis>
            <Subtitle3>
              <FormattedMessage id="page.send.amount.asset-title" />
            </Subtitle3>
            <Gutter size="0.375rem" />
            <TokenItem
              viewToken={{
                token: balance?.balance ?? new CoinPretty(currency, "0"),
                chainInfo: chainStore.getChain(chainId),
                isFetching: balance?.isFetching ?? false,
                error: balance?.error,
              }}
              forChange
              onClick={() => {
                navigate(
                  `/send/select-asset?navigateReplace=true&navigateTo=${encodeURIComponent(
                    "/send?chainId={chainId}&coinMinimalDenom={coinMinimalDenom}"
                  )}`
                );
              }}
            />
          </YAxis>

          <LayeredHorizontalRadioGroup
            size="large"
            selectedKey={sendType !== "send" ? "ibc-transfer" : "send"}
            items={[
              {
                key: "send",
                text: intl.formatMessage({
                  id: "page.send.type.send",
                }),
              },
              {
                key: "ibc-transfer",
                text: intl.formatMessage({
                  id: "page.send.type.ibc-transfer",
                }),
              },
            ]}
            onSelect={(key) => {
              if (key === "ibc-transfer") {
                if (sendConfigs.channelConfig.channels.length === 0) {
                  setIsIBCTransferDestinationModalOpen(true);
                }
              } else {
                sendConfigs.channelConfig.setChannels([]);
                setSendType("send");
              }
            }}
          />

          <VerticalCollapseTransition collapsed={sendType === "send"}>
            <DestinationChainView
              chainInfo={destinationChainInfo}
              onClick={() => {
                setIsIBCTransferDestinationModalOpen(true);
              }}
            />
            <Gutter size="0.75rem" />
          </VerticalCollapseTransition>
          <Gutter size="0" />

          <RecipientInput
            ref={addressRef}
            historyType={historyType}
            recipientConfig={recipientConfig}
            memoConfig={memoConfig}
            currency={currency}
            permitAddressBookSelfKeyInfo={sendType !== "send"}
            bottom={
              <VerticalCollapseTransition
                collapsed={!isRecipientNotBasicSendSetAuto}
                transitionAlign="top"
              >
                <Gutter size="0.25rem" />
                <XAxis>
                  <Gutter size="0.5rem" />
                  <Caption2 color={ColorPalette["platinum-200"]}>
                    <FormattedMessage id="page.send.amount.ibc-send-recipient-auto-filled" />
                  </Caption2>
                </XAxis>
              </VerticalCollapseTransition>
            }
          />

          <AmountInput
            amountConfig={amountConfig}
            forceError={calculatingTxError}
            forceWarning={(() => {
              if (unablesToPopulatePrice.length > 0) {
                return new Error(
                  intl.formatMessage(
                    {
                      id: "page.ibc-swap.warning.unable-to-populate-price",
                    },
                    {
                      assets: unablesToPopulatePrice.join(", "),
                    }
                  )
                );
              }
            })()}
          />

          {!isEvmTx && (
            <MemoInput
              memoConfig={sendConfigs.memoConfig}
              placeholder={
                // IBC Send일때는 어차피 밑에서 cex로 보내지 말라고 경고가 뜬다.
                // 근데 memo의 placeholder는 cex로 보낼때 메모를 꼭 확인하라고 하니 서로 모순이라 이상하다.
                // 그래서 IBC Send일때는 memo의 placeholder를 없앤다.
                intl.formatMessage({
                  id:
                    sendType === "ibc-transfer"
                      ? "components.input.memo-input.optional-placeholder"
                      : "page.send.amount.memo-placeholder",
                })
              }
            />
          )}

          <VerticalCollapseTransition collapsed={sendType !== "ibc-transfer"}>
            <GuideBox
              color="warning"
              title={intl.formatMessage({
                id: "page.send.amount.ibc-transfer-warning.title",
              })}
            />
            <Gutter size="0.75rem" />
          </VerticalCollapseTransition>
          <Gutter size="0" />
          <VerticalCollapseTransition collapsed={!isSendingIBCToken}>
            <GuideBox
              color="warning"
              title={intl.formatMessage({
                id: "page.send.amount.avoid-cex-warning.title",
              })}
            />
            <Gutter size="0.75rem" />
          </VerticalCollapseTransition>
          <Gutter size="0" />

          <Styles.Flex1 />
          <Gutter size="0" />

          <FeeControl
            senderConfig={senderConfig}
            feeConfig={feeConfig}
            gasConfig={gasConfig}
            gasSimulator={gasSimulatorForNotBridgeSend}
            isForEVMTx={isEvmTx}
          />

          {sendType === "bridge" && (
            <SwapFeeInfoForBridgeOnSend
              amountConfig={ibcSwapConfigsForBridge.amountConfig}
            />
          )}
        </Stack>
      </Box>

      <Modal
        isOpen={isIBCTransferDestinationModalOpen}
        align="bottom"
        close={() => {
          setIsIBCTransferDestinationModalOpen(false);
        }}
      >
        <IBCTransferSelectDestinationModal
          chainId={chainId}
          denom={currency.coinMinimalDenom}
          recipientConfig={sendConfigs.recipientConfig}
          recipientConfigForBridge={ibcSwapConfigsForBridge.recipientConfig}
          setDestinationChainInfoOfBridge={(value) => {
            setDestinationChainInfoOfBridge(value);
          }}
          ibcChannelConfig={sendConfigs.channelConfig}
          setSendType={setSendType}
          setAutomaticRecipient={(address: string) => {
            setIsRecipientNotBasicSendSetAuto(true);
            setRecipientAddressNotBasicSend(address);
          }}
          setIBCChannelsInfoFluent={setIBCChannelFluent}
          close={() => {
            setIsIBCTransferDestinationModalOpen(false);
          }}
        />
      </Modal>
    </HeaderLayout>
  );
});

const DetachIcon: FunctionComponent<{
  size: string;
  color: string;
}> = ({ size, color }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        stroke={color || "currentColor"}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.5"
        d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
      />
    </svg>
  );
};

const noopToPreventLintWarning = (..._args: any[]) => {
  // noop
};

//NOTE - Hooks for maintaining the observable state of IBC swap queries
// when uiProperties of amountConfig of swapConfig is called only inside amount input and an error occurs on amountInput
// Observable values used in uiProperties had an issue with unobserving, so I fixed it so that we can temporarily keep observers on the page
function useKeepIBCSwapObservable(skipQueriesStore: SkipQueries) {
  useEffect(() => {
    const disposal = autorun(() => {
      noopToPreventLintWarning(
        skipQueriesStore.queryIBCSwap.swapDestinationCurrenciesMap
      );
    });

    return () => {
      if (disposal) {
        disposal();
      }
    };
  }, [skipQueriesStore.queryIBCSwap]);
}

function useGetGasSimulationForBridge(
  chainStore: ChainStore,
  chainId: string,
  ibcSwapConfigsForBridge: {
    recipientConfig: IBCRecipientConfig;
    amountConfig: IBCSwapAmountConfig;
    memoConfig: MemoConfig;
    gasConfig: GasConfig;
    feeConfig: FeeConfig;
    senderConfig: SenderConfig;
  },
  ethereumAccountStore: EthereumAccountStore,
  currency: AppCurrency,
  recipient?: {
    chainId: string;
    recipient: string;
  }
) {
  const gasSimulator = useGasSimulator(
    new ExtensionKVStore("gas-simulator.ibc-swap.swap"),
    chainStore,
    chainId,
    ibcSwapConfigsForBridge.gasConfig,
    ibcSwapConfigsForBridge.feeConfig,
    (() => {
      // simulation 할때 예상되는 gas에 따라서 밑의 값을 설정해야한다.
      // 근데 이걸 엄밀히 정하기는 어렵다
      // 추정을해보면 당연히 destination token에 따라서 값이 다를 수 있다.
      // 또한 트랜잭션이 ibc transfer인지 cosmwasm execute인지에 따라서 다를 수 있다.
      // ibc transfer일 경우는 차이는 memo의 길이일 뿐인데 이건 gas에 그다지 영향을 미치지 않기 때문에 gas adjustment로 충분하다.
      // swap일 경우 (osmosis에서 실행될 경우) swpa이 몇번 필요한지에 따라 영향을 미칠 것이다.
      let type = "default";

      const queryRoute = ibcSwapConfigsForBridge.amountConfig
        .getQueryIBCSwap()
        ?.getQueryRoute();

      if (queryRoute && queryRoute.response) {
        // swap일 경우 웬만하면 swap 한번으로 충분할 확률이 높다.
        // 이 가정에 따라서 첫로드시에 gas를 restore하기 위해서 트랜잭션을 보내는 체인에서 swap 할 경우
        // 일단 swap-1로 설정한다.
        if (
          queryRoute.response.data.swap_venues &&
          queryRoute.response.data.swap_venues.length === 1
        ) {
          const swapVenueChainId = (() => {
            const evmLikeChainId = Number(
              queryRoute.response.data.swap_venues[0].chain_id
            );
            const isEVMChainId =
              !Number.isNaN(evmLikeChainId) && evmLikeChainId > 0;

            return isEVMChainId
              ? `eip155:${evmLikeChainId}`
              : queryRoute.response.data.swap_venues[0].chain_id;
          })();

          if (
            ibcSwapConfigsForBridge.amountConfig.chainInfo.chainIdentifier ===
            chainStore.getChain(swapVenueChainId).chainIdentifier
          ) {
            type = `swap-1`;
          }
        }

        if (queryRoute.response.data.operations.length > 0) {
          const firstOperation = queryRoute.response.data.operations[0];
          if ("swap" in firstOperation) {
            if (firstOperation.swap.swap_in) {
              type = `swap-${firstOperation.swap.swap_in.swap_operations.length}`;
            } else if (firstOperation.swap.smart_swap_in) {
              type = `swap-${firstOperation.swap.smart_swap_in.swap_routes.reduce(
                (acc, cur) => {
                  return (acc += cur.swap_operations.length);
                },
                0
              )}`;
            }
          }

          if ("axelar_transfer" in firstOperation) {
            type = "axelar_transfer";
          }

          if ("cctp_transfer" in firstOperation) {
            type = "cctp_transfer";
          }

          if ("go_fast_transfer" in firstOperation) {
            type = "go_fast_transfer";
          }

          if ("hyperlane_transfer" in firstOperation) {
            type = "hyperlane_transfer";
          }

          if ("evm_swap" in firstOperation) {
            type = "evm_swap";
          }
        }
      }

      return `${ibcSwapConfigsForBridge.amountConfig.outChainId}/${ibcSwapConfigsForBridge.amountConfig.outCurrency.coinMinimalDenom}/${type}`;
    })(),
    () => {
      if (!ibcSwapConfigsForBridge.amountConfig.currency) {
        throw new Error("Send currency not set");
      }

      // Prefer not to use the gas config or fee config,
      // because gas simulator can change the gas config and fee config from the result of reaction,
      // and it can make repeated reaction.
      if (
        ibcSwapConfigsForBridge.amountConfig.uiProperties.loadingState ===
          "loading-block" ||
        ibcSwapConfigsForBridge.amountConfig.uiProperties.error != null
      ) {
        throw new Error("Not ready to simulate tx");
      }

      const swapFeeBpsReceiver: string[] = [];
      const queryRoute = ibcSwapConfigsForBridge.amountConfig
        .getQueryIBCSwap()
        ?.getQueryRoute();

      if (queryRoute && queryRoute.response) {
        const operations = queryRoute.response.data.operations;
        const isContainsSwap = operations.some(
          (operation) => "swap" in operation || "evm_swap" in operation
        );
        const isUseSwap = queryRoute.response.data.does_swap || isContainsSwap;

        if (true) {
          // 만약 bridge에서 swap을 하는게 동작되면 에러를 보내게 해서 실행되지 못하게 한다.
          // 그런데 생각헤보니 이거 미리 해야 되지 않나.
          // ibcSwapConfigsForBridge.amountConfig.
          console.log("isUseSwap!!", isUseSwap);
        }

        if (queryRoute.response.data.operations.length > 0) {
          for (const operation of queryRoute.response.data.operations) {
            if ("swap" in operation) {
              const swapIn =
                operation.swap.swap_in ?? operation.swap.smart_swap_in;
              if (swapIn) {
                // const swapFeeBpsReceiverAddress = SwapFeeBps.receivers.find(
                //   (r) => r.chainId === swapIn.swap_venue.chain_id
                // );
                // if (swapFeeBpsReceiverAddress) {
                //   swapFeeBpsReceiver.push(swapFeeBpsReceiverAddress.address);
                // }
              }
            }
          }
        }
      }

      const tx = ibcSwapConfigsForBridge.amountConfig.getTxIfReady(
        // simulation 자체는 쉽게 통과시키기 위해서 슬리피지를 50으로 설정한다.
        50,
        // 코스모스 스왑은 스왑베뉴가 무조건 하나라고 해서 일단 처음걸 쓰기로 한다.
        swapFeeBpsReceiver[0],
        recipient
      );

      if (!tx) {
        throw new Error("Not ready to simulate tx");
      }

      if ("send" in tx) {
        return tx;
      } else {
        const ethereumAccount = ethereumAccountStore.getAccount(
          ibcSwapConfigsForBridge.amountConfig.chainId
        );
        const sender = ibcSwapConfigsForBridge.senderConfig.sender;

        const isErc20InCurrency =
          ("type" in currency && currency.type === "erc20") ||
          currency.coinMinimalDenom.startsWith("erc20:");
        const erc20Approval = tx.requiredErc20Approvals?.[0];
        const erc20ApprovalTx =
          erc20Approval && isErc20InCurrency
            ? ethereumAccount.makeErc20ApprovalTx(
                {
                  ...currency,
                  type: "erc20",
                  contractAddress: currency.coinMinimalDenom.replace(
                    "erc20:",
                    ""
                  ),
                },
                erc20Approval.spender,
                erc20Approval.amount
              )
            : undefined;

        // OP Stack L1 Data Fee 계산은 일단 무시하기로 한다.
        return {
          simulate: () =>
            ethereumAccount.simulateGas(sender, erc20ApprovalTx ?? tx),
        };
      }
    }
  );

  return gasSimulator;
}
