import React, { FunctionComponent, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { useStore } from "../../../stores";
import { Box } from "../../../components/box";
import { Subtitle3, H4 } from "../../../components/typography";
import { ColorPalette } from "../../../styles";
import { Button } from "../../../components/button";
import { Gutter } from "../../../components/gutter";
import { CoinPretty, Dec, Int } from "@keplr-wallet/unit";
import { Currency } from "@keplr-wallet/types";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router";
import { useTheme } from "styled-components";

export const EarnOverviewClaimSection: FunctionComponent<{
  chainId: string;
  currency: Currency;
}> = observer(({ chainId, currency }) => {
  const theme = useTheme();
  const isLightMode = theme.mode === "light";

  const intl = useIntl();
  const navigate = useNavigate();
  const { queriesStore, accountStore } = useStore();

  const account = accountStore.getAccount(chainId);

  const claimableAmount = queriesStore
    .get(chainId)
    .noble.queryYield.getQueryBech32Address(
      account.bech32Address
    ).claimableAmount;

  const response = queriesStore.simpleQuery.queryGet<{
    totalYield: string;
    updatedAt: string;
  }>(
    process.env["KEPLR_EXT_TX_HISTORY_BASE_URL"],
    `/noble-yield/${account.bech32Address}`
  );

  const totalYield = new CoinPretty(
    currency,
    response.response?.data?.totalYield ?? "0"
  );

  const [isSimulating, setIsSimulating] = useState(false);

  async function handleClaim() {
    const defaultGas = 60000;

    try {
      const tx = account.noble.makeClaimYieldTx("noble-earn-claim-yield");
      let gas = new Int(defaultGas);

      try {
        setIsSimulating(true);

        const simulated = await tx.simulate();
        gas = new Dec(simulated.gasUsed * 1.8).truncate();
      } catch (e) {
        console.error(e);
      } finally {
        setIsSimulating(false);
      }

      await tx.send(
        {
          gas: gas.toString(),
          amount: [],
        },
        "",
        {},
        {
          onBroadcasted: () => {
            navigate("/tx-result/pending");

            // TODO: Log analytics
          },
          onFulfill: (tx: any) => {
            if (tx.code != null && tx.code !== 0) {
              console.log(tx.log ?? tx.raw_log);
              navigate("/tx-result/failed");

              return;
            }

            navigate("/tx-result/success");
          },
        }
      );
    } catch (e) {
      if (e?.message === "Request rejected") {
        return;
      }
      console.error(e);
      navigate("/tx-result/failed");
    }
  }

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
          <Subtitle3
            color={
              isLightMode ? ColorPalette["gray-400"] : ColorPalette["gray-200"]
            }
          >
            <FormattedMessage id="page.earn.overview.claim-section.claimable-reward" />
          </Subtitle3>
          <Gutter size="0.875rem" />
          <H4
            color={
              isLightMode
                ? ColorPalette["green-600"]
                : ColorPalette["green-400"]
            }
          >
            {new CoinPretty(currency, claimableAmount)
              .hideDenom(true)
              .trim(true)
              .toString()}
          </H4>
        </Box>
        <Box width="50%">
          <Subtitle3
            color={
              isLightMode ? ColorPalette["gray-400"] : ColorPalette["gray-200"]
            }
          >
            <FormattedMessage id="page.earn.overview.claim-section.total-claimed" />
          </Subtitle3>
          <Gutter size="0.875rem" />
          <H4
            color={isLightMode ? ColorPalette["gray-700"] : ColorPalette.white}
          >
            {totalYield.shrink(true).hideDenom(true).toString()}
          </H4>
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
        onClick={handleClaim}
        isLoading={isSimulating}
      />
    </Box>
  );
});
