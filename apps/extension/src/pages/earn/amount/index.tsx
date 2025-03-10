import React, { FunctionComponent, useMemo } from "react";
import { observer } from "mobx-react-lite";
import { HeaderLayout } from "../../../layouts/header";
import { BackButton } from "../../../layouts/header/components";

import { useStore } from "../../../stores";
import { useIntl } from "react-intl";

import { Body2, MobileH3, Subtitle3 } from "../../../components/typography";
import { Gutter } from "../../../components/gutter";
import { ColorPalette } from "../../../styles";
import { Box } from "../../../components/box";
import { XAxis } from "../../../components/axis";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ApyChip } from "../components/chip";
import { validateIsUsdcFromNoble } from "../utils";
import { Input } from "../components/input";
import { useNobleEarnAmountConfig } from "@keplr-wallet/hooks-internal";
import {
  EmptyAmountError,
  InsufficientFeeError,
  useGasSimulator,
  ZeroAmountError,
} from "@keplr-wallet/hooks";
import { NOBLE_CHAIN_ID } from "../../../config.ui";
import { HorizontalCollapseTransition } from "../../../components/transition/horizontal-collapse";
import { useTheme } from "styled-components";
import {
  useAutoFeeCurrencySelectionOnInit,
  useFeeOptionSelectionOnInit,
} from "../../../components/input/fee-control";
import { ExtensionKVStore } from "@keplr-wallet/common";
import { Dec } from "@keplr-wallet/unit";

const NOBLE_EARN_DEPOSIT_OUT_COIN_MINIMAL_DENOM = "uusdn";

export const EarnAmountPage: FunctionComponent = observer(() => {
  const theme = useTheme();
  const isLightMode = theme.mode === "light";

  const { accountStore, chainStore, queriesStore, uiConfigStore } = useStore();
  const intl = useIntl();
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const isFromEarnTransfer = searchParams.get("isFromEarnTransfer");
  const chainId = searchParams.get("chainId") || NOBLE_CHAIN_ID;
  const coinMinimalDenom = searchParams.get("coinMinimalDenom") || "uusdc";

  const chainInfo = chainStore.getChain(chainId);
  const account = accountStore.getAccount(chainId);
  const currency = chainInfo.forceFindCurrency(coinMinimalDenom);

  const balanceQuery = queriesStore
    .get(chainId)
    .queryBalances.getQueryBech32Address(account.bech32Address)
    .getBalance(currency);

  const sender = account.bech32Address;
  const outCurrency = chainInfo.forceFindCurrency(
    NOBLE_EARN_DEPOSIT_OUT_COIN_MINIMAL_DENOM
  );

  const nobleEarnAmountConfig = useNobleEarnAmountConfig(
    chainStore,
    queriesStore,
    accountStore,
    chainId,
    sender,
    currency,
    outCurrency
  );

  // XXX: 원래는 밑의 처리를 FeeControl component에서 해야하지만 이 UI에는 그런게 없기 때문에 따로 불러줘야 함
  useFeeOptionSelectionOnInit(
    uiConfigStore,
    nobleEarnAmountConfig.feeConfig,
    false
  );
  useAutoFeeCurrencySelectionOnInit(
    chainStore,
    queriesStore,
    nobleEarnAmountConfig.senderConfig,
    nobleEarnAmountConfig.feeConfig,
    false
  );

  useGasSimulator(
    new ExtensionKVStore("gas-simulator.earn.swap"),
    chainStore,
    NOBLE_CHAIN_ID,
    nobleEarnAmountConfig.gasConfig,
    nobleEarnAmountConfig.feeConfig,
    "noble-earn-deposit",
    () => {
      if (!nobleEarnAmountConfig.amountConfig.currency) {
        throw new Error("Deposit currency not set");
      }

      if (
        nobleEarnAmountConfig.amountConfig.uiProperties.loadingState ===
          "loading-block" ||
        nobleEarnAmountConfig.amountConfig.uiProperties.error != null
      ) {
        throw new Error("Not ready to simulate tx");
      }

      return account.noble.makeSwapTx(
        "noble-earn-deposit",
        nobleEarnAmountConfig.amountConfig.amount[0].toDec().toString(),
        currency,
        nobleEarnAmountConfig.amountConfig.minOutAmount.toDec().toString(),
        outCurrency,
        [
          {
            poolId:
              nobleEarnAmountConfig.amountConfig.pool?.id.toString() ?? "",
            denomTo: outCurrency.coinMinimalDenom,
          },
        ]
      );
    }
  );

  const amountInput = nobleEarnAmountConfig.amountConfig.value;

  const amountError = useMemo(() => {
    const amountUiPropertiesErr =
      nobleEarnAmountConfig.amountConfig.uiProperties.error ||
      nobleEarnAmountConfig.amountConfig.uiProperties.warning;
    const feeUiPropertiesErr =
      nobleEarnAmountConfig.feeConfig.uiProperties.error ||
      nobleEarnAmountConfig.feeConfig.uiProperties.warning;

    if (amountUiPropertiesErr instanceof EmptyAmountError) {
      return;
    }

    if (amountUiPropertiesErr instanceof ZeroAmountError) {
      if (feeUiPropertiesErr instanceof InsufficientFeeError) {
        return feeUiPropertiesErr.message || feeUiPropertiesErr.toString();
      }

      return;
    }

    const err = amountUiPropertiesErr || feeUiPropertiesErr;

    if (err) {
      return err.message || err.toString();
    }
  }, [
    nobleEarnAmountConfig.amountConfig.uiProperties.error,
    nobleEarnAmountConfig.amountConfig.uiProperties.warning,
    nobleEarnAmountConfig.feeConfig.uiProperties.error,
    nobleEarnAmountConfig.feeConfig.uiProperties.warning,
  ]);

  const isSubmissionBlocked =
    nobleEarnAmountConfig.amountConfig.amount[0].toDec().equals(new Dec("0")) ||
    !!amountError;

  function maximizeInput() {
    nobleEarnAmountConfig.amountConfig.setFraction(1);
  }

  return (
    <HeaderLayout
      title=""
      displayFlex={true}
      fixedHeight={true}
      left={
        <BackButton
          {...(isFromEarnTransfer
            ? {
                onClick: () => {
                  navigate("/");
                },
              }
            : {})}
        />
      }
      onSubmit={(e) => {
        e.preventDefault();

        if (isSubmissionBlocked) {
          return;
        }

        if (validateIsUsdcFromNoble(currency, chainId)) {
          navigate(
            `/earn/confirm-usdn-estimation?amount=${amountInput}&gas=${nobleEarnAmountConfig.gasConfig.gas.toString()}&feeCurrency=${(() => {
              if (
                nobleEarnAmountConfig.feeConfig.toStdFee().amount.length > 0
              ) {
                return nobleEarnAmountConfig.feeConfig.toStdFee().amount[0]
                  .denom;
              }
              return "unknown";
            })()}&feeType=${nobleEarnAmountConfig.feeConfig.type}&isMax=${
              nobleEarnAmountConfig.amountConfig.fraction === 1
                ? "true"
                : "false"
            }`
          );
        }
      }}
      animatedBottomButtons={true}
      hideBottomButtons={isSubmissionBlocked}
      bottomButtons={[
        {
          text: intl.formatMessage({ id: "button.next" }),
          color: "primary",
          size: "large",
          type: "submit",
        },
      ]}
    >
      <Box paddingX="1.5rem" paddingTop="1.75rem">
        <ApyChip chainId={chainId} colorType="green" />

        <Gutter size="0.75rem" />
        <MobileH3
          style={{
            fontWeight: 700,
            fontSize: "1.875rem",
            lineHeight: "2.25rem",
          }}
        >
          {intl.formatMessage({
            id: "page.earn.amount.input-label",
          })}
        </MobileH3>

        <Gutter size="1.75rem" />
        <Input
          type="text"
          placeholder={`0 ${currency?.coinDenom ?? ""}`}
          value={amountInput}
          warning={amountError != null}
          onChange={(e) => {
            nobleEarnAmountConfig.amountConfig.setValue(e.target.value);
          }}
          autoComplete="off"
          suffix={currency?.coinDenom ?? ""}
        />

        {amountError && (
          <Box marginTop="0.75rem">
            <Body2 color={ColorPalette["red-300"]}>{amountError}</Body2>
          </Box>
        )}

        <Gutter size="1rem" />
        <Box paddingY="0.25rem">
          <XAxis alignY="center">
            <HorizontalCollapseTransition collapsed={!isSubmissionBlocked}>
              <XAxis alignY="center">
                <Box
                  borderRadius="0.5rem"
                  paddingX="0.375rem"
                  paddingY="0.25rem"
                  cursor="pointer"
                  backgroundColor={
                    isLightMode
                      ? ColorPalette["gray-50"]
                      : ColorPalette["gray-550"]
                  }
                  onClick={maximizeInput}
                  hover={{
                    backgroundColor: isLightMode
                      ? ColorPalette["gray-10"]
                      : ColorPalette["gray-500"],
                  }}
                >
                  <Subtitle3
                    color={
                      isLightMode
                        ? ColorPalette["gray-400"]
                        : ColorPalette["gray-200"]
                    }
                    style={{
                      whiteSpace: "nowrap",
                    }}
                  >
                    {balanceQuery?.balance.shrink(true).toString() || "0"}
                  </Subtitle3>
                </Box>
                <Gutter size="0.25rem" />
              </XAxis>
            </HorizontalCollapseTransition>
            <Subtitle3 color={ColorPalette["gray-300"]}>
              {intl.formatMessage(
                { id: "page.earn.amount.balance.current-chain" },
                { chain: chainInfo.chainName }
              )}
            </Subtitle3>
          </XAxis>
        </Box>

        <Gutter size="0.25rem" />
        {isSubmissionBlocked && (
          <Box paddingY="0.25rem">
            <XAxis>
              <Subtitle3
                color={ColorPalette["gray-300"]}
                style={{
                  fontStyle: "italic",
                }}
              >
                {intl.formatMessage(
                  { id: "page.earn.amount.balance.transfer.label" },
                  { tokenName: currency?.coinDenom }
                )}
              </Subtitle3>
              <Gutter size="0.375rem" />
              <Subtitle3
                onClick={() => {
                  navigate("/earn/transfer/intro");
                }}
                style={{
                  textDecoration: "underline",
                  cursor: "pointer",
                  userSelect: "none",
                }}
                color={
                  isLightMode
                    ? ColorPalette["blue-500"]
                    : ColorPalette["blue-300"]
                }
                hoverColor={
                  isLightMode
                    ? ColorPalette["blue-300"]
                    : ColorPalette["blue-200"]
                }
              >
                {intl.formatMessage({
                  id: "page.earn.amount.balance.transfer.button",
                })}
              </Subtitle3>
            </XAxis>
          </Box>
        )}
      </Box>
    </HeaderLayout>
  );
});
