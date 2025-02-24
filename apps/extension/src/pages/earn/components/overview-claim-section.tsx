import React, { FunctionComponent } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { useStore } from "../../../stores";
import { Box } from "../../../components/box";
import { Subtitle3, H4 } from "../../../components/typography";
import { ColorPalette } from "../../../styles";
import { Button } from "../../../components/button";
import { Gutter } from "../../../components/gutter";
import { CoinPretty } from "@keplr-wallet/unit";
import { Currency } from "@keplr-wallet/types";
import { observer } from "mobx-react-lite";

export const EarnOverviewClaimSection: FunctionComponent<{
  rest: string;
  bech32Address?: string;
  currency: Currency;
}> = observer(({ rest, bech32Address, currency }) => {
  const intl = useIntl();

  const { queriesStore } = useStore();

  // TO-DO: use readymade query later
  const claimableAmountRes = queriesStore.simpleQuery.queryGet<{
    claimable_amount: string;
  }>(rest, `/noble/dollar/v1/yield/${bech32Address}`);
  const claimableAmount =
    claimableAmountRes.response?.data?.claimable_amount ?? "0";

  const totalAmount = "0"; // TO-DO: use total amount from Satellite

  return (
    <Box paddingX="1.25rem">
      <Box
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          gap: "1.25rem",
        }}
      >
        <Box width="50%">
          <Subtitle3 color={ColorPalette["gray-200"]}>
            <FormattedMessage id="page.earn.overview.claim-section.claimable-reward" />
          </Subtitle3>
          <Gutter size="0.875rem" />
          <H4 color={ColorPalette["green-400"]}>
            {new CoinPretty(currency, claimableAmount)
              .hideDenom(true)
              .trim(true)
              .toString()}
          </H4>
        </Box>
        <Box width="50%">
          <Subtitle3 color={ColorPalette["gray-200"]}>
            <FormattedMessage id="page.earn.overview.claim-section.total-claimed" />
          </Subtitle3>
          <Gutter size="0.875rem" />
          <H4 color={ColorPalette.white}>{totalAmount}</H4>
        </Box>
      </Box>

      <Gutter size="1rem" />

      <Button
        text={intl.formatMessage({
          id: "page.earn.overview.claim-section.claim-button",
        })}
        color="primary"
        size="medium"
        disabled={claimableAmount === "0"}
        onClick={() => {
          // TODO: Implement claim
        }}
      />
    </Box>
  );
});
