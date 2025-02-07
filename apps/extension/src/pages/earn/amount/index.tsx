import React, { FunctionComponent, useState } from "react";
import { observer } from "mobx-react-lite";
import { HeaderLayout } from "../../../layouts/header";
import { BackButton } from "../../../layouts/header/components";

import { useStore } from "../../../stores";
import { Dec } from "@keplr-wallet/unit";
import { useIntl } from "react-intl";

import { Body2, H1, Subtitle3 } from "../../../components/typography";
import { Gutter } from "../../../components/gutter";
import styled from "styled-components";
import { ColorPalette } from "../../../styles";
import { Box } from "../../../components/box";
import { XAxis } from "../../../components/axis";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ApyChip } from "../components/chip";
import { validateIsUsdcFromNoble } from "../utils";

const ZERO_DEC = new Dec("0");

export const EarnAmountPage: FunctionComponent = observer(() => {
  const { accountStore, chainStore, queriesStore } = useStore();
  const intl = useIntl();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const presetAmount = searchParams.get("amount");

  const [amountInput, setAmountInput] = useState(presetAmount || "");
  const [errorMessage, setErrorMessage] = useState("");

  const chainId = searchParams.get("chainId") || "noble-1"; // Noble testnet: "grand-1", mainnet: "noble-1"
  const chainInfo = chainStore.getChain(chainId);
  const account = accountStore.getAccount(chainId);
  const currency =
    chainInfo.currencies.find(
      (currency) =>
        currency.coinMinimalDenom === searchParams.get("coinMinimalDenom")
    ) ?? chainInfo.currencies[0];

  const balanceQuery = queriesStore
    .get(chainId)
    .queryBalances.getQueryBech32Address(account.bech32Address)
    .getBalance(currency);

  const balance = balanceQuery?.balance.hideDenom(true).toString() || "0";

  const isSubmissionBlocked =
    !amountInput ||
    new Dec(amountInput || "0").lte(ZERO_DEC) ||
    new Dec(balance).equals(ZERO_DEC) ||
    new Dec(amountInput || "0").gt(new Dec(balance));

  return (
    <HeaderLayout
      title={intl.formatMessage({ id: "page.earn.title" })}
      displayFlex={true}
      fixedHeight={true}
      left={<BackButton />}
      bottomButtons={[
        {
          disabled: isSubmissionBlocked,
          text: intl.formatMessage({ id: "button.next" }),
          color: "primary",
          size: "large",
          type: "submit",
        },
      ]}
      onSubmit={async (e) => {
        e.preventDefault();

        if (isSubmissionBlocked) {
          return;
        }

        if (validateIsUsdcFromNoble(currency, chainId)) {
          navigate(`/earn/confirm-usdn-estimation?amount=${amountInput}`);
        }
      }}
    >
      <Box paddingX="1.5rem" paddingTop="2.5rem">
        <ApyChip chainId={chainId} colorType="green" />

        <Gutter size="0.75rem" />
        <H1
          style={{
            fontWeight: 700,
            fontSize: "1.875rem",
            lineHeight: "2.25rem",
          }}
        >
          {intl.formatMessage({
            id: "page.earn.amount.input-label",
          })}
        </H1>

        <Gutter size="1.75rem" />
        <StyledTextInput
          type="number"
          placeholder={`0 ${currency?.coinDenom ?? ""}`}
          value={amountInput}
          warning={new Dec(amountInput || "0").gt(new Dec(balance))}
          onChange={(e) => {
            setAmountInput(e.target.value);
            if (new Dec(e.target.value || "0").gt(new Dec(balance))) {
              setErrorMessage(
                intl.formatMessage({
                  id: "page.earn.amount.error.insufficient-balance",
                })
              );
            } else {
              setErrorMessage("");
            }
          }}
          autoComplete="off"
        />

        {errorMessage && (
          <Box marginTop="0.75rem">
            <Body2 color={ColorPalette["red-300"]}>{errorMessage}</Body2>
          </Box>
        )}

        <Gutter size="1rem" />
        <Box paddingY="0.25rem">
          <XAxis>
            <Subtitle3 color={ColorPalette.white}>
              {balanceQuery?.balance.toString() || "0"}
            </Subtitle3>
            <Gutter size="0.25rem" />
            <Subtitle3 color={ColorPalette["gray-300"]}>
              {intl.formatMessage(
                { id: "page.earn.amount.balance.current-chain" },
                { chain: chainInfo.chainName }
              )}
            </Subtitle3>
          </XAxis>
        </Box>

        <Gutter size="0.25rem" />
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
      </Box>
    </HeaderLayout>
  );
});

const StyledTextInput = styled.input<{ warning?: boolean }>`
  font-weight: 700;
  font-size: 1.875rem;
  line-height: 2.25rem;

  width: 100%;

  background: none;
  margin: 0;
  padding: 0.25rem;
  padding-bottom: 0.75rem;

  border: 0;
  border-bottom: 1px solid
    ${(props) =>
      props.theme.mode === "light"
        ? ColorPalette["gray-200"]
        : ColorPalette["gray-300"]};

  color: ${(props) =>
    props.warning
      ? ColorPalette["red-300"]
      : props.theme.mode === "light"
      ? ColorPalette["gray-700"]
      : ColorPalette.white};

  ::placeholder {
    color: ${(props) =>
      props.theme.mode === "light"
        ? ColorPalette["gray-200"]
        : ColorPalette["gray-300"]};
  }

  // Remove normalized css properties
  outline: none;

  ::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  ::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`;
