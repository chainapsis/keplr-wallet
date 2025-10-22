import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import { SignInteractionStore } from "@keplr-wallet/stores-core";
import { Box } from "../../../../components/box";
import { Column, Columns } from "../../../../components/column";
import { XAxis } from "../../../../components/axis";
import { H5, Subtitle3 } from "../../../../components/typography";
import { ColorPalette } from "../../../../styles";
import { ViewDataButton } from "../../components/view-data-button";
import { MessageItem } from "../../components/message-item";
import { MemoInput } from "../../../../components/input/memo-input";
import { observer } from "mobx-react-lite";
import {
  useFeeConfig,
  useMemoConfig,
  useSenderConfig,
  useSignDocAmountConfig,
  useSignDocHelper,
  useTxConfigsValidate,
  useZeroAllowedGasConfig,
} from "@keplr-wallet/hooks";
import { useStore } from "../../../../stores";
import { unescapeHTML } from "@keplr-wallet/common";
import { CoinPretty, Dec, Int } from "@keplr-wallet/unit";
import { BackButton } from "../../../../layouts/header/components";
import { HeaderLayout } from "../../../../layouts/header";
import { useInteractionInfo } from "../../../../hooks";
import { defaultRegistry } from "../../components/messages/registry";
import { useUnmount } from "../../../../hooks/use-unmount";
import { handleCosmosPreSign } from "../../utils/handle-cosmos-sign";
import { KeplrError } from "@keplr-wallet/router";
import { ErrModuleLedgerSign } from "../../utils/ledger-types";
import { LedgerGuideBox } from "../../components/ledger-guide-box";
import { KeystoneUSBBox } from "../../components/keystone-usb-box";
import { Gutter } from "../../../../components/gutter";
import { GuideBox } from "../../../../components/guide-box";
import { FormattedMessage, useIntl } from "react-intl";
import SimpleBar from "simplebar-react";
import { KeystoneSign } from "../../components/keystone";
import { ErrModuleKeystoneSign, KeystoneUR } from "../../utils/keystone";
import { KeyRingService } from "@keplr-wallet/background";
import { useTheme } from "styled-components";
import { defaultProtoCodec } from "@keplr-wallet/cosmos";
import { MsgGrant } from "@keplr-wallet/proto-types/cosmos/authz/v1beta1/tx";
import { GenericAuthorization } from "@keplr-wallet/stores/build/query/cosmos/authz/types";
import { Checkbox } from "../../../../components/checkbox";
import { FeeSummary } from "../../components/fee-summary";
import { FeeControl } from "../../../../components/input/fee-control";
import { HighFeeWarning } from "../../components/high-fee-warning";
import { handleExternalInteractionWithNoProceedNext } from "../../../../utils";
import { useNavigate } from "react-router-dom";
import { ApproveIcon, CancelIcon } from "../../../../components/button";
import { VerticalCollapseTransition } from "../../../../components/transition/vertical-collapse";
import {
  FeeCoverageBox,
  FeeCoverageDescription,
  FeeCoverageBackground,
} from "../../../../components/top-up";
import { useTopUp } from "../../../../hooks/use-topup";

/**
 * 서명을 처리할때 웹페이지에서 연속적으로 서명을 요청했을 수 있고
 * 그러면 서명할 데이터에 대해서 FIFO 순으로 순차적으로 UI에서 표시하고 처리해준다.
 * 하지만 문제는 tx관련된 hook들은 구현의 간단함을 위해서 한 컴포넌트 라이프사이클에서
 * 하나의 tx에 대해서만 처리하고 이후 다른 tx가 필요하다고 다시 초기화하거나 할 수 없도록 되어있다.
 * 이 문제 때문에 각 서명 데이터에 대해서 처리되고 나면 그 컴포넌트는 unmount되고
 * 같은 컴포넌트가 새롭게 mount되어야 한다.
 * 그렇기 때문에 처리 로직이 완전히 이 컴포넌트로 분리되어있고
 * 이 컴포넌트를 호출하는 쪽에서 "key" prop을 통해서 위의 요구사항을 꼭 만족시켜야한다.
 * 또한 prop으로 받는 "interactionData"는 절대로 불변해야한다.
 */
export const CosmosTxView: FunctionComponent<{
  interactionData: NonNullable<SignInteractionStore["waitingData"]>;
}> = observer(({ interactionData }) => {
  const {
    chainStore,
    queriesStore,
    signInteractionStore,
    uiConfigStore,
    priceStore,
  } = useStore();

  const intl = useIntl();
  const theme = useTheme();
  const navigate = useNavigate();

  const [isViewData, setIsViewData] = useState(false);

  const chainId = interactionData.data.chainId;
  const signer = interactionData.data.signer;

  const senderConfig = useSenderConfig(chainStore, chainId, signer);
  // There are services that sometimes use invalid tx to sign arbitrary data on the sign page.
  // In this case, there is no obligation to deal with it, but 0 gas is favorably allowed.
  const gasConfig = useZeroAllowedGasConfig(chainStore, chainId, 0);
  const amountConfig = useSignDocAmountConfig(
    chainStore,
    chainId,
    senderConfig
  );
  const feeConfig = useFeeConfig(
    chainStore,
    queriesStore,
    chainId,
    senderConfig,
    amountConfig,
    gasConfig,
    {
      forceUseAtoneTokenAsFee:
        interactionData.data.mode === "amino"
          ? interactionData.data.signDocWrapper.aminoSignDoc.msgs.some((msg) =>
              msg.type.includes("MsgMintPhoton")
            )
          : interactionData.data.signDocWrapper.protoSignDoc.txMsgs.some(
              (msg) => msg.typeUrl.includes("MsgMintPhoton")
            ),
    }
  );
  const memoConfig = useMemoConfig(chainStore, chainId);

  const signDocHelper = useSignDocHelper(feeConfig, memoConfig);
  amountConfig.setSignDocHelper(signDocHelper);

  useEffect(() => {
    const data = interactionData;
    if (data.data.chainId !== data.data.signDocWrapper.chainId) {
      // Validate the requested chain id and the chain id in the sign doc are same.
      throw new Error("Chain id unmatched");
    }
    signDocHelper.setSignDocWrapper(data.data.signDocWrapper);
    gasConfig.setValue(data.data.signDocWrapper.gas);
    let memo = data.data.signDocWrapper.memo;
    if (data.data.signDocWrapper.mode === "amino") {
      // For amino-json sign doc, the memo is escaped by default behavior of golang's json marshaller.
      // For normal users, show the escaped characters with unescaped form.
      // Make sure that the actual sign doc's memo should be escaped.
      // In this logic, memo should be escaped from account store or background's request signing function.
      memo = unescapeHTML(memo);
    }
    memoConfig.setValue(memo);
    if (
      data.data.signOptions.preferNoSetFee ||
      // 자동으로 fee를 다뤄줄 수 있는건 fee가 하나인 경우이다.
      // fee가 여러개인 경우는 일반적인 경우가 아니기 때문에
      // 케플러에서 처리해줄 수 없다. 그러므로 옵션을 무시하고 fee 설정을 각 웹사이트에 맡긴다.
      data.data.signDocWrapper.fees.length >= 2
    ) {
      feeConfig.setFee(
        data.data.signDocWrapper.fees.map((fee) => {
          const currency = chainStore
            .getChain(data.data.chainId)
            .forceFindCurrency(fee.denom);
          return new CoinPretty(currency, new Int(fee.amount));
        })
      );
    }
    amountConfig.setDisableBalanceCheck(
      !!data.data.signOptions.disableBalanceCheck
    );
    feeConfig.setDisableBalanceCheck(
      !!data.data.signOptions.disableBalanceCheck
    );
    // We can't check the fee balance if the payer is not the signer.
    if (
      data.data.signDocWrapper.payer &&
      data.data.signDocWrapper.payer !== data.data.signer
    ) {
      feeConfig.setDisableBalanceCheck(true);
    }
    // We can't check the fee balance if the granter is not the signer.
    if (
      data.data.signDocWrapper.granter &&
      data.data.signDocWrapper.granter !== data.data.signer
    ) {
      feeConfig.setDisableBalanceCheck(true);
    }
  }, [
    amountConfig,
    chainStore,
    feeConfig,
    gasConfig,
    interactionData,
    intl,
    memoConfig,
    signDocHelper,
  ]);

  const msgs = signDocHelper.signDocWrapper
    ? signDocHelper.signDocWrapper.mode === "amino"
      ? signDocHelper.signDocWrapper.aminoSignDoc.msgs
      : signDocHelper.signDocWrapper.protoSignDoc.txMsgs
    : [];
  const [isSendAuthzGrant, setIsSendAuthzGrant] = useState(false);
  useEffect(() => {
    try {
      if (
        // 라이크코인의 요청으로 일단 얘는 스킵...
        interactionData.data.origin === "https://liker.land" ||
        interactionData.data.origin === "https://app.like.co"
      ) {
        return;
      }

      const msgs = signDocHelper.signDocWrapper
        ? signDocHelper.signDocWrapper.mode === "amino"
          ? signDocHelper.signDocWrapper.aminoSignDoc.msgs
          : signDocHelper.signDocWrapper.protoSignDoc.txMsgs
        : [];

      for (const msg of msgs) {
        const anyMsg = msg as any;
        if (anyMsg.type == null && anyMsg.grant && anyMsg.grant.authorization) {
          // cosmos-sdk has bug that amino codec is not applied to authorization properly.
          // This is the workaround for this bug.
          if (anyMsg.grant.authorization.msg) {
            const innerType = anyMsg.grant.authorization.msg;
            if (
              innerType === "/cosmos.bank.v1beta1.MsgSend" ||
              innerType === "/cosmos.bank.v1beta1.MsgMultiSend" ||
              innerType === "/ibc.applications.transfer.v1.MsgTransfer" ||
              innerType === "/cosmos.authz.v1beta1.MsgGrant" ||
              innerType === "/cosmos.staking.v1beta1.MsgTokenizeShares" ||
              innerType === "/cosmos.staking.v1beta1.MsgEnableTokenizeShares"
            ) {
              setIsSendAuthzGrant(true);
              return;
            }
          } else if (anyMsg.grant.authorization.spend_limit) {
            // SendAuthorization의 경우 spend_limit를 가진다.
            // omit 되지 않도록 옵션이 설정되어있기 때문에 비어있더라도 빈 배열을 가지고 있어서 이렇게 확인이 가능하다.
            // 근데 사실 다른 authorization도 spend_limit를 가질 수 있으므로 이건 좀 위험한 방법이다.
            // 근데 어차피 버그 버전을 위한거라서 그냥 이렇게 해도 될듯.
            setIsSendAuthzGrant(true);
            return;
          }
        } else if ("type" in msg) {
          if (msg.type === "cosmos-sdk/MsgGrant") {
            if (
              msg.value.grant.authorization.type ===
              "cosmos-sdk/GenericAuthorization"
            ) {
              const innerType = msg.value.grant.authorization.value.msg;
              if (
                innerType === "/cosmos.bank.v1beta1.MsgSend" ||
                innerType === "/cosmos.bank.v1beta1.MsgMultiSend" ||
                innerType === "/ibc.applications.transfer.v1.MsgTransfer" ||
                innerType === "/cosmos.authz.v1beta1.MsgGrant" ||
                innerType === "/cosmos.staking.v1beta1.MsgTokenizeShares" ||
                innerType === "/cosmos.staking.v1beta1.MsgEnableTokenizeShares"
              ) {
                setIsSendAuthzGrant(true);
                return;
              }
            } else if (
              msg.value.grant.authorization.type ===
              "cosmos-sdk/SendAuthorization"
            ) {
              setIsSendAuthzGrant(true);
              return;
            }
          }
        } else if ("unpacked" in msg) {
          if (msg.typeUrl === "/cosmos.authz.v1beta1.MsgGrant") {
            const grantMsg = msg.unpacked as MsgGrant;
            if (grantMsg.grant && grantMsg.grant.authorization) {
              if (
                grantMsg.grant.authorization.typeUrl ===
                "/cosmos.authz.v1beta1.GenericAuthorization"
              ) {
                // XXX: defaultProtoCodec가 msgs를 rendering할때 사용되었다는 엄밀한 보장은 없다.
                //      근데 로직상 ProtoSignDocDecoder가 defaultProtoCodec가 아닌 다른 codec을 쓰도록 만들 경우가 사실 없기 때문에
                //      일단 이렇게 처리하고 넘어간다.
                const factory = defaultProtoCodec.unpackAnyFactory(
                  grantMsg.grant.authorization.typeUrl
                );
                if (factory) {
                  const genericAuth = factory.decode(
                    grantMsg.grant.authorization.value
                  ) as GenericAuthorization;

                  if (
                    genericAuth.msg === "/cosmos.bank.v1beta1.MsgSend" ||
                    genericAuth.msg === "/cosmos.bank.v1beta1.MsgMultiSend" ||
                    genericAuth.msg ===
                      "/ibc.applications.transfer.v1.MsgTransfer" ||
                    genericAuth.msg === "/cosmos.authz.v1beta1.MsgGrant" ||
                    genericAuth.msg ===
                      "/cosmos.staking.v1beta1.MsgTokenizeShares" ||
                    genericAuth.msg ===
                      "/cosmos.staking.v1beta1.MsgEnableTokenizeShares"
                  ) {
                    setIsSendAuthzGrant(true);
                    return;
                  }
                }
              } else if (
                grantMsg.grant.authorization.typeUrl ===
                "/cosmos.bank.v1beta1.SendAuthorization"
              ) {
                setIsSendAuthzGrant(true);
                return;
              }
            }
          }
        }
      }
    } catch (e) {
      console.log("Failed to check during authz grant send check", e);
    }

    setIsSendAuthzGrant(false);
  }, [interactionData.data.origin, signDocHelper.signDocWrapper]);
  const [isSendAuthzGrantChecked, setIsSendAuthzGrantChecked] = useState(false);

  const txConfigsValidate = useTxConfigsValidate({
    senderConfig,
    gasConfig,
    amountConfig,
    feeConfig,
    memoConfig,
  });

  const preferNoSetFee = (() => {
    // 자동으로 fee를 다뤄줄 수 있는건 fee가 하나인 경우이다.
    // fee가 여러개인 경우는 일반적인 경우가 아니기 때문에
    // 케플러에서 처리해줄 수 없다. 그러므로 옵션을 무시하고 fee 설정을 각 웹사이트에 맡긴다.
    if (interactionData.data.signDocWrapper.fees.length >= 2) {
      return true;
    }

    return interactionData.data.signOptions.preferNoSetFee;
  })();

  const preferNoSetMemo = interactionData.data.signOptions.preferNoSetMemo;

  const interactionInfo = useInteractionInfo({
    onUnmount: async () => {
      signInteractionStore.rejectWithProceedNext(interactionData.id, () => {});
    },
  });

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

  const isLedgerAndDirect =
    interactionData.data.keyType === "ledger" &&
    interactionData.data.mode === "direct";

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

  const isHighFee = (() => {
    if (feeConfig.fees) {
      let sumPrice = new Dec(0);
      for (const fee of feeConfig.fees) {
        const currency = chainStore
          .getChain(chainId)
          .findCurrency(fee.currency.coinMinimalDenom);
        if (currency && currency.coinGeckoId) {
          const price = priceStore.calculatePrice(
            new CoinPretty(currency, fee.toCoin().amount),
            "usd"
          );
          if (price) {
            sumPrice = sumPrice.add(price.toDec());
          }
        }
      }
      return sumPrice.gte(new Dec(5));
    }
    return false;
  })();
  const [isHighFeeApproved, setIsHighFeeApproved] = useState(false);

  const {
    shouldTopUp,
    isTopUpAvailable,
    isTopUpInProgress,
    isInsufficientFeeWarning,
    remainingText,
    executeTopUpIfAvailable,
    topUpError,
  } = useTopUp({
    feeConfig,
    senderConfig,
    amountConfig,
    hasHardwareWalletError:
      !!ledgerInteractingError ||
      !!keystoneInteractingError ||
      isLedgerAndDirect,
  });

  const buttonDisabled =
    txConfigsValidate.interactionBlocked ||
    !signDocHelper.signDocWrapper ||
    isLedgerAndDirect ||
    (isSendAuthzGrant && !isSendAuthzGrantChecked) ||
    (isHighFee && !isHighFeeApproved) ||
    (shouldTopUp
      ? isTopUpInProgress || !isTopUpAvailable
      : isInsufficientFeeWarning);

  const approve = async () => {
    if (signDocHelper.signDocWrapper) {
      let presignOptions;
      try {
        await executeTopUpIfAvailable();

        if (interactionData.data.keyType === "ledger") {
          setIsLedgerInteracting(true);
          setLedgerInteractingError(undefined);
          presignOptions = {
            useWebHID: uiConfigStore.useWebHIDLedger,
            signEthPlainJSON: chainStore
              .getChain(
                signInteractionStore.waitingData?.data.chainId ?? chainId
              )
              .hasFeature("evm-ledger-sign-plain-json"),
          };
        } else if (interactionData.data.keyType === "keystone") {
          setIsKeystoneInteracting(true);
          setKeystoneInteractingError(undefined);
          const isEthSigning = KeyRingService.isEthermintLike(
            chainStore.getChain(chainId)
          );
          presignOptions = {
            isEthSigning,
            displayQRCode: async (ur: KeystoneUR) => {
              setKeystoneUR(ur);
            },
            scanQRCode: () =>
              new Promise<KeystoneUR>((resolve) => {
                keystoneScanResolve.current = resolve;
              }),
          };
        }

        const signature = await handleCosmosPreSign(
          interactionData,
          signDocHelper.signDocWrapper,
          presignOptions
        );

        await signInteractionStore.approveWithProceedNext(
          interactionData.id,
          signDocHelper.signDocWrapper,
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
    }
  };

  const isLavaEndpoint = (() => {
    try {
      const lavaBaseHostName = "lava.build";
      const rpcUrl = new URL(chainStore.getChain(chainId).rpc);
      const lcdUrl = new URL(chainStore.getChain(chainId).rest);

      return (
        rpcUrl.hostname.endsWith(lavaBaseHostName) ||
        lcdUrl.hostname.endsWith(lavaBaseHostName)
      );
    } catch (e) {
      console.error(e);
      return false;
    }
  })();

  const isLoading =
    signInteractionStore.isObsoleteInteractionApproved(interactionData.id) ||
    isLedgerInteracting ||
    isKeystoneInteracting ||
    isTopUpInProgress;

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
            await signInteractionStore.rejectWithProceedNext(
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
          text:
            shouldTopUp && remainingText
              ? remainingText
              : intl.formatMessage({ id: "button.approve" }),
          size: "large",
          left: !(shouldTopUp && remainingText) && !isLoading && (
            <ApproveIcon />
          ),
          disabled: buttonDisabled,
          isLoading,
          onClick: approve,
        },
      ]}
      bottomBackground={
        shouldTopUp && !interactionData.isInternal ? (
          <FeeCoverageBackground
            hideIcon={
              !!topUpError ||
              !!ledgerInteractingError ||
              !!keystoneInteractingError ||
              isSendAuthzGrant
            }
          />
        ) : undefined
      }
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
          marginBottom="0.5rem"
          style={{
            opacity: isLedgerAndDirect ? 0.5 : undefined,
          }}
        >
          <Columns sum={1} alignY="center">
            <XAxis>
              <H5
                style={{
                  color: ColorPalette["blue-400"],
                  marginRight: "0.25rem",
                }}
              >
                {msgs.length}
              </H5>
              <H5
                style={{
                  color:
                    theme.mode === "light"
                      ? ColorPalette["gray-500"]
                      : ColorPalette["gray-50"],
                }}
              >
                <FormattedMessage id="page.sign.cosmos.tx.messages" />
              </H5>
            </XAxis>
            <Column weight={1} />
            <ViewDataButton
              isViewData={isViewData}
              setIsViewData={setIsViewData}
            />
          </Columns>
        </Box>

        <SimpleBar
          autoHide={false}
          style={{
            display: "flex",
            flexDirection: "column",
            flex: !isViewData ? "0 1 auto" : 1,
            overflow: "auto",
            opacity: isLedgerAndDirect ? 0.5 : undefined,
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
                {JSON.stringify(signDocHelper.signDocJson, null, 2)}
              </Box>
            ) : (
              <Box
                style={{
                  width: "fit-content",
                  minWidth: "100%",
                }}
              >
                {msgs.map((msg, i) => {
                  const r = defaultRegistry.render(
                    chainId,
                    // XXX: defaultProtoCodec가 msgs를 rendering할때 사용되었다는 엄밀한 보장은 없다.
                    //      근데 로직상 ProtoSignDocDecoder가 defaultProtoCodec가 아닌 다른 codec을 쓰도록 만들 경우가 사실 없기 때문에
                    //      일단 이렇게 처리하고 넘어간다.
                    defaultProtoCodec,
                    msg
                  );

                  return (
                    <MessageItem
                      key={i}
                      icon={r.icon}
                      title={r.title}
                      content={r.content}
                    />
                  );
                })}
              </Box>
            )}
          </Box>
        </SimpleBar>

        <Box height="0" minHeight="0.75rem" />

        <Box
          style={{
            opacity: isLedgerAndDirect ? 0.5 : undefined,
          }}
        >
          {preferNoSetMemo ? (
            <React.Fragment>
              <ReadonlyMemo memo={memoConfig.memo} />
              <Gutter size="0.75rem" />
            </React.Fragment>
          ) : (
            <React.Fragment>
              <MemoInput
                memoConfig={memoConfig}
                placeholder={intl.formatMessage({
                  id: "components.input.memo-input.optional-placeholder",
                })}
              />
              <Gutter size="0.75rem" />
            </React.Fragment>
          )}
        </Box>

        {!isViewData ? <div style={{ flex: 1 }} /> : null}

        {isLavaEndpoint ? (
          <React.Fragment>
            <GuideBox
              title={intl.formatMessage({
                id: "page.sign.cosmos.lava.guide.title",
              })}
              paragraph={intl.formatMessage({
                id: "page.sign.cosmos.lava.guide.paragraph",
              })}
            />

            <Gutter size="0.75rem" />
          </React.Fragment>
        ) : null}

        <VerticalCollapseTransition collapsed={shouldTopUp}>
          <Box
            style={{
              opacity: isLedgerAndDirect ? 0.5 : undefined,
            }}
          >
            {/* direct aux는 수수료를 설정할수도 없으니 보여줄 필요가 없다. */}
            {"isDirectAux" in interactionData.data &&
            interactionData.data.isDirectAux
              ? null
              : (() => {
                  if (interactionData.isInternal && preferNoSetFee) {
                    return (
                      <FeeSummary feeConfig={feeConfig} gasConfig={gasConfig} />
                    );
                  }

                  return (
                    <FeeControl
                      feeConfig={feeConfig}
                      senderConfig={senderConfig}
                      gasConfig={gasConfig}
                      disableAutomaticFeeSet={preferNoSetFee}
                      isInternalMsg={interactionData.isInternal}
                      shouldTopUp={shouldTopUp}
                    />
                  );
                })()}

            {isHighFee ? (
              <React.Fragment>
                <Gutter size="0.75rem" />
                <HighFeeWarning
                  checked={isHighFeeApproved}
                  onChange={(v) => setIsHighFeeApproved(v)}
                />
              </React.Fragment>
            ) : null}
          </Box>
        </VerticalCollapseTransition>
        <VerticalCollapseTransition collapsed={!shouldTopUp}>
          {interactionData.isInternal ? (
            <FeeCoverageBox feeConfig={feeConfig} />
          ) : (
            <FeeCoverageDescription />
          )}
        </VerticalCollapseTransition>

        {isSendAuthzGrant ? (
          <React.Fragment>
            <Gutter size="0.75rem" />
            <GuideBox
              color="warning"
              title={intl.formatMessage({
                id: "page.sign.cosmos.tx.authz-send-grant.warning-title",
              })}
              titleRight={
                <Box marginLeft="1rem">
                  <Checkbox
                    checked={isSendAuthzGrantChecked}
                    onChange={(checked) => {
                      setIsSendAuthzGrantChecked(checked);
                    }}
                  />
                </Box>
              }
            />
          </React.Fragment>
        ) : null}

        {isLedgerAndDirect ? (
          <React.Fragment>
            <Gutter size="0.75rem" />
            <GuideBox
              color="warning"
              title={intl.formatMessage({
                id: "page.sign.cosmos.tx.warning-title",
              })}
              paragraph={intl.formatMessage({
                id: "page.sign.cosmos.tx.warning-paragraph",
              })}
            />
          </React.Fragment>
        ) : null}

        <LedgerGuideBox
          data={{
            keyInsensitive: interactionData.data.keyInsensitive,
            isEthereum:
              "eip712" in interactionData.data &&
              interactionData.data.eip712 != null,
          }}
          isLedgerInteracting={isLedgerInteracting}
          ledgerInteractingError={ledgerInteractingError}
          isInternal={interactionData.isInternal}
        />
        {isKeystonUSB && (
          <KeystoneUSBBox
            isKeystoneInteracting={isKeystoneInteracting}
            KeystoneInteractingError={keystoneInteractingError}
          />
        )}
        {topUpError ? (
          <GuideBox
            color="warning"
            title={topUpError.message || topUpError.toString()}
          />
        ) : null}
      </Box>
      {!isKeystonUSB && (
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
      )}
    </HeaderLayout>
  );
});

const ReadonlyMemo: FunctionComponent<{
  memo: string;
}> = ({ memo }) => {
  const theme = useTheme();

  return (
    <Box
      backgroundColor={
        theme.mode === "light" ? ColorPalette.white : ColorPalette["gray-600"]
      }
      padding="1rem"
      borderRadius="0.375rem"
      style={{
        boxShadow:
          theme.mode === "light"
            ? "0px 1px 4px 0px rgba(43, 39, 55, 0.10)"
            : undefined,
      }}
    >
      <XAxis alignY="center">
        <Subtitle3
          color={
            theme.mode === "light"
              ? ColorPalette["gray-500"]
              : ColorPalette["gray-200"]
          }
        >
          Memo
        </Subtitle3>
        <Gutter size="1.5rem" direction="horizontal" />
        <Subtitle3
          color={
            memo
              ? theme.mode === "light"
                ? ColorPalette["gray-300"]
                : ColorPalette["gray-50"]
              : theme.mode === "light"
              ? ColorPalette["gray-200"]
              : ColorPalette["gray-300"]
          }
          style={{
            flex: 1,

            textAlign: "right",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {memo || (
            <FormattedMessage id="page.sign.cosmos.tx.readonly-memo.empty" />
          )}
        </Subtitle3>
      </XAxis>
    </Box>
  );
};
