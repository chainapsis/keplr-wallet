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
import { EmptyAmountError, ZeroAmountError } from "@keplr-wallet/hooks";
import { NOBLE_CHAIN_ID } from "../../../config.ui";
import { HorizontalCollapseTransition } from "../../../components/transition/horizontal-collapse";
import { useTheme } from "styled-components";

const NOBLE_EARN_DEPOSIT_OUT_COIN_MINIMAL_DENOM = "uusdn";

export const EarnAmountPage: FunctionComponent = observer(() => {
  const theme = useTheme();
  const isLightMode = theme.mode === "light";

  const { accountStore, chainStore, queriesStore } = useStore();
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

  const amountInput = nobleEarnAmountConfig.amountConfig.value;

  const amountError = useMemo(() => {
    const uiProperties = nobleEarnAmountConfig.amountConfig.uiProperties;

    const err = uiProperties.error || uiProperties.warning;

    if (err instanceof EmptyAmountError) {
      return;
    }

    if (err instanceof ZeroAmountError) {
      return;
    }

    if (err) {
      return err.message || err.toString();
    }
  }, [nobleEarnAmountConfig.amountConfig.uiProperties]);

  const isSubmissionBlocked =
    !amountInput || amountInput === "0" || !!amountError;

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
          navigate(`/earn/confirm-usdn-estimation?amount=${amountInput}`);
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
      <Box paddingX="1.5rem" paddingTop="2.5rem">
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
          type="number"
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
                color={ColorPalette["blue-300"]}
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
