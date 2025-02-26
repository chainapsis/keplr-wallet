import React, { Fragment, FunctionComponent, useMemo } from "react";
import { observer } from "mobx-react-lite";
import { HeaderLayout } from "../../../layouts/header";
import { BackButton } from "../../../layouts/header/components";

import { useStore } from "../../../stores";
import { useIntl } from "react-intl";

import { Body2, H3, Subtitle3 } from "../../../components/typography";
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

const NOBLE_EARN_DEPOSIT_OUT_COIN_MINIMAL_DENOM = "uusdn";

export const EarnAmountPage: FunctionComponent = observer(() => {
  const { accountStore, chainStore, queriesStore } = useStore();
  const intl = useIntl();
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const isFromEarnTransfer = searchParams.get("isFromEarnTransfer");
  const chainId = searchParams.get("chainId") || "duke-1"; // Noble devnet: "duke-1", mainnet: "noble-1"
  const coinMinimalDenom = searchParams.get("coinMinimalDenom");

  const chainInfo = chainStore.getChain(chainId);
  const account = accountStore.getAccount(chainId);
  const currency =
    chainInfo.currencies.find(
      (currency) => currency.coinMinimalDenom === coinMinimalDenom
    ) ?? chainInfo.currencies[0];

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
      title={intl.formatMessage({ id: "page.earn.title" })}
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
      bottomButtons={
        isSubmissionBlocked
          ? undefined
          : [
              {
                text: intl.formatMessage({ id: "button.next" }),
                color: "primary",
                size: "large",
                type: "submit",
                disabled: isSubmissionBlocked,
                onClick: async () => {
                  if (isSubmissionBlocked) {
                    return;
                  }

                  if (validateIsUsdcFromNoble(currency, chainId)) {
                    navigate(
                      `/earn/confirm-usdn-estimation?amount=${amountInput}`
                    );
                  }
                },
              },
            ]
      }
    >
      <Box paddingX="1.5rem" paddingTop="2.5rem">
        <ApyChip chainId={chainId} colorType="green" />

        <Gutter size="0.75rem" />
        <H3
          style={{
            fontWeight: 700,
            fontSize: "1.875rem",
            lineHeight: "2.25rem",
          }}
        >
          {intl.formatMessage({
            id: "page.earn.amount.input-label",
          })}
        </H3>

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
        />

        {amountError && (
          <Box marginTop="0.75rem">
            <Body2 color={ColorPalette["red-300"]}>{amountError}</Body2>
          </Box>
        )}

        <Gutter size="1rem" />
        <Box paddingY="0.25rem">
          <XAxis alignY="center">
            {isSubmissionBlocked && (
              <Fragment>
                <Box
                  borderRadius="0.5rem"
                  paddingX="0.375rem"
                  paddingY="0.25rem"
                  cursor="pointer"
                  backgroundColor={ColorPalette["gray-550"]}
                  onClick={maximizeInput}
                >
                  <Subtitle3 color={ColorPalette["gray-200"]}>
                    {balanceQuery?.balance.shrink(true).toString() || "0"}
                  </Subtitle3>
                </Box>
                <Gutter size="0.25rem" />
              </Fragment>
            )}
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
