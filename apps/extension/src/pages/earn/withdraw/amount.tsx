import React, { FunctionComponent, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import { HeaderLayout } from "../../../layouts/header";
import { BackButton } from "../../../layouts/header/components";

import { Stack } from "../../../components/stack";

import { useSearchParams } from "react-router-dom";

import { useStore } from "../../../stores";
import {
  EmptyAmountError,
  useSenderConfig,
  ZeroAmountError,
} from "@keplr-wallet/hooks";
import {
  Body2,
  H2,
  H3,
  Subtitle3,
  Subtitle4,
} from "../../../components/typography";
import { Box } from "../../../components/box";
import { Gutter } from "../../../components/gutter";
import { CoinPretty, Dec } from "@keplr-wallet/unit";
import { useIntl } from "react-intl";
import { ColorPalette } from "../../../styles";
import { Input } from "../components/input";
import { XAxis, YAxis } from "../../../components/axis";
import { LongArrowDownIcon } from "../../../components/icon/long-arrow-down";
import { useNobleEarnAmountConfig } from "@keplr-wallet/hooks-internal";

const NOBLE_EARN_WITHDRAW_OUT_COIN_MINIMAL_DENOM = "uusdc";

export const EarnWithdrawAmountPage: FunctionComponent = observer(() => {
  const { accountStore, chainStore, queriesStore } = useStore();
  const [searchParams] = useSearchParams();
  const intl = useIntl();

  const initialChainId = searchParams.get("chainId");
  const initialCoinMinimalDenom = searchParams.get("coinMinimalDenom");

  const chainId = initialChainId || chainStore.chainInfosInUI[0].chainId;
  const chainInfo = chainStore.getChain(chainId);
  const account = accountStore.getAccount(chainId);

  const coinMinimalDenom =
    initialCoinMinimalDenom || chainInfo.currencies[0].coinMinimalDenom;
  const currency = chainInfo.forceFindCurrency(coinMinimalDenom);

  const outCurrency = chainInfo.forceFindCurrency(
    NOBLE_EARN_WITHDRAW_OUT_COIN_MINIMAL_DENOM
  );

  const [errorMessage, setErrorMessage] = useState("");

  const queryBalances = queriesStore.get(chainId).queryBalances;
  const sender = account.bech32Address;
  const balance =
    queryBalances.getQueryBech32Address(sender).getBalance(currency)?.balance ??
    new CoinPretty(currency, new Dec("0"));

  const senderConfig = useSenderConfig(chainStore, chainId, sender);
  const nobleEarnAmountConfig = useNobleEarnAmountConfig(
    chainStore,
    queriesStore,
    accountStore,
    chainId,
    senderConfig,
    currency,
    outCurrency
  );

  const error = useMemo(() => {
    const uiProperties = nobleEarnAmountConfig.uiProperties;

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
  }, [nobleEarnAmountConfig.uiProperties]);

  return (
    <HeaderLayout
      title={""} // No title for this page
      displayFlex={true}
      fixedMinHeight={true}
      left={<BackButton />}
      bottomButtons={[
        {
          disabled: error != null,
          text: intl.formatMessage({ id: "button.next" }),
          color: "primary",
          size: "large",
          type: "submit",
          isLoading:
            accountStore.getAccount(chainId).isSendingMsg === "ibcTransfer",
        },
      ]}
      onSubmit={async (e) => {
        e.preventDefault();
      }}
    >
      <Box
        paddingTop="2rem"
        paddingX="1.5rem"
        style={{
          flex: 1,
        }}
      >
        <Stack flex={1}>
          <H2 color={ColorPalette["white"]}>
            {intl.formatMessage(
              { id: "page.earn.withdraw.amount.title" },
              {
                br: <br />,
              }
            )}
          </H2>

          <Gutter size="2rem" />
          <Input
            type="number"
            placeholder={balance.trim(true).toString()}
            value={nobleEarnAmountConfig.value}
            warning={error != null}
            onChange={(e) => {
              nobleEarnAmountConfig.setValue(e.target.value);
              if (new Dec(e.target.value || "0").gt(balance.toDec())) {
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
          <Gutter size="0.75rem" />
          <Box padding="0.25rem 0">
            <XAxis alignY="center">
              <Box
                padding="0.25rem 0.5rem"
                backgroundColor={ColorPalette["gray-550"]}
                borderRadius="0.5rem"
                width="fit-content"
                cursor="pointer"
                onClick={() => {
                  nobleEarnAmountConfig.setValue(
                    balance.hideDenom(true).toString()
                  );
                }}
              >
                <Subtitle4 color={ColorPalette["gray-200"]}>
                  {balance.trim(true).toString()}
                </Subtitle4>
              </Box>
              <Box padding="0.25rem">
                <Subtitle3 color={ColorPalette["gray-300"]}>
                  {`on ${chainInfo.chainName}`}
                </Subtitle3>
              </Box>
            </XAxis>
          </Box>

          {errorMessage && (
            <Box marginTop="0.75rem">
              <Body2 color={ColorPalette["red-300"]}>{errorMessage}</Body2>
            </Box>
          )}

          <YAxis alignX="center">
            <LongArrowDownIcon
              width="1.5rem"
              height="1.5rem"
              color={ColorPalette["gray-400"]}
            />
          </YAxis>
          <Gutter size="1rem" />

          <H3>
            {nobleEarnAmountConfig.expectedOutAmount.trim(true).toString()}
          </H3>
          <Gutter size="0.5rem" />
          <Subtitle3 color={ColorPalette["gray-300"]}>
            {`on ${chainInfo.chainName}`}
          </Subtitle3>
        </Stack>
      </Box>
    </HeaderLayout>
  );
});
