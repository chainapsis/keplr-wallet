import React, { FunctionComponent, useEffect, useState, useMemo } from "react";
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
import { KEPLR_EXTS_MEMO } from "../../../config.ui";
import debounce from "lodash.debounce";
import { logNobleClaimAnalytics } from "../../../analytics-amplitude";
import { XAxis } from "../../../components/axis";
import { Tooltip } from "../../../components/tooltip";

export const EarnOverviewClaimSection: FunctionComponent<{
  chainId: string;
  currency: Currency;
}> = observer(({ chainId, currency }) => {
  const theme = useTheme();
  const isLightMode = theme.mode === "light";

  const intl = useIntl();
  const navigate = useNavigate();
  const { queriesStore, accountStore, analyticsAmplitudeStore, chainStore } =
    useStore();

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
        KEPLR_EXTS_MEMO,
        {
          preferNoSetMemo: true,
        },
        {
          onBroadcasted: () => {
            navigate("/tx-result/pending");

            logNobleClaimAnalytics(
              chainStore,
              queriesStore,
              accountStore,
              analyticsAmplitudeStore,
              "click_approve_btn_usdn_claim_tx_sign"
            );
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

  const totalYieldNum = Number(totalYield.toDec().toString());

  const debouncedLogging = useMemo(
    () =>
      debounce((yieldNum: number) => {
        analyticsAmplitudeStore.logEvent("view_earn_overview", {
          nobleEarnClaimAmount: yieldNum,
        });
        analyticsAmplitudeStore.setUserProperties({
          noble_earn_claim_amount: yieldNum,
        });
      }, 500),
    [analyticsAmplitudeStore]
  );

  useEffect(() => {
    debouncedLogging(totalYieldNum);

    return () => {
      debouncedLogging.cancel();
    };
  }, [debouncedLogging, totalYieldNum]);

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
          <XAxis>
            <Subtitle3
              color={
                isLightMode
                  ? ColorPalette["gray-400"]
                  : ColorPalette["gray-200"]
              }
            >
              <FormattedMessage id="page.earn.overview.claim-section.total-claimed" />
            </Subtitle3>
            <Tooltip
              content={intl.formatMessage({
                id: "page.earn.overview.claim-section.total-claimed-tooltip",
              })}
            >
              <Box alignY="center" marginLeft="0.25rem">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="17"
                  viewBox="0 0 16 17"
                  fill="none"
                >
                  <path
                    d="M7.5 8L7.52766 7.98617C7.90974 7.79513 8.33994 8.14023 8.23634 8.55465L7.76366 10.4453C7.66006 10.8598 8.09026 11.2049 8.47234 11.0138L8.5 11M14 8.5C14 11.8137 11.3137 14.5 8 14.5C4.68629 14.5 2 11.8137 2 8.5C2 5.18629 4.68629 2.5 8 2.5C11.3137 2.5 14 5.18629 14 8.5ZM8 6H8.005V6.005H8V6Z"
                    stroke="#ABABB5"
                    strokeWidth="1.66667"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Box>
            </Tooltip>
          </XAxis>
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
